import { createRequire } from 'module';
import * as path from 'path';
import * as fs from 'fs/promises';

const require = createRequire(import.meta.url);
const inspectorPath = 'D:/sovereign/cache_pedagogy/rsmv_inspector';
const sqlitePath = path.join(inspectorPath, 'dist', 'cache', 'sqlite.js');
const opdecoderPath = path.join(inspectorPath, 'dist', 'opdecoder.js');

const { GameCacheLoader } = require(sqlitePath);
const { parse } = require(opdecoderPath);

// Model IDs from CLI args, default to subset for initial testing
const enum711Keys = process.argv.slice(2).map(Number).filter(id => !isNaN(id));
if (enum711Keys.length === 0) {
    console.warn('No model IDs provided via CLI. Using default subset: [31149, 12428, 37641]');
    enum711Keys.push(31149, 12428, 37641);
}
const CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

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

interface Submesh {
    indices: number[];
    materialId: number;
    triangleCount: number;
}

function buildBetaOpcoder(rsmvModel: any): any {
    // Format 2 / Version 5: The opdecoder has already decoded triangle indices
    // into meshdata.renders[].buf as flat arrays of vertex indices (triples).
    // Each render group is a submesh with its own materialArgument (texture ID).
    const positions = rsmvModel.meshdata.positionBuffer;
    const normals = rsmvModel.meshdata.normalBuffer;
    const uvs = rsmvModel.meshdata.uvBuffer;
    const renders = rsmvModel.meshdata.renders || [];

    // Stitch all submesh indices and track per-submesh material groups
    const allIndices: number[] = [];
    const submeshes: Submesh[] = [];

    for (let i = 0; i < renders.length; i++) {
        const render = renders[i];
        if (!render.buf || render.buf.length === 0) continue;
        if (render.isHidden) continue; // Skip hidden render groups

        const indices = Array.from(render.buf) as number[];
        const triangleCount = indices.length / 3;

        submeshes.push({
            indices,
            materialId: render.materialArgument || 0,
            triangleCount
        });

        allIndices.push(...indices);
    }

    // Normalize UVs from 16-bit fixed-point to [0, 1]
    const normalizedUvs = uvs ? Array.from(uvs).map((v: number) => v / 65536.0) : [];

    const totalTriangles = allIndices.length / 3;

    return {
        positions: Array.from(positions || []),
        normals: Array.from(normals || []),
        uvs: normalizedUvs,
        indices: allIndices,
        submeshes,
        metadata: {
            vertexCount: rsmvModel.meshdata.vertexCount || 0,
            faceCount: totalTriangles,
            submeshCount: submeshes.length,
            betaFormat: rsmvModel.format,
            betaVersion: rsmvModel.version,
            hasSkin: rsmvModel.meshdata.hasSkin || false,
            hasBoneIds: rsmvModel.meshdata.hasBoneIds || false
        }
    };
}

async function main() {
    console.log('=== SOVEREIGN GEOMETRY EXTRACTION PIPELINE ===\n');
    console.log('Beta Opcoder: renders[].buf → triangle indices (format 2/v5)\n');
    
    const cache = new GameCacheLoader(CACHE_PATH);
    const outDir = 'public/models';

    await fs.mkdir(outDir, { recursive: true });
    
    for (const modelId of enum711Keys) {
        console.log(`Processing appearance kit model: ${modelId}...`);
        
        const buf = await extractModel(cache, modelId);
        if (!buf) continue;
        
        const model = await decodeModel(buf, cache, modelId);
        if (!model) continue;
        
        const mesh = buildBetaOpcoder(model);
        const outPath = path.join(outDir, `kit_${modelId}.json`);
        
        await fs.writeFile(outPath, JSON.stringify(mesh, null, 2));
        console.log(`  → ${outPath}`);
        console.log(`    Vertices: ${mesh.metadata.vertexCount} | Triangles: ${mesh.metadata.faceCount} | Submeshes: ${mesh.metadata.submeshCount}`);
        for (const sub of mesh.submeshes) {
            console.log(`      Material ${sub.materialId}: ${sub.triangleCount} tris`);
        }
        console.log();
    }
    
    console.log('Pipeline complete. Meshes with full triangle topology ready for renderer.');
}

main().catch(console.error);
