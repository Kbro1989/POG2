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

function buildBetaOpcoder(rsmvModel: any): any {
    // BETA OPCODER: Adapt the legacy opdecoder output to the new Beta model format
    // In Beta (version 5/format 2), indices are packed in `meshdata.renders`
    const positions = rsmvModel.meshdata.positionBuffer;
    const normals = rsmvModel.meshdata.normalBuffer;
    const uvs = rsmvModel.meshdata.uvBuffer;

    // Diagnostic: Dump renders buffer for topology analysis if available
    if (rsmvModel.meshdata.renders && rsmvModel.meshdata.renders.length > 0) {
        console.log(`[Diagnostic] Model has ${rsmvModel.meshdata.renders.length} render buffers.`);
        // Dump first render buffer for forensics
        const firstRender = rsmvModel.meshdata.renders[0];
        if (firstRender && firstRender.buf) {
            console.log(`[Diagnostic] Render 0 buffer size: ${firstRender.buf.length} bytes`);
            console.log(`[Diagnostic] Render 0 buffer hex: ${firstRender.buf.slice(0, 64).toString('hex')}...`);
        }
    }

    // Normalize UVs from 16-bit fixed-point to [0, 1]
    const normalizedUvs = uvs ? Array.from(uvs).map(v => v / 65536.0) : [];

    return {
        positions: Array.from(positions || []),
        normals: Array.from(normals || []),
        uvs: normalizedUvs,
        indices: [], // To be populated by Beta Opcoder refinement
        metadata: {
            vertexCount: rsmvModel.meshdata.vertexCount || 0,
            faceCount: rsmvModel.meshdata.faceCount || 0,
            betaFormat: rsmvModel.format,
            betaVersion: rsmvModel.version
        }
    };
}

async function main() {
    console.log('=== SOVEREIGN GEOMETRY EXTRACTION PIPELINE ===\n');
    console.log('Initializing Beta Opcoder Adapter...\n');
    
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
        console.log(`Saved Babylon.js mesh template to: ${outPath} (Vertices: ${mesh.metadata.vertexCount})\n`);
    }
    
    console.log('Pipeline complete. Geometry points are ready for the PBR renderer.');
    console.log('NOTE: Face indices (meshdata.renders) require full Beta Opcoder format decoding.');
}

main().catch(console.error);
