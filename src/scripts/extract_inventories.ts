import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import { cacheMajors } from "../rsmv/constants.js";
import { parse } from "../rsmv/opdecoder.js";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const OUTPUT_FILE = "D:\\sovereign\\atlas\\spatial\\system_taxonomy\\inventory_definitions.json";

async function run() {
    console.log("🚀 Sovereign Inventory Extraction — Major 2, Minor 5");
    const source = new GameCacheLoader(CACHE_DIR);

    // In many RS3 caches, Major 2 / Minor 5 = Inventories
    const INV_MINOR = 5;

    try {
        const arch = await source.getArchiveById(cacheMajors.config, INV_MINOR);
        console.log(`📊 Found ${arch.length} Inventory Definitions.`);

        const invDefs: Record<number, any> = {};
        for (const file of arch) {
            try {
                // Since our opdecoder.ts doesn't have a high-level "inv" parser,
                // we'll look at the raw bytes for common patterns:
                // [Capacity (Int)] [StackLogic (Byte/Bool)]
                const buf = file.buffer;
                invDefs[file.fileid] = {
                    id: file.fileid,
                    size: buf.length,
                    hex: buf.toString('hex')
                };
            } catch { }
        }

        if (!fs.existsSync(path.dirname(OUTPUT_FILE))) fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(invDefs, null, 2));
        console.log(`✅ Wrote ${arch.length} entries to ${OUTPUT_FILE}`);
    } catch (e) {
        console.error("❌ Inventory extraction failed:", e);
    }
}

run().catch(console.error);

