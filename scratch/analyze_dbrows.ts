
import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors, cacheConfigPages } from "../src/rsmv/constants.js";
import * as fs from "fs";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    const source = new GameCacheLoader(CACHE_DIR);
    const configIndex = await source.getCacheIndex(cacheMajors.config);
    const dbrowsPage = configIndex.find((p: any) => p && p.minor === cacheConfigPages.dbrows);

    if (!dbrowsPage) {
        console.error("DBRows not found");
        return;
    }

    const arch = await source.getFileArchive(dbrowsPage);
    console.log(`Searching for non-trivial DBRows...`);

    let found = 0;
    for (let i = 0; i < arch.length && found < 5; i++) {
        const file = arch[i];
        if (file.buffer.length > 5) {
            console.log(`\nRow (Index: ${i}, ID: ${file.fileid}, Size: ${file.buffer.length}):`);
            console.log(file.buffer.toString('hex'));
            found++;
        }
    }
}

run();
