import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * MakeoverMageSubstrateEnricher
 * 
 * Specifically injects the POG2_APPEARANCE_RESYNTHESIS capability
 * and relevant ClientScript references into the Makeover Mage entities.
 */
async function run() {
    const npcEnrichedPath = join(process.cwd(), "rsmv_inspector", "generated", "enriched", "npc_enriched.json");
    const npcs = JSON.parse(readFileSync(npcEnrichedPath, 'utf8'));

    const targetIds = ["4", "20", "232"];
    
    // Script identifiers identified in forensics
    const makeoverScripts = [
        "makeover_headsetup", 
        "makeover_gender_resynch", 
        "makeover_colour_force"
    ];

    for (const id of targetIds) {
        if (npcs[id]) {
            console.log(`Enriching NPC ID ${id} with Appearance Resynthesis capability...`);
            
            // Ensure array exists
            if (!npcs[id].pog2_interactions) {
                npcs[id].pog2_interactions = [];
            }
            
            // Add capability tag and associated script links
            npcs[id].pog2_interactions.push("POG2_APPEARANCE_RESYNTHESIS");
            npcs[id].pog2_associated_scripts = makeoverScripts;
            
            // Tagging provenance
            npcs[id].pog2_provenance = "[VERIFIED_FORENSIC_EXTRACTION]";
        }
    }

    writeFileSync(npcEnrichedPath, JSON.stringify(npcs, null, 2));
    console.log(`Makeover Mage forensic enrichment complete.`);
}

run().catch(console.error);
