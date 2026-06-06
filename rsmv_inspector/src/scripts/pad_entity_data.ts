import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

/**
 * EntityPaddingEnricher
 * 
 * Adds "open-ended spots" (null padding) to arrays in entity definitions 
 * to accommodate future "model fat" and functional extensions.
 */
async function run() {
    const entityTypes = ['npc', 'item', 'object'];
    const outputDir = join(process.cwd(), "rsmv_inspector", "generated", "enriched");

    const PAD_SIZE = 10;
    const arrayFields = ["models", "pog2_interactions", "pog2_associated_scripts"];

    for (const type of entityTypes) {
        const filePath = join(outputDir, `${type}_enriched.json`);
        if (!existsSync(filePath)) { continue; }
        
        console.log(`Padding ${type} data...`);
        const entities = JSON.parse(readFileSync(filePath, 'utf8'));

        for (const [id, data] of Object.entries(entities)) {
            const entity = data as any;
            for (const field of arrayFields) {
                if (Array.isArray(entity[field])) {
                    const currentLength = entity[field].length;
                    if (currentLength < PAD_SIZE) {
                        const padding = new Array(PAD_SIZE - currentLength).fill(null);
                        entity[field] = [...entity[field], ...padding];
                    }
                } else {
                    entity[field] = new Array(PAD_SIZE).fill(null);
                }
            }
        }
        writeFileSync(filePath, JSON.stringify(entities, null, 2));
    }
}

run().catch(console.error);
