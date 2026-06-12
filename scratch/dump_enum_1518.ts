import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');
const { parse } = require('D:/rsmv_inspector/src/opdecoder.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    const id = 1518;
    console.log(`Dumping Enum ${id}...`);

    try {
        const buf = await cache.getFile(17, id);
        const state = { 
            buffer: buf, 
            stack: [], 
            hiddenstack: [], 
            scan: 0, 
            endoffset: buf.byteLength, 
            args: { clientVersion: 1149 } 
        };
        const result = parse.enums.parser.read(state);
        console.log(`Enum ${id} (Size: ${result.stringvals ? result.stringvals.length : 0})`);
        
        if (result.stringvals) {
            const sorted = result.stringvals.sort((a, b) => a[0] - b[0]);
            sorted.forEach((v: any) => console.log(`  ${v[0]}: ${v[1]}`));
        }
    } catch (e) {
        console.error(`Failed to dump Enum ${id}:`, e);
    }
}

main().catch(console.error);
