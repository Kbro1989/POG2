
import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors, cacheConfigPages } from "../src/rsmv/constants.js";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    const source = new GameCacheLoader(CACHE_DIR);
    const configIndex = await source.getCacheIndex(cacheMajors.config);
    const dbrowsPage = configIndex.find((p: any) => p && p.minor === cacheConfigPages.dbrows);
    const arch = await source.getFileArchive(dbrowsPage);

    console.log(`Scanning for NPC IDs 3688 (0x0E68) and 1835 (0x072B)...`);

    for (const file of arch) {
        const buf = file.buffer;
        for (let i = 0; i <= buf.length - 2; i++) {
            const val = buf.readUInt16BE(i);
            if (val === 3688 || val === 1835) {
                console.log(`Found ID ${val} at Row ${file.fileid}, Offset ${i}`);
            }
        }
    }
}

run();
