import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { WikiEnricher } from "../../../src/utils/WikiEnricher.js";

/**
 * EntityInteractionBatchEnricher
 * 
 * Performs a final pass over the entity datasets, populating authoritative
 * interaction data into the substrate.
 */
async function run() {
    const entityTypes = ['npc', 'item', 'object'];
    const inputDir = join(process.cwd(), "data", "entity_instances");
    const outputDir = join(process.cwd(), "rsmv_inspector", "generated", "enriched");

    for (const type of entityTypes) {
        const filePath = join(outputDir, `${type}_enriched.json`);
        if (!existsSync(filePath)) {
            console.warn(`File ${filePath} not found, skipping.`);
            continue;
        }

        console.log(`Enriching ${type} interactions via WikiEnricher...`);
        const entities = JSON.parse(readFileSync(filePath, 'utf8'));

        for (const [id, data] of Object.entries(entities)) {
            const entity = data as any;
            if (entity.name) {
                // Enrich using authoritative substrate first
                const enriched = await WikiEnricher.enrich(entity.name, parseInt(id), type);
                if (enriched.ok) {
                    entity.pog2_interactions = enriched.value.pog2_interactions;
                }
            }
        }

        writeFileSync(filePath, JSON.stringify(entities, null, 2));
        console.log(`${type} enrichment complete.`);
    }
}

run().catch(console.error);
