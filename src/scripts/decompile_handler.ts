import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import * as fs from "fs";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const SCRIPT_ID = 1459712;

async function run() {
    console.log(`🚀 Sovereign Bytecode Decompilation — Handler ${SCRIPT_ID}`);
    const source = new GameCacheLoader(CACHE_DIR);

    const group = Math.floor(SCRIPT_ID / 128);
    const fileId = SCRIPT_ID % 128;

    const arch = await source.getArchiveById(12, group);
    const file = arch.find(f => f.fileid === fileId);

    if (file) {
        const buf = file.buffer;
        console.log(`Bytecode Size: ${buf.length} bytes`);

        // In RS3 ClientScript, constants are stored in a pool.
        // We'll search for 32-bit integers that look like COORDS (e.g., Packed Coord 0xXXXXXXXX)
        // A packed coord in RS3 is usually (plane << 28) | (x << 14) | z
        for (let i = 0; i < buf.length - 4; i++) {
            const val = buf.readUInt32BE(i);
            const z = val & 0x3FFF;
            const x = (val >> 14) & 0x3FFF;
            const p = (val >> 28) & 0x3;

            // Filter for plausible coordinates (e.g., Lumbridge 3200, 3200 or Um 1000, 1000)
            if (x > 1000 && x < 15000 && z > 1000 && z < 15000) {
                console.log(`📍 Found Locational Constant at offset ${i}: [Plane ${p}, X ${x}, Z ${z}]`);
            }
        }
    }
}

run().catch(console.error);

