import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const SEQ_OUTPUT = "D:\\sovereign\\atlas\\spatial\\system_taxonomy\\npc_sequences.json";
const SPOT_OUTPUT = "D:\\sovereign\\atlas\\spatial\\system_taxonomy\\spotanims.json";

async function run() {
    console.log("🚀 Sovereign Global Animation Forensic — Sequential & Graphic Truth (RS3)");
    const source = new GameCacheLoader(CACHE_DIR);
    
    // 1. Extract All Sequences (Major 20)
    console.log("🎬 Extracting NPC Sequences (Major 20)...");
    const seqIndex = await source.getCacheIndex(20);
    const sequences: Record<number, any> = {};
    
    for (const group of seqIndex) {
        if (!group) continue;
        const arch = await source.getFileArchive(group);
        for (const file of arch) {
            const buf = file.buffer;
            const seqId = group.minor * 128 + file.fileid;
            // RS3 Sequence Header logic (Simplified forensic scan)
            sequences[seqId] = { id: seqId, size: buf.length, hex: buf.slice(0, 16).toString('hex') };
        }
    }
    fs.writeFileSync(SEQ_OUTPUT, JSON.stringify(sequences, null, 2));

    // 2. Extract All SpotAnims (Major 21)
    console.log("✨ Extracting SpotAnims (Major 21)...");
    const spotIndex = await source.getCacheIndex(21);
    const spotAnims: Record<number, any> = {};
    
    for (const group of spotIndex) {
        if (!group) continue;
        const arch = await source.getFileArchive(group);
        for (const file of arch) {
            const buf = file.buffer;
            const spotId = group.minor * 256 + file.fileid; // RS3 SpotAnim archive size is usually 256
            
            // Forensic Opcode identification:
            // Opcode 1 (2-byte): Model ID
            // Opcode 2 (2-byte): Animation/Sequence ID
            let modelId = null;
            let animId = null;
            
            if (buf[0] === 1) modelId = buf.readUInt16BE(1);
            if (buf[3] === 2) animId = buf.readUInt16BE(4);

            spotAnims[spotId] = { id: spotId, modelId, animId, raw: buf.toString('hex') };
        }
    }
    fs.writeFileSync(SPOT_OUTPUT, JSON.stringify(spotAnims, null, 2));

    console.log(`✅ Extraction Complete. Found ${Object.keys(sequences).length} Sequences and ${Object.keys(spotAnims).length} SpotAnims.`);
}

run().catch(console.error);
