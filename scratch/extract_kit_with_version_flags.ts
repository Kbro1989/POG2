import { createRequire } from 'module';
import * as path from 'path';
import * as fs from 'fs/promises';

const require = createRequire(import.meta.url);
const inspectorPath = 'C:/Users/krist/Desktop/rsmv';
const sqlitePath = path.join(inspectorPath, 'src/cache/sqlite.ts');

const { GameCacheLoader } = require(sqlitePath);
const { parse } = require(path.join(inspectorPath, 'src/opdecoder.ts'));

const CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape';
const KIT_IDS = [12428, 31149, 37641, 420];
const OUT_DIR = 'C:/Users/krist/.gemini/antigravity/scratch/pog2/public/models';

interface KitMesh {
  positions: number[];
  normals: number[];
  uvs: number[];
  indices: number[];
  submeshes: Array<{ materialArgument: number; indexOffset: number; indexCount: number }>;
  metadata: {
    vertexCount: number;
    faceCount: number;
    submeshCount: number;
    betaFormat: number;
    betaVersion: number;
    interactionFlagCount: number;
    interactionFlags: string[];
  };
}

function scoreInteractionFlags(modelId: number, vertexCount: number, submeshCount: number, hasIndices: boolean, hasNormals: boolean, hasUvs: number): { count: number; flags: string[] } {
  const flags: string[] = [];
  let count = 0;
  if (vertexCount > 0) { flags.push('has_vertices'); count++; }
  if (submeshCount > 1) { flags.push(`submeshes_${submeshCount}`); count++; }
  if (hasIndices) { flags.push('has_indices'); count++; }
  if (hasNormals) { flags.push('has_normals'); count++; }
  if (hasUvs > 0) { flags.push('has_uvs'); count++; }
  if (modelId === 420) { flags.push('base_model'); count++; }
  if (vertexCount > 500) { flags.push('high_poly'); count++; }
  return { count, flags };
}

async function extractModel(cache: any, modelId: number): Promise<Buffer | null> {
  try {
    const buf = await cache.getFile(47, modelId);
    return buf;
  } catch (e: any) {
    console.error(`Model ${modelId} extraction failed:`, e.message);
    return null;
  }
}

async function decodeModel(buf: Buffer, cache: any, modelId: number): Promise<any> {
  try {
    const model = parse.models.read(buf, cache, { clientVersion: 1149 });
    return model;
  } catch (e: any) {
    console.error(`Model ${modelId} parsing failed:`, e.message);
    return null;
  }
}

function buildKitMesh(model: any, modelId: number): KitMesh {
  const meshdata = model.meshdata || {};
  const positions = Array.from(meshdata.positionBuffer || []);
  const normals = meshdata.normalBuffer ? Array.from(meshdata.normalBuffer) : [];
  const uvs = meshdata.uvBuffer ? Array.from(meshdata.uvBuffer).map((v: number) => v / 65536.0) : [];
  const renders = meshdata.renders || [];

  const allIndices: number[] = [];
  const submeshes: KitMesh['submeshes'] = [];

  for (let i = 0; i < renders.length; i++) {
    const render = renders[i];
    if (!render.buf || render.buf.length === 0) continue;
    if (render.isHidden) continue;

    const indices = Array.from(render.buf);
    submeshes.push({ materialArgument: render.materialArgument || 0, indexOffset: allIndices.length, indexCount: indices.length });
    allIndices.push(...indices);
  }

  const interaction = scoreInteractionFlags(modelId, positions.length / 3, submeshes.length, allIndices.length > 0, normals.length > 0, uvs.length);

  return {
    positions,
    normals,
    uvs,
    indices: allIndices,
    submeshes,
    metadata: {
      vertexCount: positions.length / 3,
      faceCount: allIndices.length / 3,
      submeshCount: submeshes.length,
      betaFormat: model.format,
      betaVersion: model.version,
      interactionFlagCount: interaction.count,
      interactionFlags: interaction.flags,
    }
  };
}

async function main() {
  console.log('=== KIT EXTRACTION WITH INTERACTION FLAGS ===\n');
  const cache = new GameCacheLoader(CACHE_PATH);
  await fs.mkdir(OUT_DIR, { recursive: true });

  const timestamp = new Date().toISOString();
  const summary: any = { timestamp, extracted: [], fullModelId: null };

  for (const modelId of KIT_IDS) {
    console.log(`Processing kit model: ${modelId}...`);
    const buf = await extractModel(cache, modelId);
    if (!buf) continue;

    const model = await decodeModel(buf, cache, modelId);
    if (!model) continue;

    const kit = buildKitMesh(model, modelId);
    const outPath = path.join(OUT_DIR, `kit_${modelId}.json`);
    await fs.writeFile(outPath, JSON.stringify(kit, null, 2));
    console.log(`  -> wrote ${outPath} | vertices=${kit.metadata.vertexCount} faces=${kit.metadata.faceCount} flags=${kit.metadata.interactionFlagCount}`);

    summary.extracted.push({
      modelId,
      vertexCount: kit.metadata.vertexCount,
      faceCount: kit.metadata.faceCount,
      submeshCount: kit.metadata.submeshCount,
      interactionFlagCount: kit.metadata.interactionFlagCount,
      interactionFlags: kit.metadata.interactionFlags,
    });

    if (!summary.fullModelId || kit.metadata.interactionFlagCount > (summary.extracted.find(e => e.modelId === summary.fullModelId)?.interactionFlagCount || 0)) {
      summary.fullModelId = modelId;
    }
  }

  const manifestPath = path.join(OUT_DIR, 'kit_version_manifest.json');
  summary.manifest = {
    cachePath: CACHE_PATH,
    extractedAt: timestamp,
    kitIds: KIT_IDS,
    fullModelId: summary.fullModelId,
  };
  await fs.writeFile(manifestPath, JSON.stringify(summary, null, 2));
  console.log('\nManifest:', manifestPath);
  console.log('Full model with most interaction flags:', summary.fullModelId);

  cache.close?.();
}

main().catch(console.error);
