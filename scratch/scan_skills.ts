import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';
const RSMV_PATH = 'D:/rsmv_inspector'; // The local rsmv tree

let GameCacheLoader: any;
let parse: any;

try {
    ({ GameCacheLoader } = require(path.join(RSMV_PATH, 'src', 'cache', 'sqlite.ts')));
    ({ parse } = require(path.join(RSMV_PATH, 'src', 'opdecoder.ts')));
} catch (e) {
    console.error('Failed to load RSMV modules:', (e as Error).message);
    process.exit(1);
}

function makeState(cache: any, buf: Buffer) {
    return {
        isWrite: false,
        buffer: buf,
        stack: [],
        hiddenstack: [],
        scan: 0,
        endoffset: buf.byteLength,
        args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
    };
}

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    console.log("Scanning ENUMs for skill data...");
    
    try {
        const index17 = await cache.getIndexFile(17);
        console.log(`Index 17 (Enums): ${index17.length} archives`);
        
        let foundEnums = [];
        
        // Let's sample the first 20000 enums
        for (let i = 0; i < index17.length; i++) {
            const entry = index17[i];
            if (!entry) continue;
            try {
                const buffer = await cache.getFile(17, entry.minor);
                const state = makeState(cache, buffer);
                const result = parse.enums.parser.read(state);
                
                if (result.valtype === 115) { // 's' is 115
                    let hasNecro = false;
                    let hasAttack = false;
                    
                    if (result.stringvals) {
                        const count = result.stringvals.length;
                        if (count >= 28 && count <= 35) {
                            foundEnums.push({ id: entry.minor, entries: result.stringvals });
                        }
                    }
                }
            } catch (e) {}
        }
        
        for (const enm of foundEnums) {
            console.log(`\nFound Skill Enum ID: ${enm.id}`);
            const sorted = enm.entries.sort((a: any, b: any) => a[0] - b[0]);
            for (const val of sorted) {
                console.log(`  ID: ${val[0]} -> ${val[1]}`);
            }
        }
        
    } catch (e) {
        console.error(e);
    }
}

main().catch(console.error);
