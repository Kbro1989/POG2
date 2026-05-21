import { GameCacheLoader } from "rsmv/cache/sqlite";
import { parse } from "rsmv/opdecoder";
import * as fs from "fs";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    const source = new GameCacheLoader(CACHE_DIR);
    const index = await source.getCacheIndex(41); // DBRow Data Major

    console.log(`🔍 Probing Major 41 (${index.length} archives)...`);

    for (const group of index) {
        if (!group) continue;
        const arch = await source.getFileArchive(group);
        for (const file of arch) {
            try {
                const row = parse.dbrows.read(file.buffer, source) as any;
                if (row.table === 39) {
                    console.log(`✅ FOUND Table 39 in Archive 41:${group.minor}, File:${file.fileid}`);
                    // return; // Find one and stop
                }
            } catch (_error) {
                // [SILENT NECROSIS LOGGER]
                console.warn("[SILENT NECROSIS] Caught in find_table: ", _error);
            }
        }
        if (group.minor % 100 === 0) console.log(`  Scanned ${group.minor}...`);
    }
}

run().catch(console.error);
