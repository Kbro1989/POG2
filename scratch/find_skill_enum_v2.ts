import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');
const { parse } = require('D:/rsmv_inspector/src/opdecoder.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    console.log("Searching Major 17 for 'Mining'...");
    const index17 = await cache.getIndexFile(17);
    
    for (const entry of index17) {
        if (!entry) continue;
        try {
            const buf = await cache.getFile(17, entry.minor);
            const text = buf.toString('utf8');
            if (text.includes('Mining')) {
                const state = { buffer: buf, stack: [], hiddenstack: [], scan: 0, endoffset: buf.byteLength, args: { clientVersion: 1149 } };
                const result = parse.enums.parser.read(state);
                if (result.stringvals) {
                    const vals = result.stringvals.map((v: any) => v[1]);
                    if (vals.includes('Mining') && vals.includes('Necromancy')) {
                        console.log(`\nFound Skill Enum: ${entry.minor}`);
                        console.log(`Size: ${result.stringvals.length}`);
                        console.log(vals.join(', '));
                    }
                }
            }
        } catch (e) {}
    }
}

main().catch(console.error);
