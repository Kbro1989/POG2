import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import * as fs from "fs";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const TARGET_SCRIPTS = [1459712, 1459840, 1676160, 1856000];

async function run() {
    console.log("🚀 Sovereign Behavioral Scrutiny — Decompiling Target Handlers");
    const source = new GameCacheLoader(CACHE_DIR);
    
    for (const scriptId of TARGET_SCRIPTS) {
        const group = Math.floor(scriptId / 128);
        const fileId = scriptId % 128;
        
        const arch = await source.getArchiveById(12, group);
        const file = arch.find(f => f.fileid === fileId);
        
        if (file) {
            console.log(`📜 Script ${scriptId} Bytecode (Hex): ${file.buffer.slice(0, 100).toString('hex')}...`);
            // Looking for Spatial Opcodes:
            // 0x21 (33) -> COORD
            // 0x27 (39) -> MAPZONE
            const hasCoord = file.buffer.includes(0x21);
            const hasMapZone = file.buffer.includes(0x27);
            const hasNecroSkill = file.buffer.includes(27); // Skill ID for Necromancy

            console.log(`   - Has COORD: ${hasCoord}`);
            console.log(`   - Has MAPZONE: ${hasMapZone}`);
            console.log(`   - Has NecroSkill: ${hasNecroSkill}`);
        }
    }
}

run().catch(console.error);
