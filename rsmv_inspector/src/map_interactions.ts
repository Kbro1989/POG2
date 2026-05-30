import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * InteractionEntityMapper
 * 
 * Maps interaction vocabulary IDs to NPC definition actions.
 * Generates the ground truth mapping for POG2 gameplay simulation.
 */
async function run() {
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

/**
 * InteractionEntityMapper
 * 
 * Maps interaction vocabulary IDs to NPC definition actions.
 * Generates the ground truth mapping for POG2 gameplay simulation.
 */
async function run() {
    const vocabPath = join(process.cwd(), "public", "interaction_vocabulary.json");
    const npcDefPath = join(process.cwd(), "rsmv_inspector", "generated", "npcs.js");
    const outputPath = join(process.cwd(), "audit_output", "interaction_mapping.json");

    const vocab = JSON.parse(readFileSync(vocabPath, 'utf8'));
    const npcDefs = require(npcDefPath); 


    const mapping: Record<number, { action: string, npcs: number[] }> = {};

    // Vocab actions map [name, id]
    for (const [actionName, actionId] of vocab.actions) {
        mapping[actionId] = { action: actionName, npcs: [] };
    }

    // Iterate through all NPCs and check their action fields (actions_0 to actions_4)
    for (const [npcId, npcData] of Object.entries(npcDefs)) {
        const data = npcData as any;
        for (let i = 0; i < 5; i++) {
            const actionKey = `actions_${i}`;
            const actionName = data[actionKey];
            if (actionName) {
                // Find matching action ID from vocab
                const actionEntry = vocab.actions.find((a: [string, number]) => a[0] === actionName);
                if (actionEntry) {
                    const actionId = actionEntry[1];
                    mapping[actionId].npcs.push(parseInt(npcId));
                }
            }
        }
    }

    writeFileSync(outputPath, JSON.stringify(mapping, null, 2));
    console.log(`Mapping generated at ${outputPath}`);
}

run().catch(console.error);
