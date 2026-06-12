import { EngineCache } from "../3d/modeltothree";
import { cacheMajors } from "../constants";
import { GameCacheLoader } from "../cache/sqlite";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";

/**
 * MakeoverMageForensicExtractor
 * 
 * Target extraction of specific NPC assets (definition, model, script)
 * for IDs identified in previous audit.
 */
async function run() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape";
    const outputPath = join(process.cwd(), "audit_output", "makeover_mage_forensics");
    const targetIds = [4, 20, 232];
    
    if (!existsSync(outputPath)) {
        mkdirSync(outputPath, { recursive: true });
    }

    const loader = new GameCacheLoader(cachePath);
    const engine = new EngineCache(loader);
    
    for (const npcId of targetIds) {
        console.log(`Extracting forensic data for NPC ID ${npcId}...`);
        
        // 1. Extract NPC Definition
        try {
            const npcDef = await engine.getFileById(cacheMajors.npcs, npcId);
            if (npcDef) {
                writeFileSync(join(outputPath, `npc_${npcId}_def.bin`), npcDef);
                console.log(`Saved definition for NPC ID ${npcId}`);
            }
        } catch (e) {
            console.error(`Failed to extract definition for NPC ID ${npcId}`, e);
        }
    }
    
    console.log("Forensic extraction complete.");
}

run().catch(console.error);
