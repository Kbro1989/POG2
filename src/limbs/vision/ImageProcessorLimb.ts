import sharp from 'sharp';
declare module 'sharp';
import { existsSync } from 'fs';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('ImageProcessorLimb');

export interface RGB { r: number; g: number; b: number }
export interface PaletteColor { id: number; rgb: RGB; hex: string; textColor: string; count: number }
export interface Region { id: number; colorId: number; pixels: number[]; centroid: { x: number; y: number }; borderPixels: number[] }
export interface ProcessedImage { originalWidth: number; originalHeight: number; regions: Region[]; palette: PaletteColor[]; pixelData: Uint8ClampedArray; regionMap: Int32Array }
export type QutritState = 0 | 1 | 2;
export interface QutritRegion extends Region { qutritState: QutritState }
export interface QutritProcessedImage extends ProcessedImage { qutritRegions: QutritRegion[]; regionStateMap: Int8Array }

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
function getContrastColor(r: number, g: number, b: number): string {
  return (r * 299 + g * 587 + b * 114) / 1000 >= 128 ? '#000000' : '#ffffff';
}
function colorDistSq(c1: RGB, c2: RGB): number {
  return (c1.r - c2.r) ** 2 + (c1.g - c2.g) ** 2 + (c1.b - c2.b) ** 2;
}
function colorToQutritState(rgb: RGB): QutritState {
  const lum = rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114;
  if (lum > 170) return 0;
  if (lum > 85) return 1;
  return 2;
}

export class ImageProcessorLimb {
  private static instance: ImageProcessorLimb | null = null;
  private constructor() {}
  public static getInstance(): ImageProcessorLimb {
    if (!ImageProcessorLimb.instance) ImageProcessorLimb.instance = new ImageProcessorLimb();
    return ImageProcessorLimb.instance;
  }

  public async process(imagePath: string, maxColors = 48): Promise<QutritProcessedImage> {
    if (!existsSync(imagePath)) throw new Error(`ImageProcessorLimb: file not found at ${imagePath}`);
    logger.info({ imagePath, maxColors }, 'Processing image for quantum mask ingestion');
    const { data, info } = await sharp(imagePath).raw().toBuffer({ resolveWithObject: true });
    const width = info.width;
    const height = info.height;
    const pixelCount = width * height;
    const rgba = new Uint8ClampedArray(data);
    const { centroids, remappedAssignments, palette } = this.kMeans(rgba, pixelCount, maxColors);

    const regionMap = new Int32Array(pixelCount).fill(-1);
    const visited = new Uint8Array(pixelCount);
    const stack = new Int32Array(pixelCount);
    const regions: Region[] = [];
    let currentRegionId = 0;

    for (let i = 0; i < pixelCount; i++) {
      if (visited[i]) continue;
      const colorIdx = remappedAssignments[i];
      let stackPtr = 0;
      stack[stackPtr++] = i;
      visited[i] = 1;
      const regionPixels: number[] = [];
      while (stackPtr > 0) {
        const pIdx = stack[--stackPtr];
        regionMap[pIdx] = currentRegionId;
        regionPixels.push(pIdx);
        const px = pIdx % width;
        const neighbors = [pIdx - width, pIdx + width, px > 0 ? pIdx - 1 : -1, px < width - 1 ? pIdx + 1 : -1];
        for (const nIdx of neighbors) {
          if (nIdx >= 0 && nIdx < pixelCount && !visited[nIdx] && remappedAssignments[nIdx] === colorIdx) {
            visited[nIdx] = 1;
            stack[stackPtr++] = nIdx;
          }
        }
      }
      regions.push({ id: currentRegionId, colorId: colorIdx, pixels: regionPixels, centroid: { x: 0, y: 0 }, borderPixels: [] });
      currentRegionId++;
    }

    const regionObjMap = new Map<number, Region>();
    regions.forEach((r) => regionObjMap.set(r.id, r));
    const activeRegions = new Set(regions.map((r) => r.id));
    const dynamicMinSize = Math.max(20, Math.floor(pixelCount / 40000));
    const sortedRegionIds: number[] = [];
    activeRegions.forEach((id) => sortedRegionIds.push(id));
    sortedRegionIds.sort((a, b) => (regionObjMap.get(a)?.pixels.length || 0) - (regionObjMap.get(b)?.pixels.length || 0));

    for (const rId of sortedRegionIds) {
      const region = regionObjMap.get(rId);
      if (!region || region.pixels.length >= dynamicMinSize) continue;
      const neighbors = new Set<number>();
      for (const pIdx of region.pixels) {
        const px = pIdx % width;
        const adjs = [pIdx - width, pIdx + width, px > 0 ? pIdx - 1 : -1, px < width - 1 ? pIdx + 1 : -1];
        for (const adj of adjs) {
          if (adj >= 0 && adj < pixelCount) {
            const neighborId = regionMap[adj];
            if (neighborId !== region.id && activeRegions.has(neighborId)) neighbors.add(neighborId);
          }
        }
      }
      let bestNeighbor = -1;
      let minColorDiff = Infinity;
      for (const nid of neighbors) {
        const neighbor = regionObjMap.get(nid)!;
        const diff = colorDistSq(palette[region.colorId].rgb, palette[neighbor.colorId].rgb);
        if (diff < minColorDiff) { minColorDiff = diff; bestNeighbor = nid; }
      }
      if (bestNeighbor !== -1) {
        const target = regionObjMap.get(bestNeighbor)!;
        for (const p of region.pixels) { regionMap[p] = bestNeighbor; target.pixels.push(p); }
        activeRegions.delete(region.id);
      }
    }

    const finalRegions: Region[] = [];
    activeRegions.forEach((id) => { const r = regionObjMap.get(id); if (r) finalRegions.push(r); });

    for (const region of finalRegions) {
      let sumX = 0;
      let sumY = 0;
      const borders: number[] = [];
      for (const pIdx of region.pixels) {
        const px = pIdx % width;
        const py = Math.floor(pIdx / width);
        sumX += px;
        sumY += py;
        const adjs = [pIdx - width, pIdx + width, px > 0 ? pIdx - 1 : -1, px < width - 1 ? pIdx + 1 : -1];
        let isBorder = false;
        for (const nIdx of adjs) {
          if (nIdx < 0 || nIdx >= pixelCount || regionMap[nIdx] !== region.id) { isBorder = true; break; }
        }
        if (isBorder) borders.push(pIdx);
      }
      region.borderPixels = borders;
      let cx = Math.round(sumX / region.pixels.length);
      let cy = Math.round(sumY / region.pixels.length);
      const cIdx = cy * width + cx;
      if (regionMap[cIdx] !== region.id) {
        let minD = Infinity;
        let bestP = region.pixels[0];
        const step = Math.max(1, Math.floor(region.pixels.length / 100));
        for (let i = 0; i < region.pixels.length; i += step) {
          const p = region.pixels[i];
          const d = (p % width - cx) ** 2 + (Math.floor(p / width) - cy) ** 2;
          if (d < minD) { minD = d; bestP = p; }
        }
        cx = bestP % width;
        cy = Math.floor(bestP / width);
      }
      region.centroid = { x: cx, y: cy };
      palette[region.colorId].count += region.pixels.length;
    }

    const qutritRegions: QutritRegion[] = finalRegions.map((r) => ({ ...r, qutritState: colorToQutritState(palette[r.colorId].rgb) }));
    const regionStateMap = new Int8Array(pixelCount);
    for (const r of qutritRegions) for (const p of r.pixels) regionStateMap[p] = r.qutritState;

    return { originalWidth: width, originalHeight: height, regions: finalRegions, palette, pixelData: rgba, regionMap, qutritRegions, regionStateMap };
  }

  private kMeans(data: Uint8ClampedArray, pixelCount: number, maxColors: number): {
    centroids: RGB[];
    assignments: Int8Array;
    remappedAssignments: Int8Array;
    palette: PaletteColor[];
  } {
    const centroids: RGB[] = [];
    let rIdx = Math.floor(Math.random() * pixelCount) * 4;
    centroids.push({ r: data[rIdx], g: data[rIdx + 1], b: data[rIdx + 2] });
    for (let i = 1; i < maxColors; i++) {
      rIdx = Math.floor(Math.random() * pixelCount) * 4;
      centroids.push({ r: data[rIdx], g: data[rIdx + 1], b: data[rIdx + 2] });
    }

    const assignments = new Int8Array(pixelCount);
    const iterations = 10;

    for (let iter = 0; iter < iterations; iter++) {
      const sums = new Float64Array(maxColors * 3);
      const counts = new Int32Array(maxColors);
      for (let i = 0; i < pixelCount; i++) {
        const r = data[i * 4];
        const g = data[i * 4 + 1];
        const b = data[i * 4 + 2];
        let minDist = Infinity;
        let bestCluster = 0;
        for (let c = 0; c < maxColors; c++) {
          const d = (r - centroids[c].r) ** 2 + (g - centroids[c].g) ** 2 + (b - centroids[c].b) ** 2;
          if (d < minDist) { minDist = d; bestCluster = c; }
        }
        assignments[i] = bestCluster;
        sums[bestCluster * 3] += r;
        sums[bestCluster * 3 + 1] += g;
        sums[bestCluster * 3 + 2] += b;
        counts[bestCluster]++;
      }

      let changed = false;
      for (let c = 0; c < maxColors; c++) {
        if (counts[c] > 0) {
          const nr = Math.round(sums[c * 3] / counts[c]);
          const ng = Math.round(sums[c * 3 + 1] / counts[c]);
          const nb = Math.round(sums[c * 3 + 2] / counts[c]);
          if (nr !== centroids[c].r || ng !== centroids[c].g || nb !== centroids[c].b) { centroids[c] = { r: nr, g: ng, b: nb }; changed = true; }
        }
      }
      if (!changed) break;
    }

    const seen = new Set<number>();
    const uniqueIndices: number[] = [];
    for (let i = 0; i < assignments.length; i++) {
      const v = assignments[i];
      if (!seen.has(v)) { seen.add(v); uniqueIndices.push(v); }
    }
    uniqueIndices.sort((a, b) => a - b);

    const remappedAssignments = new Int8Array(pixelCount);
    for (let i = 0; i < pixelCount; i++) remappedAssignments[i] = uniqueIndices.indexOf(assignments[i]);

    const tempPalette: PaletteColor[] = uniqueIndices.map((oldIdx, newIdx) => ({
      id: newIdx + 1,
      rgb: centroids[oldIdx],
      hex: rgbToHex(centroids[oldIdx].r, centroids[oldIdx].g, centroids[oldIdx].b),
      textColor: getContrastColor(centroids[oldIdx].r, centroids[oldIdx].g, centroids[oldIdx].b),
      count: 0,
    }));

    return { centroids, assignments, remappedAssignments, palette: tempPalette };
  }

  public summarizeQutritRegions(result: QutritProcessedImage) {
    return result.qutritRegions
      .sort((a, b) => b.pixels.length - a.pixels.length)
      .slice(0, 6)
      .map((r) => ({ regionId: r.id, colorId: r.colorId, qutritState: r.qutritState, pixelCount: r.pixels.length, centroid: r.centroid, hex: result.palette[r.colorId].hex }));
  }
}

export default ImageProcessorLimb;
