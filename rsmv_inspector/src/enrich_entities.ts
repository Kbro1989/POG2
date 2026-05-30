import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * EntityInteractionEnricher
 * 
 * Merges interaction mapping data into existing entity definitions
 * to enable context-aware gameplay simulation.
 */
async function run() {
    const mappingPath = join(process.cwd(), "audit_output", "interaction_mapping_full.json");
    const outputDir = join(process.cwd(), "rsmv_inspector", "generated", "enriched");

    const mapping = JSON.parse(readFileSync(mappingPath, 'utf8'));

    // Reverse mapping: EntityID -> { Type, Actions: [ActionNames] }
    const entityRegistry: Record<string, Record<string, string[]>> = {
        npc: {},
        item: {},
        object: {}
    };

    for (const [actionId, data] of Object.entries(mapping)) {
        const { action, entities } = data as any;
        for (const entity of entities) {
            const idKey = entity.id.toString();
            if (!entityRegistry[entity.type][idKey]) {
                entityRegistry[entity.type][idKey] = [];
            }
            entityRegistry[entity.type][idKey].push(action);
        }
    }

    // Process entity files
    const entityFiles = {
        npc: join(process.cwd(), "rsmv_inspector", "generated", "npcs.js"),
        item: join(process.cwd(), "rsmv_inspector", "generated", "items.js"),
        object: join(process.cwd(), "rsmv_inspector", "generated", "objects.js")
    };

    if (!existsSync(outputDir)) { mkdirSync(outputDir, { recursive: true }); }

    for (const [type, path] of Object.entries(entityFiles)) {
        console.log(`Enriching ${type} definitions...`);
        const defs = require(path);

        for (const [id, data] of Object.entries(defs)) {
            const idKey = id.toString();
            if (entityRegistry[type][idKey]) {
                (data as any).pog2_interactions = entityRegistry[type][idKey];
            }
        }

        writeFileSync(join(outputDir, `${type}_enriched.json`), JSON.stringify(defs, null, 2));
    }

    console.log(`Enrichment complete. Files saved to ${outputDir}`);
}

import { existsSync, mkdirSync } from "fs";
run().catch(console.error);
