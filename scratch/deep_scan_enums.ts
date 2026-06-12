import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');
const { parse } = require('D:/rsmv_inspector/src/opdecoder.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    console.log("Deep Scanning Major 17 (Enums)...");
    const index17 = await cache.getIndexFile(17);
    
    for (const entry of index17) {
        if (!entry) continue;
        try {
            const buf = await cache.getFile(17, entry.minor);
            const state = { buffer: buf, stack: [], hiddenstack: [], scan: 0, endoffset: buf.byteLength, args: { clientVersion: 1149 } };
            const result = parse.enums.parser.read(state);
            
            let match = false;
            if (result.stringvals) {
                for (const v of result.stringvals) {
                    if (typeof v[1] === 'string' && v[1].toLowerCase().includes('necromancy')) {
                        match = true;
                        break;
                    }
                }
            }
            
            if (match) {
                console.log(`\nEnum ${entry.minor}:`);
                if (result.stringvals) {
                    result.stringvals.forEach((v: any) => console.log(`  ${v[0]}: ${v[1]}`));
                }
            }
        } catch (e) {}
    }
}

main().catch(console.error);
