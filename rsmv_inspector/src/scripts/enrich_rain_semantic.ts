import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * PersistEntitySemanticEnricher
 * 
 * Elevates simulated entities to high-status persistent entities.
 */
async function run() {
    const filePath = join(process.cwd(), "rsmv_inspector", "generated", "enriched", "npc_enriched.json");
    const entities = JSON.parse(readFileSync(filePath, 'utf8'));

    const targetIds = ["74", "82", "206", "236"];

    for (const id of targetIds) {
        if (entities[id]) {
            console.log(`Elevating NPC ID ${id} to Persistent Simulated Player status...`);
            
            const entity = entities[id];
            
            // Add high-level semantic tag
            if (!entity.pog2_interactions) entity.pog2_interactions = new Array(10).fill(null);
            
            // Find an open spot for the capability
            const openSlot = entity.pog2_interactions.indexOf(null);
            if (openSlot !== -1) {
                entity.pog2_interactions[openSlot] = "POG2_PERSISTENT_SIMULATED_PLAYER";
            } else {
                entity.pog2_interactions.push("POG2_PERSISTENT_SIMULATED_PLAYER");
            }
            
            entity.pog2_role_semantic = "PERSISTENT_SIMULATED_PLAYER";
            entity.pog2_provenance = "[VERIFIED_ARCHETYPAL_ELEVATION]";
        }
    }

    writeFileSync(filePath, JSON.stringify(entities, null, 2));
    console.log("Entity semantic elevation complete.");
}

run().catch(console.error);
