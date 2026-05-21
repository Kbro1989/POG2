/**
 * read_struct_15550.ts
 *
 * Dumps a specific struct from the BETA cache to see its parameters.
 * We think 15550 might be an ability based on action bar script arguments.
 */

import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';
const RSMV_PATH = 'D:/sovereign/cache_pedagogy/rsmv_inspector';

let GameCacheLoader: any;
let parse: any;

try {
    ({ GameCacheLoader } = require(path.join(RSMV_PATH, 'src', 'cache', 'sqlite.ts')));
    ({ parse } = require(path.join(RSMV_PATH, 'src', 'opdecoder.ts')));
} catch (e) {
    console.error('Failed to load RSMV modules:', (e as Error).message);
    process.exit(1);
}

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    const STRUCT_ID = 15550;
    console.log(`Extracting struct ${STRUCT_ID}...`);

    try {
        const file = await cache.getFileById(22, STRUCT_ID); // Try major 22
        if (file) {
            const state = {
                isWrite: false,
                buffer: file,
                stack: [],
                hiddenstack: [],
                scan: 0,
                endoffset: file.byteLength,
                args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
            };
            const result = parse.structs.parser.read(state);
            console.log("Found in Major 22:");
            console.log(JSON.stringify(result, null, 2));
            return;
        }
    } catch { /* Try the next one */ }

    // Try in config major 2 minor 32
    try {
        const archive = await cache.getArchiveById(2, 32);
        const sub = archive.find((s: any) => s.fileid === STRUCT_ID);
        if (sub) {
            const state = {
                isWrite: false,
                buffer: sub.buffer,
                stack: [],
                hiddenstack: [],
                scan: 0,
                endoffset: sub.buffer.byteLength,
                args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
            };
            const result = parse.structs.parser.read(state);
            console.log("Found in Major 2, Minor 32:");
            console.log(JSON.stringify(result, null, 2));
            return;
        }
    } catch { }

    console.log(`Struct ${STRUCT_ID} not found.`);
}

main().catch(console.error);
