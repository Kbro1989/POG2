import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');
const { parse } = require('D:/rsmv_inspector/src/opdecoder.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    console.log("Searching Major 17 (Enums)...");
    const index17 = await cache.getIndexFile(17);
    
    for (const entry of index17) {
        if (!entry) continue;
        try {
            const buf = await cache.getFile(17, entry.minor);
            const state = { buffer: buf, stack: [], hiddenstack: [], scan: 0, endoffset: buf.byteLength, args: { clientVersion: 1149 } };
            const result = parse.enums.parser.read(state);
            
            if (result.stringvals) {
                const count = result.stringvals.length;
                if (count >= 29 && count <= 31) {
                    const vals = result.stringvals.map((v: any) => v[1]);
                    if (vals.includes("Necromancy") || vals.includes("Attack")) {
                        console.log(`\nEnum ${entry.minor} (Size: ${count})`);
                        console.log(vals.join(", "));
                    }
                }
            }
        } catch (e) {}
    }
    
    console.log("\nSearching Major 2 Archive 26 (Config Enums)...");
    try {
        const archive26 = await cache.getArchiveById(2, 26);
        for (const sub of archive26) {
            const state = { buffer: sub.buffer, stack: [], hiddenstack: [], scan: 0, endoffset: sub.buffer.byteLength, args: { clientVersion: 1149 } };
            const result = parse.enums.parser.read(state);
            if (result.stringvals) {
                const count = result.stringvals.length;
                if (count >= 29 && count <= 31) {
                    const vals = result.stringvals.map((v: any) => v[1]);
                    if (vals.includes("Necromancy") || vals.includes("Attack")) {
                        console.log(`\nConfig Enum 2:26:${sub.fileid} (Size: ${count})`);
                        console.log(vals.join(", "));
                    }
                }
            }
        }
    } catch (e) {}
}

main().catch(console.error);
