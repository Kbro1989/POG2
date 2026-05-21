
import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors, cacheConfigPages } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";
import { getDebug } from "../src/rsmv/opcode_reader.js";
import * as fs from "fs";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    const source = new GameCacheLoader(CACHE_DIR);
    const configIndex = await source.getCacheIndex(cacheMajors.config);
    const dbrowsPage = configIndex.find((p: any) => p && p.minor === cacheConfigPages.dbrows);
    const arch = await source.getFileArchive(dbrowsPage);

    const file = arch.find(f => f.fileid === 12265);
    if (!file) return;

    console.log(`Analyzing Row 12265 (Size: ${file.buffer.length})...`);

    getDebug(true);
    try {
        const row = parse.dbrows.read(file.buffer, source);
        console.log("Successfully parsed Row 12265:");
        console.log(JSON.stringify(row, null, 2));
    } catch (e: any) {
        console.error("Failed to parse Row 12265:");
        console.error(e.message);
        const debug = getDebug(false);
        if (debug) {
            console.log("\nOpcode Trace (Last 10):");
            console.log(debug.opcodes.slice(-10));
        }
    }
}

run();
