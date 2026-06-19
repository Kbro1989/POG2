import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import * as path from 'path';

const { GameCacheLoader } = require('../../rsmv/src/cache/sqlite.ts');
const { parseOb3Model } = require('../../rsmv/src/3d/rt7model.ts');

const MODELS_TO_CHECK = [12428, 31149, 37641, 420];

const PATH_BETA = 'C:/ProgramData/Jagex/RuneScape-BETA';
const PATH_LIVE = 'C:/ProgramData/Jagex/RuneScape';

async function analyzeModel(cache: any, modelId: number, env: string) {
    try {
        const buffer = await cache.getFileById(47, modelId);
        if (!buffer) {
            console.log(`  [${env}] -> Not found in cache.`);
            return;
        }

        const model = parseOb3Model(buffer, cache);
        
        const positions: number[] = [];
        for (const mesh of (model.meshes || [])) {
            if (mesh.attributes?.pos) {
                const array = mesh.attributes.pos.array;
                for(let i=0; i<array.length; i++) positions.push(array[i]);
            }
        }
        
        if (positions.length === 0) {
            console.log(`  [${env}] -> No positions data.`);
            return;
        }
        
        let minX = Infinity, minY = Infinity, minZ = Infinity;
        let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
        
        for (let i = 0; i < positions.length; i += 3) {
            const x = positions[i];
            const y = positions[i+1];
            const z = positions[i+2];
            
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (z < minZ) minZ = z;
            
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
            if (z > maxZ) maxZ = z;
        }
        
        const width = maxX - minX;
        const height = maxY - minY;
        const depth = maxZ - minZ;
        
        console.log(`  [${env}] Vertices: ${positions.length / 3}`);
        console.log(`  [${env}] Bounds: X[${minX.toFixed(0)} to ${maxX.toFixed(0)}] Y[${minY.toFixed(0)} to ${maxY.toFixed(0)}] Z[${minZ.toFixed(0)} to ${maxZ.toFixed(0)}]`);
        console.log(`  [${env}] Size: W=${width.toFixed(2)} H=${height.toFixed(2)} D=${depth.toFixed(2)}`);
    } catch(e: any) {
        console.error(`  [${env}] Error: ${e.message}`);
    }
}

async function main() {
    console.log('=== LIVE VS BETA KIT COMPARISON ===');
    
    const cacheBeta = new GameCacheLoader(PATH_BETA);
    const cacheLive = new GameCacheLoader(PATH_LIVE);
    
    for (const modelId of MODELS_TO_CHECK) {
        console.log(`\n--- Model ${modelId} ---`);
        await analyzeModel(cacheBeta, modelId, 'BETA');
        await analyzeModel(cacheLive, modelId, 'LIVE');
    }
    
    cacheBeta.close?.();
    cacheLive.close?.();
}

main().catch(console.error);
