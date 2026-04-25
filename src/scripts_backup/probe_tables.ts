import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import { parse } from "../rsmv/opdecoder.js";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    const source = new GameCacheLoader(CACHE_DIR);
    const index = await source.getCacheIndex(41); // DBRows
    const tableCounts: Record<number, number> = {};
    
    console.log(`🔍 Probing unique tables in Major 41 (${index.length} archives)...`);

    for (const group of index.slice(0, 100)) { // Just sample first 100
        if (!group) continue;
        const arch = await source.getFileArchive(group);
        for (const file of arch) {
            try {
                const row = parse.dbrows.read(file.buffer, source) as any;
                const tid = row.table ?? -1;
                tableCounts[tid] = (tableCounts[tid] || 0) + 1;
            } catch {}
        }
    }

    console.log("📊 Table Distribution (Sample):", tableCounts);
}

run().catch(console.error);
