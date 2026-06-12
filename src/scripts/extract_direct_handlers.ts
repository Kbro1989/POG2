import { GameCacheLoader } from "rsmv/cache/sqlite";
import * as fs from "fs";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const TARGET_NPCS = [0, 30308]; // Hans, Kili

async function run() {
    console.log("🚀 Sovereign Direct Handler Scrutiny...");
    const source = new GameCacheLoader(CACHE_DIR);

    for (const npcId of TARGET_NPCS) {
        const group = Math.floor(npcId / 128);
        const fileId = npcId % 128;

        const arch = await source.getArchiveById(18, group);
        const file = arch.find(f => f.fileid === fileId);

        if (file) {
            console.log(`👤 NPC ${npcId} Hex: ${file.buffer.toString('hex')}`);
            // Scanning for Script Opcodes (In RS3, these are often part of Opcode 150-160 range)
            // Or look for Param Map 249 (which we already checked but maybe missed)
        }
    }
}

run().catch(console.error);

