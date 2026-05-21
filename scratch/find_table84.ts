
import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors, cacheConfigPages } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    const source = new GameCacheLoader(CACHE_DIR);
    const configIndex = await source.getCacheIndex(cacheMajors.config);
    const dbrowsPage = configIndex.find((p: any) => p && p.minor === cacheConfigPages.dbrows);
    const arch = await source.getFileArchive(dbrowsPage);

    for (const file of arch) {
        try {
            const row = parse.dbrows.read(file.buffer, source) as any;
            if (row.tableId === 84) {
                console.log(`Found Row in Table 84: ID ${file.fileid}`);
                console.log(JSON.stringify(row, null, 2));
                return;
            }
        } catch { }
    }
}

run();
