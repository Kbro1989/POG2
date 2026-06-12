import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');
const { parse } = require('D:/rsmv_inspector/src/opdecoder.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    console.log("Searching Interfaces for 'Necromancy'...");

    for (let id = 0; id < 2000; id++) {
        try {
            const archive = await cache.getArchiveById(3, id);
            for (const sub of archive) {
                const state = { 
                    buffer: sub.buffer, 
                    stack: [], 
                    hiddenstack: [], 
                    scan: 0, 
                    endoffset: sub.buffer.byteLength, 
                    args: { clientVersion: 1149 } 
                };
                try {
                    const comp = parse.interfaces.parser.read(state);
                    const text = comp.textdata?.text || comp.text;
                    if (text && text.toLowerCase().includes('necromancy')) {
                        console.log(`Match in Interface ${id}, Component ${sub.fileid}: "${text}"`);
                    }
                } catch (e) {}
            }
        } catch (e) {}
    }
}

main().catch(console.error);
