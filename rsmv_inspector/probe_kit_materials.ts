import { GameCacheLoader } from "./src/cache/sqlite.js";
import { cacheMajors, cacheConfigPages } from "./src/constants.js";
import { parse } from "./src/opdecoder.js";

async function probe() {
    const c = new GameCacheLoader('C:/ProgramData/Jagex/RuneScape-BETA');
    console.log("Fetching dbrows archive (Index 2, Minor 41)...");
    const arch = await c.getArchiveById(cacheMajors.config, cacheConfigPages.dbrows);
    
    for (const id of [2082, 2109, 2368, 2397]) {
        const file = arch.find(f => f.fileid === id);
        if (file) {
            const row = parse.dbrows.read(file.buffer, c);
            console.log(`\n=== ROW ${id} ===`);
            console.log(JSON.stringify(row, null, 2));
        } else {
            console.log(`Row ${id} not found.`);
        }
    }
}
probe().catch(console.error);
