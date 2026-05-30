import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

async function run() {
    const filePath = join(process.cwd(), "rsmv_inspector", "generated", "enriched", "npc_enriched.json");
    const entities = JSON.parse(readFileSync(filePath, 'utf8'));
    const PAD_SIZE = 10;

    const rainData = {
        "boundSize": 1,
        "animation_group": 4694,
        "combat": 0,
        "name": "Rain the Proud",
        "models": [363, 40457, 130961, 130827, 117078, 47480, 98200, 83809],
        "headModels": [38795, 38897],
        "movementCapabilities": 3
    };

    const targetIds = ["74", "82", "206", "236"];

    for (const id of targetIds) {
        if (!entities[id]) {
            console.log(`Adding "Rain the Proud" to substrate ID ${id}...`);
            const entity = { ...rainData, id: parseInt(id) };
            
            // Add padding
            entity.models = [...entity.models, ...new Array(PAD_SIZE - entity.models.length).fill(null)];
            entity.pog2_interactions = new Array(PAD_SIZE).fill(null);
            entity.pog2_associated_scripts = new Array(PAD_SIZE).fill(null);
            
            entities[id] = entity;
        }
    }

    writeFileSync(filePath, JSON.stringify(entities, null, 2));
    console.log("Enrichment complete.");
}

run().catch(console.error);
