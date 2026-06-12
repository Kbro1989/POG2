import { GameCacheLoader } from "rsmv_inspector/cache/sqlite";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    console.log("🚀 Sovereign Player Status Research — Identifying Modern Ranks");
    const source = new GameCacheLoader(CACHE_DIR);

    // Major 2 / Minor 26 is the Enum library
    const arch = await source.getArchiveById(2, 26);
    console.log(`Scanning ${arch.length} Enums for Status Metadata...`);

    for (const file of arch) {
        const buf = file.buffer;
        const str = buf.toString('utf8');

        // Search for Keyword markers of a status hierarchy
        if (str.includes("Admin") || str.includes("Player Moderator") || str.includes("Ironman")) {
            console.log(`🎯 Hit in Enum ${file.fileid}: Potentially Rank Logic.`);
            // In RS3 Enums, the type is usually stored in the first few bytes.
            // We'll print the hex to identify the mappings.
            console.log(`   Hex: ${buf.slice(0, 100).toString('hex')}...`);
        }
    }
}

run().catch(console.error);
