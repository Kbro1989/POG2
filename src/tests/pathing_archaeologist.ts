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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// CONFIGURATION
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const SOVEREIGN_BASE = 'D:/sovereign';
const OUTPUT_DIR = 'D:/sovereign/atlas/spatial/pathing_theory';
const UNIFIED_EXTRACT_DIR = resolve(SOVEREIGN_BASE, 'atlas/spatial/unified_extract');

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
    'bob', 'the raptor', 'victoria', 'father aereck'
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// HELPERS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
        // Single object â€” wrap it
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
async function main() {
    console.log('â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
    console.log('â•‘   PATHING ARCHAEOLOGIST v2 â€” SOVEREIGN MEMORY SCAN    â•‘');
    console.log('â•‘   Reading pre-extracted JSON dumps from D:\\sovereign   â•‘');
    console.log('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');

    ensureDir(OUTPUT_DIR);

    // â”€â”€â”€ LOAD ALL DATA â”€â”€â”€
    console.log('â”â”â” PHASE 1: Loading Sovereign Memory â”â”â”');
    const objects = loadJson(OBJECTS_PATH, 'objects.json');
    const npcs = loadJson(NPCS_PATH, 'npcs.json');
    let varbits: any[] = [];
    let kinematics: any[] = [];

    try { varbits = loadJson(VARBITS_PATH, 'varbits.json'); } catch { }
    try { kinematics = loadJson(KINEMATICS_PATH, 'kinematics.json'); } catch { }

    console.log(`\n  Objects loaded: ${objects.length}`);
    console.log(`  NPCs loaded:    ${npcs.length}`);
    console.log(`  Varbits loaded: ${varbits.length}`);
    console.log(`  Kinematics:     ${kinematics.length}`);

    // â”€â”€â”€ TRANSPORT SCAN â”€â”€â”€
    console.log('\nâ”â”â” PHASE 2: Transport Infrastructure Scan â”â”â”');
    const transportObjects = searchEntities(objects, TRANSPORT_KEYWORDS);
    console.log(`  Transport object hits: ${transportObjects.length}`);

    // Specifically isolate mine cart objects
    const mineCartObjects = transportObjects.filter(h =>
        h.name.toLowerCase().includes('cart') ||
        h.name.toLowerCase().includes('track') ||
        h.name.toLowerCase().includes('rail')
    );
    console.log(`  Mine cart/track/rail specific: ${mineCartObjects.length}`);

    // â”€â”€â”€ KINETIC SCAN â”€â”€â”€
    console.log('\nâ”â”â” PHASE 3: Kinetic Target Scan â”â”â”');
    const kineticObjects = searchEntities(objects, KINETIC_KEYWORDS);
    const kineticNpcs = searchEntities(npcs, KINETIC_KEYWORDS);
    console.log(`  Kinetic object hits: ${kineticObjects.length}`);
    console.log(`  Kinetic NPC hits:    ${kineticNpcs.length}`);

    // â”€â”€â”€ KELDAGRIM SPECIFIC â”€â”€â”€
    console.log('\nâ”â”â” PHASE 4: Keldagrim-Specific Isolation â”â”â”');
    const keldagrimHits = searchEntities(objects, ['keldagrim']);
    const keldagrimNpcs = searchEntities(npcs, ['keldagrim']);
    console.log(`  Keldagrim objects: ${keldagrimHits.length}`);
    console.log(`  Keldagrim NPCs:   ${keldagrimNpcs.length}`);

    // â”€â”€â”€ LOG DETAILED HITS â”€â”€â”€
    console.log('\nâ”â”â” PHASE 5: Detailed Hit Report â”â”â”');

    if (mineCartObjects.length > 0) {
        console.log('\n  â”€â”€ MINE CART / TRACK OBJECTS â”€â”€');
        for (const h of mineCartObjects) {
            console.log(`  [${h.id}] "${h.name}" (keyword: ${h.keyword})`);
            if (h.op) console.log(`    Actions: ${JSON.stringify(h.op)}`);
            if (h.params) console.log(`    Params: ${JSON.stringify(h.params)}`);
        }
    }

    if (kineticObjects.length > 0) {
        console.log('\n  â”€â”€ KINETIC OBJECTS â”€â”€');
        for (const h of kineticObjects) {
            console.log(`  [${h.id}] "${h.name}" (keyword: ${h.keyword})`);
            if (h.params) console.log(`    Params: ${JSON.stringify(h.params)}`);
        }
    }

    if (kineticNpcs.length > 0) {
        console.log('\n  â”€â”€ KINETIC NPCs â”€â”€');
        for (const h of kineticNpcs) {
            console.log(`  [${h.id}] "${h.name}" (keyword: ${h.keyword})`);
            if (h.walkRange) console.log(`    WalkRange: ${h.walkRange}`);
            if (h.movementType) console.log(`    MovementType: ${h.movementType}`);
            if (h.boundSize) console.log(`    BoundSize: ${h.boundSize}`);
            if (h.models) console.log(`    Models: ${JSON.stringify(h.models)}`);
        }
    }

    // â”€â”€â”€ COMPILE FULL REPORT â”€â”€â”€
    console.log('\nâ”â”â” PHASE 6: Compiling Archaeology Report â”â”â”');
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

    // â”€â”€â”€ SUMMARY â”€â”€â”€
    console.log('\nâ•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
    console.log(`â•‘  Total Objects Scanned:   ${String(objects.length).padStart(8)}                   â•‘`);
    console.log(`â•‘  Total NPCs Scanned:      ${String(npcs.length).padStart(8)}                   â•‘`);
    console.log(`â•‘  Transport Hits:          ${String(transportObjects.length).padStart(8)}                   â•‘`);
    console.log(`â•‘  Mine Cart Specific:      ${String(mineCartObjects.length).padStart(8)}                   â•‘`);
    console.log(`â•‘  Kinetic Object Hits:     ${String(kineticObjects.length).padStart(8)}                   â•‘`);
    console.log(`â•‘  Kinetic NPC Hits:        ${String(kineticNpcs.length).padStart(8)}                   â•‘`);
    console.log(`â•‘  Keldagrim Objects:       ${String(keldagrimHits.length).padStart(8)}                   â•‘`);
    console.log(`â•‘  Keldagrim NPCs:          ${String(keldagrimNpcs.length).padStart(8)}                   â•‘`);
    console.log('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
}

main().catch(e => {
    console.error('[FATAL] Pathing Archaeologist crashed:', e);
    process.exit(1);
});
