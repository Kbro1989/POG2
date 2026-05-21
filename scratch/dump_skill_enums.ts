import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');
const { parse } = require('D:/rsmv_inspector/src/opdecoder.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    const skillEnums = [1518, 1519, 1520, 1521, 690, 691, 692, 1000, 1001, 2801, 2802];
    
    console.log("Dumping Potential Skill Enums...");

    for (const id of skillEnums) {
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
            console.log(`\n--- Enum ${id} ---`);
            if (result.stringvals) {
                console.log("String Vals:");
                result.stringvals.forEach((v: any) => console.log(`  ${v[0]}: ${v[1]}`));
            }
            if (result.intvals) {
                console.log("Int Vals:");
                result.intvals.forEach((v: any) => console.log(`  ${v[0]}: ${v[1]}`));
            }
        } catch (e) {
            // console.log(`Enum ${id} not found or failed to parse.`);
        }
    }
}

main().catch(console.error);
