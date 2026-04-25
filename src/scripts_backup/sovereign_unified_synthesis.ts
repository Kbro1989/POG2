/**
 * sovereign_unified_synthesis.ts — v2.0 (Targeted & Plane-Aware)
 * 
 * THE 10/10 GLOBAL TRUTH SYNTHESIZER
 * 
 * Merges raw cache extracts with the Pedagogy Knowledge Base.
 * Prioritizes Lumbridge, Castle, and Catacombs for definitive grounding.
 */

import * as fs from "fs";
import * as path from "path";

const PEDAGOGY_DIR = "D:\\sovereign\\memory\\pedagogy";
const MAPZONES_DIR = path.join(PEDAGOGY_DIR, "mapzones_json");
const WORLD_EXTRACT_DIR = "D:\\sovereign\\atlas\\spatial\\world_extract";
const NPC_EXTRACT_DIR = "D:\\sovereign\\atlas\\spatial\\npc_extract";
const UNIFIED_OUTPUT_DIR = "D:\\sovereign\\atlas\\spatial\\unified_extract";

// Target regions for prioritized grounding (Lumbridge / Catacombs / Cellar)
const TARGET_REGIONS = [
    "ms_50_50", "ms_51_50", // Castle / Courtyard
    "ms_51_77",             // Cellar / Tutorial
    "ms_60_86", "ms_61_85", "ms_62_85" // Catacombs Layers
];

if (!fs.existsSync(UNIFIED_OUTPUT_DIR)) fs.mkdirSync(UNIFIED_OUTPUT_DIR, { recursive: true });

async function run() {
    console.log("🧬 Sovereign Unified Synthesis v2.0 — Targeting Lumbridge 10/10 Truth");

    // 1. Load Pedagogy Registries
    console.log("📚 Loading Pedagogy registries...");
    const npcsPedagogy = JSON.parse(fs.readFileSync(path.join(PEDAGOGY_DIR, "npcs.json"), "utf-8"));
    const npcTraitMap = new Map<number, any>();
    for (const npc of npcsPedagogy) npcTraitMap.set(npc.id, npc);

    const mapzones: any[] = [];
    if (fs.existsSync(MAPZONES_DIR)) {
        for (const file of fs.readdirSync(MAPZONES_DIR)) {
            if (!file.endsWith(".json")) continue;
            try { mapzones.push(JSON.parse(fs.readFileSync(path.join(MAPZONES_DIR, file), "utf-8"))); } catch {}
        }
    }
    console.log(`✅ Loaded ${npcTraitMap.size} NPC traits and ${mapzones.length} MapZones`);

    // 2. Load V3 Partitioned NPC Spawns (Definitive 380k dataset)
    console.log("📍 Loading Partitioned NPC Spawns (V3)...");
    const spawnsV3 = JSON.parse(fs.readFileSync(path.join(NPC_EXTRACT_DIR, "npcs_total_v3.json"), "utf-8"));
    
    // 3. Synthesize Mapsquares
    const allMsFiles = fs.readdirSync(WORLD_EXTRACT_DIR).filter(f => f.startsWith("ms_") && f.endsWith(".json"));
    
    // Filter for targets if we want priority
    const msFiles = allMsFiles.filter(f => TARGET_REGIONS.includes(f.replace(".json", "")));
    if (msFiles.length === 0) {
        console.warn("⚠️ No target mapsquares found in world_extract. Check directory.");
        return;
    }

    console.log(`🌍 Synthesizing ${msFiles.length} Target Mapsquares...`);

    for (const msFile of msFiles) {
        try {
            const msId = msFile.replace(".json", "");
            const msData = JSON.parse(fs.readFileSync(path.join(WORLD_EXTRACT_DIR, msFile), "utf-8"));
            
            // Get local NPCs from partitioned V3 data
            const localSpawns = spawnsV3[msId] || [];

            const enrichedNpcs = localSpawns.map((s: any) => {
                const traits = npcTraitMap.get(s.id);
                return {
                    id: s.id,
                    x: s.x,
                    z: s.z,
                    plane: s.plane,
                    pedagogy: traits ? { traits } : null
                };
            });

            // Spatial Metadata (High-Fidelity Zones)
            const localZones = mapzones.filter(z => {
                if (!z.bounds) return false;
                return z.bounds.some((b: any) => 
                    !(b.src.xend < msData.worldX || b.src.xstart >= msData.worldX + 64 ||
                      b.src.zend < msData.worldZ || b.src.zstart >= msData.worldZ + 64)
                );
            });

            // Unified Bundle
            const unified = {
                ...msData,
                pedagogy: {
                    zones: localZones.map(z => ({ id: z.id, name: z.name, internal_name: z.internal_name, bounds: z.bounds })),
                    npcs: enrichedNpcs,
                    stats: {
                        totalFound: localSpawns.length,
                        pedagogyMatched: enrichedNpcs.filter((n: any) => n.pedagogy).length
                    },
                    _meta: {
                        synthesisDate: new Date().toISOString(),
                        version: "v2.0-Definitive-Targeted"
                    }
                }
            };

            fs.writeFileSync(path.join(UNIFIED_OUTPUT_DIR, msFile), JSON.stringify(unified, null, 2));
            console.log(`   ✅ [10/10] Synthesized ${msId}: Found ${localSpawns.length} NPC spawns across all layers.`);
        } catch (err) {
            console.error(`❌ Error in ${msFile}:`, err);
        }
    }
    console.log("\n✅ Targeted Synthesis Complete.");
}

run().catch(console.error);
