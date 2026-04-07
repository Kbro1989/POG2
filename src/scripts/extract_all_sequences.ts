import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const SEQ_OUTPUT = "D:\\sovereign\\atlas\\spatial\\system_taxonomy\\npc_sequences.json";
const SPOT_OUTPUT = "D:\\sovereign\\atlas\\spatial\\system_taxonomy\\spotanims.json";

async function run() {
    console.log("🚀 Sovereign Global Animation Forensic — Sequential & Graphic Truth");
    const source = new GameCacheLoader(CACHE_DIR);
    
    // 1. Extract All Sequences (Major 2 / Minor 12)
    console.log("🎬 Extracting NPC Sequences (Major 2 / Minor 12)...");
    const seqIndex = await source.getCacheIndex(2);
    const sequences: Record<number, any> = {};
    
    const seqArchive = await source.getArchiveById(2, 12);
    for (const file of seqArchive) {
        const buf = file.buffer;
        // Basic frame count search (Opcode 1 in RS2, but varies in RS3)
        // We'll store the raw hex for now for skeletal matching.
        sequences[file.fileid] = { id: file.fileid, size: buf.length, hex: buf.slice(0, 32).toString('hex') };
    }
    fs.writeFileSync(SEQ_OUTPUT, JSON.stringify(sequences, null, 2));

    // 2. Extract All SpotAnims (Major 2 / Minor 13)
    console.log("✨ Extracting SpotAnims (Major 2 / Minor 13)...");
    const spotArchive = await source.getArchiveById(2, 13);
    const spotAnims: Record<number, any> = {};
    for (const file of spotArchive) {
        const buf = file.buffer;
        // Search for Model ID (Opcode 1) and Sequence ID (Opcode 2)
        let modelId = null;
        let seqId = null;
        
        if (buf[0] === 1) modelId = buf.readUInt16BE(1);
        if (buf[3] === 2) seqId = buf.readUInt16BE(4);

        spotAnims[file.fileid] = { id: file.fileid, modelId, seqId, raw: buf.toString('hex') };
    }
    fs.writeFileSync(SPOT_OUTPUT, JSON.stringify(spotAnims, null, 2));

    console.log(`✅ Extraction Complete. Found ${Object.keys(sequences).length} Sequences and ${Object.keys(spotAnims).length} SpotAnims.`);
}

run().catch(console.error);
