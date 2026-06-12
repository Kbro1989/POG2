/**
 * resolve_script_28556.ts
 * 
 * Comprehensive resolution probe for Script 28556.
 * 
 * Strategy:
 *   1. Check if Script 28556 exists as a standalone clientscript in beta + live caches
 *   2. Search ALL clientscripts for int32 references to 28556 (callers)
 *   3. Search ALL interfaces for int32 references to 28556 (component script args)
 *   4. Cross-reference with 28557's known call pattern (10896 dispatcher)
 *   5. Check if 28556 is a varbit ID (not a script ID) — test against varbit registry
 *   6. Check if 28556 is a component ID in any interface
 * 
 * The hypothesis: 28556 is the avatar model update/refresh trigger, companion to 28557.
 * But it may also be a varbit, an enum, or a component reference.
 */

import { pathToFileURL } from 'url';
import { join, resolve } from 'path';
import { existsSync } from 'fs';
import * as fs from 'fs';

// Locate rsmv substrate dynamically (matching rsmv_bridge.ts pattern)
function findrsmvPath(): string {
    const candidates = [
        'D:\\rsmv_inspector',
        'D:\\rsmv_clone', 
        'D:\\rsmv-master\\rsmv-master',
        'D:\\D-sovereign-\\cache_pedagogy\\rsmv_inspector'
    ];
    for (const p of candidates) {
        if (existsSync(join(p, 'src', 'cache', 'sqlite.ts'))) return p;
    }
    throw new Error('No rsmv substrate found');
}

const RSMV_PATH = findrsmvPath();
const sqliteUrl = pathToFileURL(join(RSMV_PATH, 'src', 'cache', 'sqlite.ts')).href;
const constantsUrl = pathToFileURL(join(RSMV_PATH, 'src', 'constants.ts')).href;

const { GameCacheLoader } = await import(sqliteUrl);
const { cacheMajors } = await import(constantsUrl);

const BETA_PATH = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
const LIVE_PATH = "C:\\ProgramData\\Jagex\\RuneScape";

const TARGET = 28556;
const TARGET_BE = Buffer.alloc(4); TARGET_BE.writeUInt32BE(TARGET);
const TARGET_LE = Buffer.alloc(4); TARGET_LE.writeUInt32LE(TARGET);
// Also check as signed int16 (in case it's a short operand)
const TARGET_16BE = Buffer.alloc(2); TARGET_16BE.writeUInt16BE(TARGET & 0xFFFF);

interface FindResult {
    source: string;
    type: 'clientscript' | 'interface' | 'enum' | 'varbit' | 'dbrow';
    id: number;
    context: string;
}

async function main() {
    const results: FindResult[] = [];

    // ==============================
    // Phase 1: Does Script 28556 exist?
    // ==============================
    console.log('=== PHASE 1: Script Existence Check ===\n');
    
    for (const [label, cachePath] of [['BETA', BETA_PATH], ['LIVE', LIVE_PATH]] as const) {
        if (!fs.existsSync(cachePath)) {
            console.log(`  ${label}: Cache not found at ${cachePath}`);
            continue;
        }
        const loader = new GameCacheLoader(cachePath);
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, TARGET);
            console.log(`  ${label}: Script ${TARGET} EXISTS — ${buf.length} bytes`);
            results.push({ source: label, type: 'clientscript', id: TARGET, context: `Standalone script, ${buf.length} bytes` });
            
            // Dump first 64 bytes as hex for opcode analysis
            const hexDump = buf.subarray(0, Math.min(64, buf.length)).toString('hex').match(/.{1,2}/g)?.join(' ');
            console.log(`    First 64 bytes: ${hexDump}`);
        } catch {
            console.log(`  ${label}: Script ${TARGET} DOES NOT EXIST`);
        }
    }

    // ==============================
    // Phase 2: Which scripts reference 28556?
    // ==============================
    console.log('\n=== PHASE 2: Clientscript Cross-References (callers of 28556) ===\n');
    
    const betaLoader = new GameCacheLoader(BETA_PATH);
    try {
        const scriptIndex = await betaLoader.getCacheIndex(cacheMajors.clientscript);
        let scanned = 0;
        for (const entry of scriptIndex) {
            if (!entry) continue;
            try {
                const buf = await betaLoader.getFileById(cacheMajors.clientscript, entry.minor);
                if (buf.indexOf(TARGET_BE) !== -1 || buf.indexOf(TARGET_LE) !== -1) {
                    console.log(`  Script ${entry.minor} references ${TARGET} (${buf.length} bytes)`);
                    results.push({ source: 'BETA', type: 'clientscript', id: entry.minor, context: `References int32 ${TARGET}` });
                }
                scanned++;
            } catch { }
        }
        console.log(`  Scanned ${scanned} scripts.`);
    } catch (e) {
        console.log(`  Script scan failed: ${e}`);
    }

    // ==============================
    // Phase 3: Which interfaces reference 28556?
    // ==============================
    console.log('\n=== PHASE 3: Interface Cross-References ===\n');
    
    try {
        const ifaceIndex = await betaLoader.getCacheIndex(cacheMajors.interfaces);
        let scanned = 0;
        for (const entry of ifaceIndex) {
            if (!entry) continue;
            try {
                const buf = await betaLoader.getFileById(cacheMajors.interfaces, entry.minor);
                if (buf.indexOf(TARGET_BE) !== -1 || buf.indexOf(TARGET_LE) !== -1) {
                    console.log(`  Interface ${entry.minor} contains int32 ${TARGET}`);
                    results.push({ source: 'BETA', type: 'interface', id: entry.minor, context: `Contains int32 ${TARGET}` });
                }
                scanned++;
            } catch { }
        }
        console.log(`  Scanned ${scanned} interfaces.`);
    } catch (e) {
        console.log(`  Interface scan failed: ${e}`);
    }

    // ==============================
    // Phase 4: Is 28556 a varbit ID?
    // ==============================
    console.log('\n=== PHASE 4: Varbit Registry Check ===\n');
    
    const varbitRegPath = 'D:/sovereign/cache_pedagogy/json_dumps/varbits_registry_new.json';
    if (fs.existsSync(varbitRegPath)) {
        const registry = JSON.parse(fs.readFileSync(varbitRegPath, 'utf8'));
        if (registry[String(TARGET)]) {
            const meta = registry[String(TARGET)];
            console.log(`  ${TARGET} IS a registered varbit!`);
            console.log(`    varid: ${meta.varid}, bits: [${meta.bits}]`);
            console.log(`    width: ${meta.bits[1] - meta.bits[0] + 1} bits, max: ${Math.pow(2, meta.bits[1] - meta.bits[0] + 1) - 1}`);
            results.push({ source: 'VARBIT_REGISTRY', type: 'varbit', id: TARGET, context: `varid=${meta.varid} bits=[${meta.bits}]` });
        } else {
            console.log(`  ${TARGET} is NOT a registered varbit.`);
        }
    } else {
        console.log(`  Varbit registry not found at ${varbitRegPath}`);
    }

    // ==============================
    // Phase 5: Check enum archives for 28556
    // ==============================
    console.log('\n=== PHASE 5: Enum Archive Check ===\n');
    
    try {
        const enumIndex = await betaLoader.getCacheIndex(cacheMajors.enums);
        let scanned = 0;
        for (const entry of enumIndex) {
            if (!entry) continue;
            try {
                const buf = await betaLoader.getFileById(cacheMajors.enums, entry.minor);
                if (buf.indexOf(TARGET_BE) !== -1) {
                    console.log(`  Enum ${entry.minor} contains int32 ${TARGET}`);
                    results.push({ source: 'BETA', type: 'enum', id: entry.minor, context: `Contains int32 ${TARGET}` });
                }
                scanned++;
            } catch { }
        }
        console.log(`  Scanned ${scanned} enums.`);
    } catch (e) {
        console.log(`  Enum scan failed: ${e}`);
    }

    // ==============================
    // Phase 6: Cross-reference with 28557 context
    // ==============================
    console.log('\n=== PHASE 6: 28557 Sibling Analysis ===\n');
    console.log('  Known 28557 usage in Interface 1420:');
    console.log('    Comp 57  (gameMode selector)  — load: [10896, SELF, 93061178, 28557]');
    console.log('    Comp 122 (skin color select)   — load: [10896, SELF, -1, 28557]');
    console.log('    Comp 128 (randomise container)  — load: [10896, SELF, -1, 28557]');
    console.log('    Comp 132 (randomise btn inner)  — load: [10896, SELF, -1, 28557]');
    console.log('    Comp 179 (graphics settings)    — load: [6233, SELF, -1, 28557, "Graphics Settings"]');
    console.log('');
    console.log('  28557 is varbit: varid=5745, bits=[9,11] (3-bit, 0-7) → "gameMode"');
    console.log('');
    console.log('  Hypothesis for 28556:');
    console.log('    If 28556 is varbit+1 offset from 28557 in the same varp (5745),');
    console.log('    it would control bits [12,14] or similar — a companion morph flag.');
    console.log('    OR it is a completely different type of reference (script call target, enum key).');

    // ==============================
    // Summary
    // ==============================
    console.log('\n\n=== RESOLUTION SUMMARY ===\n');
    if (results.length === 0) {
        console.log('  28556 has NO PRESENCE in the current cache version.');
        console.log('  This confirms it either:');
        console.log('    a) Has not been added yet (pre-staging)');
        console.log('    b) Was removed or is a dead reference');
        console.log('    c) Exists only as a server-side trigger (not in client cache)');
    } else {
        console.log(`  Found ${results.length} references:`);
        for (const r of results) {
            console.log(`    [${r.source}] ${r.type} ${r.id}: ${r.context}`);
        }
    }

    // Write results
    const outPath = 'D:/POG2/scratch/script_28556_resolution.json';
    fs.writeFileSync(outPath, JSON.stringify({ target: TARGET, timestamp: new Date().toISOString(), results }, null, 2));
    console.log(`\nFull results written to: ${outPath}`);
}

main().catch(console.error);
