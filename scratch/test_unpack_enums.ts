import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const LIVE_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape';
const RSMV_PATH = 'D:/sovereign/cache_pedagogy/rsmv_inspector';

let GameCacheLoader: any;
let parse: any;
const constants = require(path.join(RSMV_PATH, 'src', 'constants.ts'));
const { cacheMajors } = constants;

try {
    ({ GameCacheLoader } = require(path.join(RSMV_PATH, 'src', 'cache', 'sqlite.ts')));
    ({ parse } = require(path.join(RSMV_PATH, 'src', 'opdecoder.ts')));
} catch (e: any) {
    console.error('Failed to load RSMV modules:', e.message);
    process.exit(1);
}

async function main() {
    const cache = new GameCacheLoader(LIVE_CACHE_PATH);
    cache.buildnr = 940;
    
    // Let's find Enum 708 which is definitely loaded in rsmv_bridge.ts:321
    console.log("Loading Enum 708 directly from live cache...");
    try {
        const enumBuf = await cache.getFileById(cacheMajors.enums, 708);
        console.log(`Buffer fetched successfully, size: ${enumBuf.byteLength}`);
        
        const enumData = parse.enums.read(enumBuf, cache);
        console.log("Decoded Enum 708 data structure:");
        console.log(JSON.stringify(enumData, null, 2));
    } catch (e: any) {
        console.error("Failed to decode Enum 708:", e.message);
    }
    
    cache.close();
}

main().catch(console.error);
