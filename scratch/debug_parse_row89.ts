
import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors, cacheConfigPages } from "../src/rsmv/constants.js";
import { parse, bootParsers } from "../src/rsmv/opdecoder.js";
import { getDebug } from "../src/rsmv/opcode_reader.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
    // We need to load the opcodes first because the auto-boot might fail if paths are weird in scratch
    // But opdecoder.ts already does auto-boot in Node.

    const source = new GameCacheLoader(CACHE_DIR);
    const configIndex = await source.getCacheIndex(cacheMajors.config);
    const dbrowsPage = configIndex.find((p: any) => p && p.minor === cacheConfigPages.dbrows);

    if (!dbrowsPage) {
        console.error("DBRows not found");
        return;
    }

    const arch = await source.getFileArchive(dbrowsPage);

    // Pick Row 89 which we know is non-trivial
    const file = arch.find(f => f.fileid === 89);
    if (!file) {
        console.error("Row 89 not found");
        return;
    }

    console.log(`Analyzing Row 89 (Size: ${file.buffer.length})...`);

    getDebug(true);
    try {
        const row = parse.dbrows.read(file.buffer, source);
        console.log("Successfully parsed Row 89:");
        console.log(JSON.stringify(row, null, 2));
    } catch (e: any) {
        console.error("Failed to parse Row 89:");
        console.error(e.message);
        const debug = getDebug(false);
        if (debug) {
            console.log("\nOpcode Trace (Last 10):");
            console.log(debug.opcodes.slice(-10));
        }
    }
}

run();
