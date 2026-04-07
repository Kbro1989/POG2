/**
 * PATHING ARCHAEOLOGIST v2.1 â€” ACTIONABLE MINE CART DEEP DIVE
 * 
 * Reads the Phase 1 report and the raw objects.json to isolate
 * mine carts that have interactive "op" actions (Board, Ride, Travel, etc.)
 * These are the objects that trigger coordinate teleportation â€” the PATH GAP.
 * 
 * We also extract params which may contain destination coordinates.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';

const SOVEREIGN_BASE = 'D:/sovereign';
const OUTPUT_DIR = 'D:/sovereign/atlas/spatial/pathing_theory';
const OBJECTS_PATH = resolve(SOVEREIGN_BASE, 'cache_pedagogy/json_dumps/objects.json');

// Action words that indicate a transport trigger
const TRANSPORT_ACTIONS = [
    'board', 'ride', 'travel', 'enter', 'climb', 'use',
    'push', 'operate', 'start', 'go', 'journey', 'teleport',
];

function ensureDir(dir: string) {
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function main() {
    console.log('â•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
    console.log('â•‘   PHASE 2.1: ACTIONABLE MINE CART DEEP DIVE           â•‘');
    console.log('â•‘   Isolating transport triggers with path gap metadata  â•‘');
    console.log('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•\n');

    ensureDir(OUTPUT_DIR);

    console.log('Loading objects.json...');
    const raw = readFileSync(OBJECTS_PATH, 'utf-8');
    const allObjects: any[] = JSON.parse(raw);
    if (!Array.isArray(allObjects)) {
        // Handle batched format
        const parsed = allObjects as any;
        if (parsed.files) {
            console.log('  Detected batched format');
        }
    }
    console.log(`  Loaded ${allObjects.length} objects\n`);

    // â”€â”€â”€ FIND ALL MINE CARTS WITH ACTIONS â”€â”€â”€
    console.log('â”â”â” Scanning for actionable mine carts â”â”â”\n');

    const cartKeywords = ['cart', 'mine cart', 'minecart', 'track'];
    const actionableCarts: any[] = [];
    const allTransportObjects: any[] = [];

    for (const obj of allObjects) {
        if (!obj) continue;
        const name = (obj.name || '').toLowerCase();
        const isCart = cartKeywords.some(kw => name.includes(kw));
        
        // Check if this object has interactive options (op array)
        const ops: string[] = obj.op || [];
        const hasTransportAction = ops.some((action: string) => {
            if (!action) return false;
            const lower = action.toLowerCase();
            return TRANSPORT_ACTIONS.some(ta => lower.includes(ta));
        });

        if (isCart && (ops.length > 0 || obj.params)) {
            const entry = {
                id: obj.$fileid ?? obj.id ?? 'unknown',
                name: obj.name ?? '',
                op: ops.filter(Boolean),
                params: obj.params || null,
                models: obj.models || null,
                sizeX: obj.sizeX,
                sizeZ: obj.sizeZ,
                mapAreaId: obj.mapAreaId,
                morphs_1: obj.morphs_1 || null,
                morphs_2: obj.morphs_2 || null,
                hasTransportAction,
            };

            if (hasTransportAction) {
                actionableCarts.push(entry);
            }
            allTransportObjects.push(entry);
        }
    }

    // â”€â”€â”€ PRINT ACTIONABLE CARTS â”€â”€â”€
    console.log(`Found ${actionableCarts.length} ACTIONABLE mine carts (with Board/Ride/Travel/etc):\n`);
    
    for (const cart of actionableCarts) {
        console.log(`  â•â•â• [${cart.id}] "${cart.name}" â•â•â•`);
        console.log(`    Actions:  ${JSON.stringify(cart.op)}`);
        if (cart.params) {
            console.log(`    Params:   ${JSON.stringify(cart.params)}`);
        }
        if (cart.morphs_1) {
            console.log(`    Morphs1:  ${JSON.stringify(cart.morphs_1)}`);
        }
        if (cart.morphs_2) {
            console.log(`    Morphs2:  ${JSON.stringify(cart.morphs_2)}`);
        }
        if (cart.models) {
            console.log(`    Models:   ${JSON.stringify(cart.models)}`);
        }
        if (cart.mapAreaId !== undefined) {
            console.log(`    MapArea:  ${cart.mapAreaId}`);
        }
        console.log('');
    }

    // â”€â”€â”€ ALSO FIND NON-CART TRANSPORT OBJECTS (trapdoors, tunnels) â”€â”€â”€
    console.log('\nâ”â”â” Scanning for trapdoor/tunnel transport triggers â”â”â”\n');
    const tunnelKeywords = ['trapdoor', 'tunnel', 'passage', 'ladder', 'stairs'];
    const keldagrimConnectors: any[] = [];

    for (const obj of allObjects) {
        if (!obj) continue;
        const name = (obj.name || '').toLowerCase();
        const rawStr = JSON.stringify(obj).toLowerCase();
        const isTunnelType = tunnelKeywords.some(kw => name.includes(kw));
        
        // Only grab ones that mention keldagrim or dwarven in their full data
        if (isTunnelType && (rawStr.includes('keldagrim') || rawStr.includes('dwarven') || rawStr.includes('dwarf'))) {
            const ops: string[] = obj.op || [];
            keldagrimConnectors.push({
                id: obj.$fileid ?? obj.id ?? 'unknown',
                name: obj.name ?? '',
                op: ops.filter(Boolean),
                params: obj.params || null,
            });
        }
    }

    console.log(`Found ${keldagrimConnectors.length} Keldagrim-connected tunnel/trapdoor objects:\n`);
    for (const conn of keldagrimConnectors) {
        console.log(`  [${conn.id}] "${conn.name}" â€” Actions: ${JSON.stringify(conn.op)}`);
        if (conn.params) console.log(`    Params: ${JSON.stringify(conn.params)}`);
    }

    // â”€â”€â”€ FIND SPECIFIC GE MINECART (IDs from Phase 1) â”€â”€â”€
    console.log('\nâ”â”â” Deep extraction: Known GE/Keldagrim mine cart IDs â”â”â”\n');
    // Key IDs from our Phase 1 scan that are likely the GE->Keldagrim route
    const targetIds = [2299, 5731, 14997, 22376, 22425, 22429, 24824, 29740, 37618, 72781, 72782, 102272, 102304, 102305, 102315];
    
    for (const tid of targetIds) {
        const obj = allObjects.find((o: any) => o && (o.$fileid === tid || o.id === tid));
        if (obj) {
            console.log(`  â•â•â• [${tid}] "${obj.name}" â•â•â•`);
            console.log(`    FULL DUMP:`);
            // Print all non-null keys
            for (const [key, val] of Object.entries(obj)) {
                if (val !== null && val !== undefined && key !== '$schema') {
                    console.log(`      ${key}: ${JSON.stringify(val)}`);
                }
            }
            console.log('');
        }
    }

    // â”€â”€â”€ COMPILE DEEP REPORT â”€â”€â”€
    const deepReport = {
        phase: '2.1 â€” Actionable Mine Cart Deep Dive',
        timestamp: new Date().toISOString(),
        actionable_carts: actionableCarts,
        total_cart_objects_with_ops: allTransportObjects.length,
        keldagrim_connectors: keldagrimConnectors,
        target_id_full_dumps: targetIds.map(tid => {
            return allObjects.find((o: any) => o && (o.$fileid === tid || o.id === tid)) || { id: tid, status: 'NOT_FOUND' };
        }),
    };

    const deepPath = resolve(OUTPUT_DIR, 'ge_keldagrim_actionable_carts.json');
    writeFileSync(deepPath, JSON.stringify(deepReport, null, 2));
    console.log(`\n[OK] Deep dive report: ${deepPath}`);

    console.log('\nâ•”â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•—');
    console.log(`â•‘  Actionable Mine Carts:   ${String(actionableCarts.length).padStart(8)}                   â•‘`);
    console.log(`â•‘  All Cart Objs w/ Ops:    ${String(allTransportObjects.length).padStart(8)}                   â•‘`);
    console.log(`â•‘  Keldagrim Connectors:    ${String(keldagrimConnectors.length).padStart(8)}                   â•‘`);
    console.log('â•šâ•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•');
}

main().catch(e => {
    console.error('[FATAL]', e);
    process.exit(1);
});
