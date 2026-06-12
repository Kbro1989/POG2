import { cacheMajors } from "rsmv_inspector/constants";
import { GameCacheLoader } from "rsmv_inspector/cache/sqlite";
import { parse } from "rsmv_inspector/opdecoder";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const OUTPUT_FILE = "D:\\sovereign\\atlas\\spatial\\npc_extract\\npcs_total_v2.json";

function unpackCoord(packed: number): { x: number, z: number, plane: number } {
    const plane = (packed >> 28) & 0x3;
    const x = (packed >> 14) & 0x3FFF;
    const z = packed & 0x3FFF;
    return { x, z, plane };
}

async function run() {
    console.log("🚀 Sovereign Total Spawn Extraction (Plane-Aware)");
    const source = new GameCacheLoader(CACHE_DIR);

    // We target Major 41 (DBRows)
    // In RS3, Major 40 = DBTable Defs, Major 41 = DBRow Data
    const DB_ROWS_MAJOR = 41;

    const index = await source.getCacheIndex(DB_ROWS_MAJOR);
    console.log(`📊 Scanning ${index.length} archives in Major ${DB_ROWS_MAJOR}...`);

    const allSpawns: any[] = [];
    let processed = 0;

    for (const group of index) {
        if (!group) continue;
        try {
            const arch = await source.getFileArchive(group);
            for (const file of arch) {
                try {
                    const row = parse.dbrows.read(file.buffer, source) as any;
                    const tableId = row.table ?? -1;

                    // Table 39 is the standard NPC Spawn table in RS3 God Cache
                    if (tableId !== 39) continue;

                    const colGroups = row.unk01?.columndata;
                    if (!colGroups) continue;

                    let npcId: number | null = null;
                    let coord: number | null = null;

                    for (const g of colGroups) {
                        for (const col of g.columns) {
                            if (col.type === 32) npcId = Number(col.value[0]); // npc_ref
                            if (col.type === 33) coord = Number(col.value[0]); // coordinate
                        }
                    }

                    if (npcId !== null && coord !== null) {
                        const { x, z, plane } = unpackCoord(coord);
                        allSpawns.push({
                            id: npcId,
                            x,
                            z,
                            plane,
                            rowId: file.fileid
                        });
                    }
                } catch (_error) {
                    // [SILENT NECROSIS LOGGER]
                    console.warn("[SILENT NECROSIS] Caught in extract_all_spawns: ", _error);
                }
            }
            processed++;
            if (processed % 100 === 0) {
                console.log(`  Progress: ${processed}/${index.length} archives scanned... Found ${allSpawns.length} spawns`);
            }
        } catch (_error) {
            // [SILENT NECROSIS LOGGER]
            console.warn("[SILENT NECROSIS] Caught in extract_all_spawns: ", _error);
        }
    }

    // Partition by mapsquare
    console.log(`✅ Extraction Complete. Total spawns: ${allSpawns.length}`);
    console.log("📂 Partitioning data by mapsquare...");

    const msPartition: Record<string, any[]> = {};
    for (const s of allSpawns) {
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
