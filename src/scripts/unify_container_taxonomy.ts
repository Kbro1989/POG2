import * as fs from "fs";
import * as path from "path";

const TAXONOMY_DIR = "D:\\sovereign\\atlas\\spatial\\system_taxonomy";
const WORLD_EXTRACT_DIR = "D:\\sovereign\\atlas\\spatial\\world_extract";
const OUTPUT_FILE = path.join(TAXONOMY_DIR, "unified_containers.json");

async function run() {
    console.log("🧬 Sovereign Container Unification — 10/10 System Truth");
    
    // 1. Load All Sources
    const invDefs = JSON.parse(fs.readFileSync(path.join(TAXONOMY_DIR, "inventory_definitions.json"), "utf-8"));
    const rawLinks = JSON.parse(fs.readFileSync(path.join(TAXONOMY_DIR, "container_links.json"), "utf-8"));
    
    // 2. Aggregate Results
    const shops = rawLinks.npcShops.map((s: any) => ({
        ...s,
        type: "NPC_SHOP",
        def: invDefs[s.id] || null // Tentative ID match
    }));

    const storages = rawLinks.objectStorages.map((s: any) => ({
        ...s,
        type: "OBJECT_STORAGE",
        def: invDefs[s.id] || null
    }));

    const unified = {
        stats: {
            total_inventories: Object.keys(invDefs).length,
            npc_shops: shops.length,
            object_storages: storages.length
        },
        containers: [...shops, ...storages],
        _meta: {
            synthesisDate: new Date().toISOString(),
            version: "v1.0-Taxonomy-Truth"
        }
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(unified, null, 2));
    console.log(`✅ Success. Unified ${unified.containers.length} containers.`);
}

run().catch(console.error);
