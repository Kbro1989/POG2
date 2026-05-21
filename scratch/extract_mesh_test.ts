import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const inspectorPath = 'D:/sovereign/cache_pedagogy/rsmv_inspector';
const sqlitePath = path.join(inspectorPath, 'dist', 'cache', 'sqlite.js');
const opdecoderPath = path.join(inspectorPath, 'dist', 'opdecoder.js');

async function test() {
    try {
        const { GameCacheLoader } = require(sqlitePath);
        const { parse } = require(opdecoderPath);
        
        const cache = new GameCacheLoader('C:/ProgramData/Jagex/RuneScape-BETA');
        const modelId = 31149;
        
        console.log(`Fetching model ${modelId} from major 47...`);
        const buf = await cache.getFile(47, modelId);
        
        if (!buf) {
            console.error(`Model ${modelId} not found.`);
            return;
        }
        
        console.log(`Model buffer size: ${buf.length} bytes`);
        
        const state = {
            buffer: buf,
            scan: 0,
            endoffset: buf.length,
            args: { clientVersion: 1149 }
        };
        
        const model = parse.models.read(state);
        console.log(`Decoded model!`);
        console.log(`Vertices: ${model.vertices?.length || '?'}`);
        console.log(`Faces: ${model.face_count || '?'}`);
        
        // Let's see what keys are on the model
        console.log(Object.keys(model));
    } catch (e) {
        console.error('Extraction failed:', e);
    }
}

test();
