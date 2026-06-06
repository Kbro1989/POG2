import { GameCacheLoader } from "../rsmv/cache/sqlite.js";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    const source = new GameCacheLoader(CACHE_DIR);
    const index = await source.getCacheIndex(41);

    console.log(`🔍 Probing Major 41 (${index.length} archives)...`);

    for (const group of index) {
        if (!group) continue;
        const arch = await source.getFileArchive(group);
        for (const file of arch) {
            const buf = file.buffer;
            // RS3 DBRow Files often have the Table ID at offset 0 or in the first few bytes
            const tableId = buf.readUInt16BE(0);
            if (tableId === 39) {
                console.log(`✅ Table 39 found in Major 41, Minor ${group.minor}, File ${file.fileid}`);
            }
        }
    }
}

run().catch(console.error);

