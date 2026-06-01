import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import * as fs from "fs";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const TARGET_ID = Number(process.argv[2] || 30308); // Kili default
const SEARCH_BUF = Buffer.alloc(4);
SEARCH_BUF.writeUInt32BE(TARGET_ID, 0);

async function run() {
    console.log(`🚀 Sovereign Inverted Script Search — Final 10/10 Truth for ID ${TARGET_ID}`);
    const source = new GameCacheLoader(CACHE_DIR);
    const index = await source.getCacheIndex(12);

    console.log(`Scanning ${index.length} archives...`);
    const results: number[] = [];

    for (const group of index) {
        if (!group) continue;
        const arch = await source.getFileArchive(group);
        for (const file of arch) {
            if (file.buffer.indexOf(SEARCH_BUF) !== -1) {
                const scriptId = group.minor * 128 + file.fileid;
                results.push(scriptId);
                console.log(`🎯 Identified Target Script ID: ${scriptId}`);
            }
        }
    }

    console.log(`✅ Search Complete. Found ${results.length} handler candidates.`);
}

run().catch(console.error);

