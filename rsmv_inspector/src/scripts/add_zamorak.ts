import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

async function run() {
    const filePath = join(process.cwd(), "rsmv_inspector", "generated", "enriched", "npc_enriched.json");
    const entities = JSON.parse(readFileSync(filePath, 'utf8'));
    const PAD_SIZE = 10;

    const zamorakData = {
        "boundSize": 1,
        "animation_group": 4639,
        "iconHeight": 3800,
        "actions_1": "Attack",
        "combat": 10000,
        "unknown_63": true,
        "aByte3076_set_0": false,
        "movementType": 2,
        "mapFunction": 4147,
        "unknown_B6": true,
        "name": "Zamorak, Lord of Chaos",
        "models": [125794, 125793, 125795],
        "headModels": [102157],
        "extra": [],
        "movementCapabilities": 1,
        "attackCursor": 42
    };

    const targetIds = ["180", "185", "242"];

    for (const id of targetIds) {
        if (!entities[id]) {
            console.log(`Adding Zamorak to substrate ID ${id}...`);
            const entity = { ...zamorakData, id: parseInt(id) };
            
            // Add padding
            entity.models = [...entity.models, ...new Array(PAD_SIZE - entity.models.length).fill(null)];
            entity.pog2_interactions = new Array(PAD_SIZE).fill(null);
            entity.pog2_associated_scripts = new Array(PAD_SIZE).fill(null);
            
            entities[id] = entity;
        }
    }

    writeFileSync(filePath, JSON.stringify(entities, null, 2));
    console.log("Zamorak enrichment complete.");
}

run().catch(console.error);
