import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');
const { parse } = require('D:/rsmv_inspector/src/opdecoder.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    console.log("Searching for the Skill Master Enum...");
    
    // Scan all enums in Major 17
    const index17 = await cache.getIndexFile(17);
    for (const entry of index17) {
        if (!entry) continue;
        try {
            const buf = await cache.getFile(17, entry.minor);
            const state = { buffer: buf, stack: [], hiddenstack: [], scan: 0, endoffset: buf.byteLength, args: { clientVersion: 1149 } };
            const result = parse.enums.parser.read(state);
            
            if (result.stringvals) {
                const vals = result.stringvals.map((v: any) => v[1]);
                if (vals.includes('Necromancy') && vals.includes('Archaeology')) {
                    console.log(`\nFound Skill Enum: 17:${entry.minor}`);
                    console.log(`Size: ${result.stringvals.length}`);
                    vals.forEach((v: string, i: number) => {
                        console.log(`  [${result.stringvals[i][0]}] ${v}`);
                    });
                    
                    if (result.stringvals.length > 29) {
                        console.log("!!! FOUND EXTRA SKILL SLOT !!!");
                    }
                }
            }
        } catch (e) {}
    }

    // Scan all config enums in Major 2 Archive 26
    try {
        const archive26 = await cache.getArchiveById(2, 26);
        for (const sub of archive26) {
            const state = { buffer: sub.buffer, stack: [], hiddenstack: [], scan: 0, endoffset: sub.buffer.byteLength, args: { clientVersion: 1149 } };
            const result = parse.enums.parser.read(state);
            if (result.stringvals) {
                const vals = result.stringvals.map((v: any) => v[1]);
                if (vals.includes('Necromancy') && vals.includes('Archaeology')) {
                    console.log(`\nFound Skill Enum: 2:26:${sub.fileid}`);
                    console.log(`Size: ${result.stringvals.length}`);
                    vals.forEach((v: string, i: number) => {
                        console.log(`  [${result.stringvals[i][0]}] ${v}`);
                    });
                }
            }
        }
    } catch (e) {}
}

main().catch(console.error);
