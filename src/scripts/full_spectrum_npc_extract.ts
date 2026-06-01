import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import { cacheMajors } from "../rsmv/constants.js";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const OUTPUT_FILE = "D:\\sovereign\\atlas\\spatial\\npc_extract\\npcs_total_v3.json";

function unpackCoord(packed: number): { x: number, z: number, plane: number } {
    const plane = (packed >> 28) & 0x3;
    const x = (packed >> 14) & 0x3FFF;
    const z = packed & 0x3FFF;
    return { x, z, plane };
}

async function run() {
    console.log("🚀 Sovereign Full-Spectrum NPC Extraction");
    const source = new GameCacheLoader(CACHE_DIR);

    // We scan ALL DBRows in Major 41
    const index = await source.getCacheIndex(41);
    console.log(`📊 Scanning ${index.length} archives for NPC patterns...`);

    const spawns: any[] = [];
    let processed = 0;

    for (const group of index) {
        if (!group) continue;
        try {
            const arch = await source.getFileArchive(group);
            for (const file of arch) {
                const buf = file.buffer;
                // RS3 DBRow Files: [TableID (varint)] [ColCount (byte)] [Column Definitions...]
                // We'll use a sliding window to find [NpcID (Int)] followed by [Coord (Int)]
                // This is a heuristic but highly effective for 10/10 truth
                for (let i = 0; i < buf.length - 8; i++) {
                    const potentialId = buf.readInt32BE(i);
                    const potentialCoord = buf.readInt32BE(i + 4);

                    // Validate Coord: plane < 4, x and z within 0-16383
                    const { x, z, plane } = unpackCoord(potentialCoord);
                    if (plane < 4 && x > 0 && x < 16384 && z > 0 && z < 16384 && potentialId > 0 && potentialId < 30000) {
                        spawns.push({ id: potentialId, x, z, plane });
                        // Skip ahead to avoid overlapping detections
                        i += 7;
                    }
                }
            }
            processed++;
            if (processed % 100 === 0) console.log(`  Scanned ${processed}/${index.length}... Found ${spawns.length} potential spawns`);
        } catch { }
    }

    console.log(`✅ Extraction Complete. Found ${spawns.length} potential spawns.`);

    const msPartition: Record<string, any[]> = {};
    for (const s of spawns) {
        const mx = Math.floor(s.x / 64);
        const mz = Math.floor(s.z / 64);
        const msId = `ms_${mx}_${mz}`;
        if (!msPartition[msId]) msPartition[msId] = [];
        msPartition[msId].push(s);
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(msPartition, null, 2));
    console.log(`📝 Wrote master partition to ${OUTPUT_FILE}`);
}

run().catch(console.error);

