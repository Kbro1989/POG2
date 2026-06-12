/**
 * sovereign_npc_extract.ts
 * 
 * REAL NPC extraction from God Cache. No mocks.
 * 
 * Two data sources:
 *   1. NPC definitions (Major 18) — name, actions, combat level, size, models
 *   2. NPC spawns (DBRows) — which NPCs spawn where (table + coord columns)
 * 
 * Output: D:/sovereign/atlas/spatial/npc_extract/
 */

import { GameCacheLoader } from "rsmv_inspector/cache/sqlite";
import { cacheMajors, cacheConfigPages } from "rsmv_inspector/constants";
import { parse } from "rsmv_inspector/opdecoder";
import { archiveToFileId } from "rsmv_inspector/cache/index";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const OUTPUT_ROOT = "D:\\sovereign\\atlas\\spatial\\npc_extract";

if (!fs.existsSync(OUTPUT_ROOT)) fs.mkdirSync(OUTPUT_ROOT, { recursive: true });

interface NpcDef {
    id: number;
    name: string | null;
    actions: (string | null)[];
    size: number | null;
    combatLevel: number | null;
    models: number[] | null;
    morphVarbit: number | null;
    morphVarp: number | null;
}

interface NpcSpawn {
    npcId: number;
    coord: number | null;   // packed coordinate from cache
    worldX: number | null;  // unpacked
    worldZ: number | null;  // unpacked
    plane: number | null;   // unpacked
    tableId: number;
    rowId: number;
}

// RS3 packed coordinate unpacking
function unpackCoord(packed: number): { x: number, z: number, plane: number } {
    const plane = (packed >> 28) & 0x3;
    const x = (packed >> 14) & 0x3FFF;
    const z = packed & 0x3FFF;
    return { x, z, plane };
}

async function run() {
    console.log("🚀 Sovereign NPC Extract — God Cache Only");
    console.log(`📂 Cache: ${CACHE_DIR}`);

    const source = new GameCacheLoader(CACHE_DIR);

    // ── 1. Extract ALL NPC definitions from Major 18 ──
    console.log("\n── Phase 1: NPC Definitions (Major 18) ──");
    const npcDefs: Record<number, NpcDef> = {};
    let npcCount = 0;

    try {
        const npcIndex = await source.getCacheIndex(cacheMajors.npcs);
        for (const group of npcIndex) {
            if (!group) continue;
            const arch = await source.getFileArchive(group);
            for (const file of arch) {
                const logicalId = archiveToFileId(cacheMajors.npcs, group.minor, file.fileid);
                try {
                    const npc = parse.npc.read(file.buffer, source) as any;

                    // Extract morph varbit/varp if present
                    let morphVarbit: number | null = null;
                    let morphVarp: number | null = null;
                    const morphs = npc.morphs_1 || npc.morphs_2;
                    if (morphs && morphs.unk1 !== undefined) {
                        morphVarbit = (morphs.unk1 >> 16) & 0xFFFF;
                        morphVarp = morphs.unk1 & 0xFFFF;
                        if (morphVarbit === 0xFFFF) morphVarbit = null;
                        if (morphVarp === 0xFFFF) morphVarp = null;
                    }

                    npcDefs[logicalId] = {
                        id: logicalId,
                        name: npc.name ?? null,
                        actions: [
                            npc.actions_0 ?? null,
                            npc.actions_1 ?? null,
                            npc.actions_2 ?? null,
                            npc.actions_3 ?? null,
                            npc.actions_4 ?? null,
                        ],
                        size: npc.boundSize ?? null,
                        combatLevel: npc.combat ?? null,
                        models: npc.models?.map((m: any) => m.values?.[0] ?? m) ?? null,
                        morphVarbit,
                        morphVarp,
                    };
                    npcCount++;
                } catch (_error) {
                    // [SILENT NECROSIS LOGGER]
                    console.warn("[SILENT NECROSIS] Caught in sovereign_npc_extract: ", _error);
                }
            }
        }
    } catch (e) {
        console.error("NPC index scan failed:", e);
    }

    console.log(`✅ Loaded ${npcCount} NPC definitions`);

    // Write NPC defs registry
    const npcDefsPath = path.join(OUTPUT_ROOT, "npc_definitions.json");
    fs.writeFileSync(npcDefsPath, JSON.stringify(npcDefs, null, 2));
    console.log(`📝 Wrote ${npcDefsPath}`);

    // ── 2. Scan DBRows for NPC spawn coordinates ──
    console.log("\n── Phase 2: NPC Spawn Locations (DBRows) ──");
    const spawns: NpcSpawn[] = [];

    try {
        const configIndex = await source.getCacheIndex(cacheMajors.config);
        const dbrowsPage = configIndex.find((p: any) => p && p.minor === cacheConfigPages.dbrows);

        if (!dbrowsPage) {
            console.error("❌ DBRows archive not found");
        } else {
            const arch = await source.getFileArchive(dbrowsPage);
            console.log(`📊 Scanning ${arch.length} DBRows for spawn data...`);

            let spawnCount = 0;
            for (const file of arch) {
                try {
                    const row = parse.dbrows.read(file.buffer, source) as any;
                    const tableId = row.tableId ?? -1;
                    const colGroups = row.group1?.columndata || row.group2?.columndata || row.group3?.columndata;

                    if (!colGroups) continue;

                    let npcId: number | null = null;
                    const rowCoords: number[] = [];

                    for (const entry of colGroups) {
                        for (const col of entry.columns) {
                            const values = Array.isArray(col.value) ? col.value : [col.value];
                            for (const val of values) {
                                if (val === undefined || val === null) continue;
                                if ((col.type === 32 || col.type === 0 || col.type === 1) && npcId === null) {
                                    npcId = Number(val);
                                }
                                if (col.type === 33 || col.type === 22 || col.type === 9) {
                                    rowCoords.push(Number(val));
                                }
                            }
                        }
                    }

                    if (rowCoords.length > 0) {
                        const finalNpcId = npcId ?? file.fileid;
                        for (const coord of rowCoords) {
                            const unpacked = unpackCoord(coord);
                            spawns.push({
                                npcId: finalNpcId,
                                coord,
                                worldX: unpacked.x,
                                worldZ: unpacked.z,
                                plane: unpacked.plane,
                                tableId,
                                rowId: file.fileid,
                            });
                            spawnCount++;
                        }
                    }
                } catch (_error) {
                    // [SILENT NECROSIS LOGGER]
                    console.warn("[SILENT NECROSIS] Caught in sovereign_npc_extract: ", _error);
                }
            }

            console.log(`✅ Found ${spawnCount} NPC spawn entries with coordinates`);
        }
    } catch (e) {
        console.error("DBRows scan failed:", e);
    }

    // Enrich spawns with NPC names
    const enrichedSpawns = spawns.map(s => ({
        ...s,
        npcName: npcDefs[s.npcId]?.name ?? null,
        npcActions: npcDefs[s.npcId]?.actions ?? null,
        npcSize: npcDefs[s.npcId]?.size ?? null,
        npcCombatLevel: npcDefs[s.npcId]?.combatLevel ?? null,
    }));

    // Write spawns (flat)
    const spawnsPath = path.join(OUTPUT_ROOT, "npc_spawns.json");
    fs.writeFileSync(spawnsPath, JSON.stringify(enrichedSpawns, null, 2));
    console.log(`📝 Wrote ${spawnsPath} (${enrichedSpawns.length} entries)`);

    // ── 3. Create Partitioned V3 Dataset for Synthesis ──
    console.log("\n── Phase 3: Partitioning for Synthesis ──");
    const partitioned: Record<string, any[]> = {};
    for (const s of enrichedSpawns) {
        const msX = Math.floor(s.worldX! / 64);
        const msZ = Math.floor(s.worldZ! / 64);
        const msId = `ms_${msX}_${msZ}`;

        if (!partitioned[msId]) partitioned[msId] = [];
        partitioned[msId].push({
            id: s.npcId,
            x: s.worldX,
            z: s.worldZ,
            plane: s.plane
        });
    }

    const v3Path = path.join(OUTPUT_ROOT, "npcs_total_v3.json");
    fs.writeFileSync(v3Path, JSON.stringify(partitioned, null, 2));
    console.log(`📝 Wrote ${v3Path} (${Object.keys(partitioned).length} mapsquares)`);

    // ── Summary stats ──
    const tableDistribution: Record<number, number> = {};
    for (const s of spawns) {
        tableDistribution[s.tableId] = (tableDistribution[s.tableId] || 0) + 1;
    }
    console.log("\n📊 Spawn table distribution:");
    for (const [tid, count] of Object.entries(tableDistribution).sort((a, b) => Number(b[1]) - Number(a[1])).slice(0, 10)) {
        console.log(`   Table ${tid}: ${count} spawns`);
    }

    // Sample output
    const namedSpawns = enrichedSpawns.filter(s => s.npcName);
    console.log(`\n📍 Sample named spawns (first 10):`);
    for (const s of namedSpawns.slice(0, 10)) {
        console.log(`   ${s.npcName} (ID:${s.npcId}) @ [${s.worldX}, ${s.worldZ}, plane ${s.plane}] — actions: [${s.npcActions?.filter(Boolean).join(", ")}]`);
    }

    (source as any).close?.();
    console.log("\n✅ Sovereign NPC Extract Complete");
}

run().catch(e => {
    console.error("❌ Fatal:", e);
    process.exit(1);
});
