import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * Universal InteractionEntityMapper
 * 
 * Maps interaction vocabulary IDs to NPC, Object, and Item definition actions.
 * Generates comprehensive ground truth mapping for POG2 gameplay simulation.
 */
async function run() {
    const vocabPath = join(process.cwd(), "public", "interaction_vocabulary.json");
    const outputDir = join(process.cwd(), "audit_output");
    
    // Entity Definition Files to scan
    const entityFiles = {
        npc: join(process.cwd(), "rsmv_inspector", "generated", "npcs.js"),
        item: join(process.cwd(), "rsmv_inspector", "generated", "items.js"),
        object: join(process.cwd(), "rsmv_inspector", "generated", "objects.js")
    };

    const vocab = JSON.parse(readFileSync(vocabPath, 'utf8'));
    const mapping: Record<number, { action: string, entities: { type: string, id: number }[] }> = {};

    // Initialize mapping with vocab
    for (const [actionName, actionId] of vocab.actions) {
        mapping[actionId] = { action: actionName, entities: [] };
    }

    // Process all entity types
    for (const [type, path] of Object.entries(entityFiles)) {
        console.log(`Processing ${type} definitions...`);
        const defs = require(path);

        for (const [id, data] of Object.entries(defs)) {
            const entityData = data as any;
            // Iterate action fields (actions_0 to actions_4, and members_actions_0 to members_actions_4)
            const actionKeys = [
                ...Array.from({length: 5}, (_, i) => `actions_${i}`),
                ...Array.from({length: 5}, (_, i) => `members_actions_${i}`)
            ];

            for (const key of actionKeys) {
                const actionName = entityData[key];
                if (actionName) {
                    const actionEntry = vocab.actions.find((a: [string, number]) => a[0] === actionName);
                    if (actionEntry) {
                        const actionId = actionEntry[1];
                        mapping[actionId].entities.push({ type, id: parseInt(id) });
                    }
                }
            }
        }
    }

    writeFileSync(join(outputDir, "interaction_mapping_full.json"), JSON.stringify(mapping, null, 2));
    console.log(`Full interaction mapping generated.`);
}

run().catch(console.error);
