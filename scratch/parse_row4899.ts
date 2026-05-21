
import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors, cacheConfigPages } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    const source = new GameCacheLoader(CACHE_DIR);
    const configIndex = await source.getCacheIndex(cacheMajors.config);
    const dbrowsPage = configIndex.find((p: any) => p && p.minor === cacheConfigPages.dbrows);
    const arch = await source.getFileArchive(dbrowsPage);

    const file = arch.find(f => f.fileid === 4899);
    if (!file) {
        console.log("Row 4899 not found");
        return;
    }

    console.log(`Parsing Row 4899...`);
    const row = parse.dbrows.read(file.buffer, source);
    console.log(JSON.stringify(row, null, 2));
}

run();
