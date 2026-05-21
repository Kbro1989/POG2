import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import { cacheMajors } from "../rsmv/constants.js";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const INVENTORY_DEFS = "D:\\sovereign\\atlas\\spatial\\system_taxonomy\\inventory_definitions.json";
const OUTPUT_FILE = "D:\\sovereign\\atlas\\spatial\\system_taxonomy\\container_links.json";

async function run() {
    console.log("🚀 Sovereign Container Taxonomy Research");
    const source = new GameCacheLoader(CACHE_DIR);

    const invDefs = JSON.parse(fs.readFileSync(INVENTORY_DEFS, "utf-8"));
    const invIds = new Set(Object.keys(invDefs).map(Number));

    const results: any = {
        npcShops: [],
        objectStorages: []
    };

    // 1. Scan NPCs (Major 18)
    console.log("👤 Scanning NPCs for Shop/Trade patterns...");
    const npcIndex = await source.getCacheIndex(18);
    for (const group of npcIndex) {
        if (!group) continue;
        const arch = await source.getFileArchive(group);
        for (const file of arch) {
            const buf = file.buffer;
            const npcId = group.minor * 128 + file.fileid;

            // Search for potential Inventory IDs and Action patterns
            // In RS3, Opcodes 30-34 are Actions (Trade, Shop, etc.)
            // We'll search the first few bytes for string "Trade" or "Shop"
            const str = buf.toString('utf-8');
            if (str.includes("Trade") || str.includes("Shop")) {
                results.npcShops.push({ id: npcId, pattern: "str_match", content: str.substring(0, 50) });
            }
        }
    }

    // 2. Scan Objects (Major 16)
    console.log("📦 Scanning Objects for Bank/Storage patterns...");
    const objIndex = await source.getCacheIndex(16);
    for (const group of objIndex) {
        if (!group) continue;
        const arch = await source.getFileArchive(group);
        for (const file of arch) {
            const buf = file.buffer;
            const objId = group.minor * 128 + file.fileid;
            const str = buf.toString('utf-8');
            if (str.includes("Bank") || str.includes("Deposit") || str.includes("Chest")) {
                results.objectStorages.push({ id: objId, pattern: "str_match", content: str.substring(0, 50) });
            }
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
    console.log(`✅ Taxonomy complete. Found ${results.npcShops.length} shops and ${results.objectStorages.length} storages.`);
}

run().catch(console.error);
