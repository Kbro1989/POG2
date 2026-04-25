import { HUDForensicsLimb } from '../limbs/spatial/HUDForensicsLimb.js';
import fs from 'fs';

async function investigate() {
    console.log("Starting Photo Booth Forensic Investigation...");
    const hud = new HUDForensicsLimb();
    
    console.log("Searching for 'Photo Booth' in Interface Substrate (Major 3)...");
    const results = await hud.searchInterfaces("Photo Booth");
    
    if (results.ok) {
        results.value.forEach(res => {
            console.log(`\n[FOUND] Interface ${res.interfaceId}: ${res.textLabels.join(', ')}`);
            console.log(`Components: ${res.components.length}`);
            
            res.components.forEach(c => {
                if (c.modelId) console.log(`  -> Component ${c.componentId} has Model ${c.modelId} (Possible Player Viewport)`);
                if (c.text && c.text.toLowerCase().includes('snapshot')) {
                    console.log(`  -> Component ${c.componentId} is the SNAPSHOT BUTTON: "${c.text}"`);
                }
            });
        });
    } else {
        console.error("Search failed:", results.error);
    }

    // Also check interface 8969 directly (from the Prop 4393 hit)
    console.log("\nDirectly Probing Interface 8969 (Candidate from Prop 4393)...");
    const directRes = await hud.getInterface(8969);
    if (directRes.ok) {
        console.log(`[ID MATCH] Interface 8969: ${directRes.value.textLabels.join(', ')}`);
    } else {
        console.log("[ID MATCH] Interface 8969 not found in standard range.");
    }
}

investigate().catch(console.error);
