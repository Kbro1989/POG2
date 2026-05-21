import { cacheMajors, cacheConfigPages } from "../rsmv/constants.js";
import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import { parse } from "../rsmv/opdecoder.js";
import * as fs from "fs";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function probe() {
    console.log("🚀 Commencing Forensic DBRow Audit (Yesterday's Truth)...");
    console.log(`🔍 Targeting God Cache Root: ${CACHE_DIR}`);

    const source = new GameCacheLoader(CACHE_DIR);

    try {
        console.log(`🔍 Querying Cache Index for Major ${cacheMajors.config} (config)...`);

        // Use the correct Major/Minor index from CacheConstants.ts
        const dbrowsMinor = cacheConfigPages.dbrows; // 41

        console.log(`🔍 Scanning DBRow Archives (Minor ${dbrowsMinor})...`);
        const archInfo = await source.getArchiveById(cacheMajors.config, dbrowsMinor);

        console.log(`✅ Successfully retrieved DBRow Archive. Subfile count: ${archInfo.length}`);

        // 1. Identify Row 2353 (Sextant Grounding Anchor)
        const sextantFile = archInfo.find(f => f.fileid === 2353);
        if (sextantFile) {
            console.log(`📍 Grounding Check: Row 2353 (Sextant) identified. Parsing file...`);
            const decoded = parse.dbrows.read(sextantFile.buffer, source);
            console.log(JSON.stringify(decoded, null, 2));

            // Write metadata tail for future reference
            const tailPath = "D:/sovereign/atlas/spatial/pathing_theory/sextant_row2353_tail.json";
            fs.writeFileSync(tailPath, JSON.stringify(decoded, null, 2));
            console.log(`✅ Wrote Sextant Tail to ${tailPath}`);
        } else {
            console.log("❌ Row 2353 not found in DBRows archive.");
        }
    } catch (e) {
        console.error("⚠️ Failed to probe DBRows:", e);
    }
}

probe().catch(console.error);
