/**
 * PATHING ARCHAEOLOGIST v2 - Direct Sovereign Memory Scan
 * 
 * Reads the already-extracted JSON dumps from D:\sovereign
 * instead of invoking the rsmv CLI. All data is already there.
 * 
 * Sources:
 *   D:\sovereign\cache_pedagogy\json_dumps\objects.json (7.2MB)
 *   D:\sovereign\cache_pedagogy\json_dumps\npcs.json    (1.7MB)
 *   D:\sovereign\memory\pedagogy\varbits.json           (4.5MB)
 *   D:\sovereign\memory\pedagogy\kinematics.json
 * 
 * Targets:
 *   1. Mine cart / track / transport objects (GE -> Keldagrim route)
 *   2. Mouse Toy (autonomous pathing config)
 *   3. Platypus (follower pursuit geometry)
 *   4. Sextant (coordinate projection)
 *   5. Smuggler / patrol NPCs (Havenhythe reference)
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

// ═══════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════
const SOVEREIGN_BASE = 'D:/sovereign';
const OUTPUT_DIR = 'D:/sovereign/atlas/spatial/pathing_theory';

const OBJECTS_PATH = resolve(SOVEREIGN_BASE, 'cache_pedagogy/json_dumps/objects.json');
const NPCS_PATH = resolve(SOVEREIGN_BASE, 'cache_pedagogy/json_dumps/npcs.json');
const VARBITS_PATH = resolve(SOVEREIGN_BASE, 'memory/pedagogy/varbits.json');
const KINEMATICS_PATH = resolve(SOVEREIGN_BASE, 'memory/pedagogy/kinematics.json');

// Transport keywords (objects)
const TRANSPORT_KEYWORDS = [
    'cart', 'mine cart', 'minecart', 'track', 'rail',
    'transport', 'travel', 'ride', 'board', 'station',
    'trapdoor', 'tunnel', 'passage', 'keldagrim',
    'dwarven', 'dwarf',
];

// Kinetic / pathing entity keywords
const KINETIC_KEYWORDS = [
    'mouse toy', 'toy mouse', 'wind-up', 'wind up',
    'platypus',
    'sextant',
    'smuggler', 'dead smuggler',
    'patrol', 'guard route',
];

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function ensureDir(dir: string) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function loadJson(path: string, label: string): any[] {
    console.log(`  Loading ${label} from ${path}...`);
    if (!existsSync(path)) {
        console.log(`  [SKIP] File not found: ${path}`);
        return [];
    }
    try {
        const raw = readFileSync(path, 'utf-8');
        const parsed = JSON.parse(raw);
        // Handle both array format and {files:[...]} batched format
        if (Array.isArray(parsed)) return parsed;
        if (parsed.files && Array.isArray(parsed.files)) return parsed.files;
        // Single object — wrap it
        return [parsed];
    } catch (e: any) {
        console.error(`  [ERR] Failed to parse ${label}: ${e.message?.slice(0, 100)}`);
        return [];
    }
}

function searchEntities(entities: any[], keywords: string[]): any[] {
    const hits: any[] = [];
    const lowerKeywords = keywords.map(k => k.toLowerCase());

    for (const entity of entities) {
        if (!entity) continue;
        const name = (entity.name || '').toLowerCase();
        const rawStr = JSON.stringify(entity).toLowerCase();

        for (const kw of lowerKeywords) {
            if (name.includes(kw) || rawStr.includes(kw)) {
                hits.push({
                    keyword: kw,
                    id: entity.$fileid ?? entity.id ?? 'unknown',
                    name: entity.name ?? '',
                    // Capture all potentially relevant fields
                    models: entity.models,
                    op: entity.op,           // interaction options
                    params: entity.params,
                    extra: entity.extra,
                    boundSize: entity.boundSize,
                    walkRange: entity.walkRange,
                    respawnDirection: entity.respawnDirection,
                    movementType: entity.movementType,
                    followerPriority: entity.followerPriority,
                    actions: entity.actions,
                    morphs: entity.morphs_1 || entity.morphs_2,
                });
                break; // one keyword match per entity
            }
        }
    }
    return hits;
}

// ═══════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════
async function main() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║   PATHING ARCHAEOLOGIST v2 — SOVEREIGN MEMORY SCAN    ║');
    console.log('║   Reading pre-extracted JSON dumps from D:\\sovereign   ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    ensureDir(OUTPUT_DIR);

    // ─── LOAD ALL DATA ───
    console.log('━━━ PHASE 1: Loading Sovereign Memory ━━━');
    const objects = loadJson(OBJECTS_PATH, 'objects.json');
    const npcs = loadJson(NPCS_PATH, 'npcs.json');
    let varbits: any[] = [];
    let kinematics: any[] = [];
    
    try { varbits = loadJson(VARBITS_PATH, 'varbits.json'); } catch {}
    try { kinematics = loadJson(KINEMATICS_PATH, 'kinematics.json'); } catch {}

    console.log(`\n  Objects loaded: ${objects.length}`);
    console.log(`  NPCs loaded:    ${npcs.length}`);
    console.log(`  Varbits loaded: ${varbits.length}`);
    console.log(`  Kinematics:     ${kinematics.length}`);

    // ─── TRANSPORT SCAN ───
    console.log('\n━━━ PHASE 2: Transport Infrastructure Scan ━━━');
    const transportObjects = searchEntities(objects, TRANSPORT_KEYWORDS);
    console.log(`  Transport object hits: ${transportObjects.length}`);

    // Specifically isolate mine cart objects
    const mineCartObjects = transportObjects.filter(h => 
        h.name.toLowerCase().includes('cart') || 
        h.name.toLowerCase().includes('track') ||
        h.name.toLowerCase().includes('rail')
    );
    console.log(`  Mine cart/track/rail specific: ${mineCartObjects.length}`);

    // ─── KINETIC SCAN ───
    console.log('\n━━━ PHASE 3: Kinetic Target Scan ━━━');
    const kineticObjects = searchEntities(objects, KINETIC_KEYWORDS);
    const kineticNpcs = searchEntities(npcs, KINETIC_KEYWORDS);
    console.log(`  Kinetic object hits: ${kineticObjects.length}`);
    console.log(`  Kinetic NPC hits:    ${kineticNpcs.length}`);

    // ─── KELDAGRIM SPECIFIC ───
    console.log('\n━━━ PHASE 4: Keldagrim-Specific Isolation ━━━');
    const keldagrimHits = searchEntities(objects, ['keldagrim']);
    const keldagrimNpcs = searchEntities(npcs, ['keldagrim']);
    console.log(`  Keldagrim objects: ${keldagrimHits.length}`);
    console.log(`  Keldagrim NPCs:   ${keldagrimNpcs.length}`);

    // ─── LOG DETAILED HITS ───
    console.log('\n━━━ PHASE 5: Detailed Hit Report ━━━');

    if (mineCartObjects.length > 0) {
        console.log('\n  ── MINE CART / TRACK OBJECTS ──');
        for (const h of mineCartObjects) {
            console.log(`  [${h.id}] "${h.name}" (keyword: ${h.keyword})`);
            if (h.op) console.log(`    Actions: ${JSON.stringify(h.op)}`);
            if (h.params) console.log(`    Params: ${JSON.stringify(h.params)}`);
        }
    }

    if (kineticObjects.length > 0) {
        console.log('\n  ── KINETIC OBJECTS ──');
        for (const h of kineticObjects) {
            console.log(`  [${h.id}] "${h.name}" (keyword: ${h.keyword})`);
            if (h.params) console.log(`    Params: ${JSON.stringify(h.params)}`);
        }
    }

    if (kineticNpcs.length > 0) {
        console.log('\n  ── KINETIC NPCs ──');
        for (const h of kineticNpcs) {
            console.log(`  [${h.id}] "${h.name}" (keyword: ${h.keyword})`);
            if (h.walkRange) console.log(`    WalkRange: ${h.walkRange}`);
            if (h.movementType) console.log(`    MovementType: ${h.movementType}`);
            if (h.boundSize) console.log(`    BoundSize: ${h.boundSize}`);
            if (h.models) console.log(`    Models: ${JSON.stringify(h.models)}`);
        }
    }

    // ─── COMPILE FULL REPORT ───
    console.log('\n━━━ PHASE 6: Compiling Archaeology Report ━━━');
    const report = {
        archaeologist_version: 2,
        timestamp: new Date().toISOString(),
        sources: {
            objects: OBJECTS_PATH,
            npcs: NPCS_PATH,
            varbits: VARBITS_PATH,
            kinematics: KINEMATICS_PATH,
        },
        counts: {
            total_objects: objects.length,
            total_npcs: npcs.length,
            total_varbits: varbits.length,
            transport_hits: transportObjects.length,
            mine_cart_specific: mineCartObjects.length,
            kinetic_object_hits: kineticObjects.length,
            kinetic_npc_hits: kineticNpcs.length,
            keldagrim_objects: keldagrimHits.length,
            keldagrim_npcs: keldagrimNpcs.length,
        },
        transport_infrastructure: transportObjects,
        mine_cart_track_objects: mineCartObjects,
        kinetic_objects: kineticObjects,
        kinetic_npcs: kineticNpcs,
        keldagrim_objects: keldagrimHits,
        keldagrim_npcs: keldagrimNpcs,
    };

    const reportPath = resolve(OUTPUT_DIR, 'ge_keldagrim_trace.json');
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n[OK] Full archaeology report: ${reportPath}`);

    // ─── SUMMARY ───
    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log(`║  Total Objects Scanned:   ${String(objects.length).padStart(8)}                   ║`);
    console.log(`║  Total NPCs Scanned:      ${String(npcs.length).padStart(8)}                   ║`);
    console.log(`║  Transport Hits:          ${String(transportObjects.length).padStart(8)}                   ║`);
    console.log(`║  Mine Cart Specific:      ${String(mineCartObjects.length).padStart(8)}                   ║`);
    console.log(`║  Kinetic Object Hits:     ${String(kineticObjects.length).padStart(8)}                   ║`);
    console.log(`║  Kinetic NPC Hits:        ${String(kineticNpcs.length).padStart(8)}                   ║`);
    console.log(`║  Keldagrim Objects:       ${String(keldagrimHits.length).padStart(8)}                   ║`);
    console.log(`║  Keldagrim NPCs:          ${String(keldagrimNpcs.length).padStart(8)}                   ║`);
    console.log('╚══════════════════════════════════════════════════════════╝');
}

main().catch(e => {
    console.error('[FATAL] Pathing Archaeologist crashed:', e);
    process.exit(1);
});
