/**
 * PATHING ARCHAEOLOGIST v2.2 — CS2 & Struct Route Tables
 * 
 * The mine cart objects are dumb props. The actual transport logic
 * lives in ClientScript (CS2) and Struct/Enum config tables.
 * 
 * This script scans:
 *   1. enums.json — for route mapping tables (destination IDs)
 *   2. objects.json — deep dump of Keldagrim trapdoor (28094) and
 *      ALL objects with non-empty params/op arrays
 *   3. npcs.json — all NPCs with walkRange or movement data
 *   4. kinematics.json — any kinematic movement definitions
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const SOVEREIGN_BASE = 'D:/sovereign';
const OUTPUT_DIR = 'D:/sovereign/atlas/spatial/pathing_theory';

const OBJECTS_PATH = resolve(SOVEREIGN_BASE, 'cache_pedagogy/json_dumps/objects.json');
const NPCS_PATH = resolve(SOVEREIGN_BASE, 'cache_pedagogy/json_dumps/npcs.json');
const ENUMS_PATH = resolve(SOVEREIGN_BASE, 'cache_pedagogy/json_dumps/enums.json');
const KINEMATICS_PATH = resolve(SOVEREIGN_BASE, 'memory/pedagogy/kinematics.json');
const VARBITS_PATH = resolve(SOVEREIGN_BASE, 'memory/pedagogy/varbits.json');

function ensureDir(dir: string) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

function safeLoad(path: string, label: string): any[] {
    console.log(`  Loading ${label}...`);
    if (!existsSync(path)) { console.log(`  [SKIP] Not found`); return []; }
    try {
        const data = JSON.parse(readFileSync(path, 'utf-8'));
        if (Array.isArray(data)) return data;
        if (data.files) return data.files;
        return [data];
    } catch (e: any) {
        console.error(`  [ERR] ${e.message?.slice(0, 80)}`);
        return [];
    }
}

async function main() {
    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║   PHASE 2.2: CS2 ROUTE TABLE & PARAMS DEEP SCAN      ║');
    console.log('║   Finding the path gap in structs/enums/params        ║');
    console.log('╚══════════════════════════════════════════════════════════╝\n');

    ensureDir(OUTPUT_DIR);

    const objects = safeLoad(OBJECTS_PATH, 'objects.json');
    const npcs = safeLoad(NPCS_PATH, 'npcs.json');
    const enums = safeLoad(ENUMS_PATH, 'enums.json');
    const kinematics = safeLoad(KINEMATICS_PATH, 'kinematics.json');

    console.log(`\n  Objects: ${objects.length}, NPCs: ${npcs.length}, Enums: ${enums.length}, Kinematics: ${kinematics.length}\n`);

    // ─── 1. DEEP DUMP: Keldagrim Trapdoor & surrounding IDs ───
    console.log('━━━ DEEP DUMP: Keldagrim Trapdoor (28094) & neighbors ━━━\n');
    for (let searchId = 28090; searchId <= 28100; searchId++) {
        const obj = objects.find((o: any) => o && (o.id === searchId || o.$fileid === searchId));
        if (obj && obj.name && obj.name !== `OBJECTS ${searchId}`) {
            console.log(`  [${searchId}] "${obj.name}"`);
            for (const [k, v] of Object.entries(obj)) {
                if (v !== null && v !== undefined && k !== '$schema' && k !== 'name' && k !== 'id') {
                    console.log(`    ${k}: ${JSON.stringify(v)}`);
                }
            }
            console.log('');
        }
    }

    // ─── 2. FIND ALL OBJECTS WITH NON-EMPTY OP ARRAYS ───
    console.log('━━━ Objects with actual interaction actions (op != empty) ━━━\n');
    const objectsWithOps: any[] = [];
    for (const obj of objects) {
        if (!obj) continue;
        const ops = (obj.op || []).filter(Boolean);
        if (ops.length > 0) {
            const name = (obj.name || '').toLowerCase();
            // Focus on transport-related
            if (name.includes('cart') || name.includes('track') || name.includes('mine') ||
                name.includes('trapdoor') || name.includes('keldagrim') || name.includes('tunnel') ||
                name.includes('station') || name.includes('transport')) {
                objectsWithOps.push({
                    id: obj.$fileid ?? obj.id,
                    name: obj.name,
                    op: ops,
                    params: obj.params || null,
                    morphs_1: obj.morphs_1 || null,
                    morphs_2: obj.morphs_2 || null,
                });
            }
        }
    }
    console.log(`  Found ${objectsWithOps.length} transport-related objects with actions:\n`);
    for (const o of objectsWithOps.slice(0, 50)) {
        console.log(`  [${o.id}] "${o.name}" → ${JSON.stringify(o.op)}`);
        if (o.params) console.log(`      params: ${JSON.stringify(o.params)}`);
        if (o.morphs_1) console.log(`      morphs: ${JSON.stringify(o.morphs_1)}`);
    }

    // ─── 3. SCAN ENUMS FOR ROUTE TABLES ───
    console.log('\n━━━ Enum scan: looking for route/destination tables ━━━\n');
    const routeEnums: any[] = [];
    for (const en of enums) {
        if (!en) continue;
        const raw = JSON.stringify(en).toLowerCase();
        if (raw.includes('cart') || raw.includes('keldagrim') || raw.includes('transport') ||
            raw.includes('route') || raw.includes('destination') || raw.includes('station')) {
            routeEnums.push({
                id: en.$fileid ?? en.id,
                inputType: en.inputtype,
                outputType: en.outputtype,
                values: en.intArrayValue1 || en.intArrayValue2 || en.stringArrayValue1,
                size: en.size,
            });
        }
    }
    console.log(`  Found ${routeEnums.length} route-related enums:\n`);
    for (const re of routeEnums.slice(0, 20)) {
        console.log(`  [${re.id}] input:${re.inputType} output:${re.outputType} size:${re.size}`);
        if (re.values) console.log(`    values: ${JSON.stringify(re.values).slice(0, 200)}`);
    }

    // ─── 4. NPCs WITH WALK RANGE / MOVEMENT DATA ───
    console.log('\n━━━ NPCs with walkRange or movement metadata ━━━\n');
    const movementNpcs: any[] = [];
    for (const npc of npcs) {
        if (!npc) continue;
        if (npc.walkRange || npc.movementType || npc.respawnDirection) {
            const name = (npc.name || '').toLowerCase();
            // Focus on patrol/guard/smuggler types
            if (name.includes('patrol') || name.includes('guard') || name.includes('smuggler') ||
                name.includes('cart') || name.includes('dwarf') || name.includes('keldagrim')) {
                movementNpcs.push({
                    id: npc.$fileid ?? npc.id,
                    name: npc.name,
                    walkRange: npc.walkRange,
                    movementType: npc.movementType,
                    respawnDirection: npc.respawnDirection,
                    boundSize: npc.boundSize,
                    params: npc.params || null,
                });
            }
        }
    }
    console.log(`  Found ${movementNpcs.length} movement-capable NPCs:\n`);
    for (const m of movementNpcs.slice(0, 30)) {
        console.log(`  [${m.id}] "${m.name}" walkRange:${m.walkRange} movement:${m.movementType} respawn:${m.respawnDirection}`);
        if (m.params) console.log(`    params: ${JSON.stringify(m.params)}`);
    }

    // ─── 5. KINEMATICS DEEP SCAN ───
    console.log('\n━━━ Kinematics data ━━━\n');
    if (kinematics.length > 0) {
        for (const k of kinematics.slice(0, 10)) {
            console.log(`  ${JSON.stringify(k)}`);
        }
    } else {
        console.log('  No kinematics data loaded');
    }

    // ─── COMPILE ───
    const report = {
        phase: '2.2',
        timestamp: new Date().toISOString(),
        objects_with_transport_actions: objectsWithOps,
        route_enums: routeEnums,
        movement_npcs: movementNpcs,
        kinematics_sample: kinematics.slice(0, 20),
    };

    const outPath = resolve(OUTPUT_DIR, 'ge_keldagrim_cs2_route_scan.json');
    writeFileSync(outPath, JSON.stringify(report, null, 2));
    console.log(`\n[OK] CS2 route scan report: ${outPath}`);

    console.log('\n╔══════════════════════════════════════════════════════════╗');
    console.log(`║  Transport Objects w/ Actions: ${String(objectsWithOps.length).padStart(6)}                 ║`);
    console.log(`║  Route Enums Found:            ${String(routeEnums.length).padStart(6)}                 ║`);
    console.log(`║  Movement-Capable NPCs:        ${String(movementNpcs.length).padStart(6)}                 ║`);
    console.log('╚══════════════════════════════════════════════════════════╝');
}

main().catch(e => { console.error('[FATAL]', e); process.exit(1); });
