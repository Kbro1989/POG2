import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import { parse } from "../rsmv/opdecoder.js";
import { cacheMajors } from "../rsmv/constants.js";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    console.log("🔍 Probing Live Cache for Locational Guide Updates...");
    const source = new GameCacheLoader(CACHE_DIR);

    // 1. Check for Clue Coordinate Enums (based on property 235 search)
    console.log("\n--- Clue Truth Audit ---");
    // We know property 235 on items points to coordinate enums.
    // Let's find some items and their enums.
    const clueItemIds = [2677, 2801, 2722, 19041, 19042]; // Sample clue IDs
    for (const id of clueItemIds) {
        try {
            const buf = await source.getFileById(cacheMajors.items, id);
            const item = parse.item.read(buf, source);
            const prop = item.extra?.find((q: any) => q.prop === 235);
            if (prop) {
                console.log(`🎯 Clue Item ${id} ("${item.name}") -> Enum ${prop.intvalue}`);
                // Read the enum
                const enumBuf = await source.getFileById(cacheMajors.enums, prop.intvalue!);
                const enumData = parse.enums.read(enumBuf, source);
                console.log(`   Enum ${prop.intvalue} has ${enumData.intArrayValue2?.values.length} coordinates.`);
            }
        } catch (e) {}
    }

    // 2. Check for Player Rank Enums
    console.log("\n--- Player Rank Audit ---");
    const rankKeywords = ["player mod", "pmod", "jmod", "admin", "ironman", "hardcore"];
    for (let id = 0; id < 5000; id++) { // Search first 5000 enums
        try {
            const buf = await source.getFileById(cacheMajors.enums, id);
            const str = buf.toString('utf8').toLowerCase();
            if (rankKeywords.some(k => str.includes(k))) {
                console.log(`🎯 Hit in Enum ${id}: "${str.substring(0, 50)}..."`);
            }
        } catch (e) {}
    }

    source.close();
    console.log("\n✅ Audit Complete.");
}

run().catch(console.error);
