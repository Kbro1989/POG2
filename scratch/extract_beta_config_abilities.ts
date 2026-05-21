/**
 * extract_beta_config_abilities.ts
 *
 * The BETA cache stores config data differently — enums, structs, params
 * are in sub-archives within major 2 (config). From the scan:
 *   2:11 = 9404 files (enums)
 *   2:32 = 4907 files (structs/animgroups)
 *   2:36 = 5706 files (dbrows)
 *
 * This script scans 2:11 for enum data containing ability names,
 * then dumps the complete results.
 */

import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';
const RSMV_PATH = 'D:/sovereign/cache_pedagogy/rsmv_inspector';

let GameCacheLoader: any;
let parse: any;

try {
    ({ GameCacheLoader } = require(path.join(RSMV_PATH, 'src', 'cache', 'sqlite.ts')));
    ({ parse } = require(path.join(RSMV_PATH, 'src', 'opdecoder.ts')));
} catch (e) {
    console.error('Failed to load RSMV modules:', (e as Error).message);
    process.exit(1);
}

// All known ability names post-March 2026 modernisation
const ABILITY_NAMES = [
    // Melee
    'Havoc', 'Dismember', 'Fury', 'Punish', 'Backhand', 'Flurry', 'Hurricane',
    'Slaughter', 'Assault', 'Overpower', 'Meteor Strike', 'Berserk', 'Pulverise',
    'Chaos Roar', 'Barge',
    // Ranged  
    'Piercing Shot', 'Snipe', 'Ricochet', 'Binding Shot', 'Corruption Shot',
    'Galeshot', 'Snap Shot', 'Rapid Fire', 'Shadow Tendrils', 'Bombardment',
    "Death's Swiftness", 'Deadshot', 'Imbue Shadows',
    // Magic
    'Dragon Breath', 'Sonic Wave', 'Concentrated Blast', 'Impact', 'Combust',
    'Chain', 'Asphyxiate', 'Wild Magic', 'Smoke Tendrils', 'Magma Tempest',
    'Corruption Blast', 'Sunshine', 'Omnipower', 'Runic Charge',
    // Necromancy
    'Touch of Death', 'Soul Sap', 'Soul Strike', 'Necrotic Burst',
    'Command Undead', 'Conjure Undead', 'Finger of Death', 'Volley of Souls',
    'Death Skulls', 'Living Death', 'Bloat', 'Spectral Scythe',
    // Defense
    'Resonance', 'Devotion', 'Debilitate', 'Reflect', 'Barricade',
    'Immortality', 'Rejuvenate',
    // Movement
    'Surge', 'Escape', 'Bladed Dive',
    // Removed (check if still in cache)
    'Slice', 'Sever', 'Smash', 'Quake', 'Cleave', 'Destroy',
    'Fragmentation Shot', 'Unload', 'Wrack', 'Detonate', 'Metamorphosis'
];

const abilitySet = new Set(ABILITY_NAMES.map(n => n.toLowerCase()));

async function main() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  EXACT BETA Config Enum/Struct Extraction");
    console.log("═══════════════════════════════════════════════════════════\n");

    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    // ── Scan Major 2, Minor 11 (enums in config) ──
    console.log("[PHASE 1] Enums from config archive 2:11...\n");

    const enumArchive = await cache.getArchiveById(2, 11);
    console.log(`  Archive 2:11: ${enumArchive.length} files`);

    const abilityEnums: any[] = [];
    let parsed = 0;
    let failed = 0;

    for (const sub of enumArchive) {
        if (!sub.buffer || sub.buffer.byteLength < 4) continue;
        try {
            const state = makeState(cache, sub.buffer);
            const result = parse.enums.parser.read(state);
            parsed++;

            if (!result.values) continue;

            // Check string values for ability names
            const entries = Object.entries(result.values);
            for (const [k, v] of entries) {
                if (typeof v === 'string' && abilitySet.has(v.toLowerCase())) {
                    abilityEnums.push({
                        enumId: sub.fileid,
                        key: k,
                        value: v,
                        keytype: result.keytype,
                        valtype: result.valtype,
                        totalEntries: entries.length
                    });
                }
            }
        } catch {
            failed++;
        }
    }

    console.log(`  Parsed: ${parsed}, Failed: ${failed}`);
    console.log(`  Ability name matches: ${abilityEnums.length}\n`);

    // Group by enum ID
    const byEnum = new Map<number, typeof abilityEnums>();
    for (const ae of abilityEnums) {
        const arr = byEnum.get(ae.enumId) || [];
        arr.push(ae);
        byEnum.set(ae.enumId, arr);
    }

    for (const [enumId, matches] of byEnum) {
        console.log(`  Enum ${enumId} (${matches[0].totalEntries} total entries, keytype=${matches[0].keytype}, valtype=${matches[0].valtype}):`);
        for (const m of matches) {
            console.log(`    [${m.key}] = "${m.value}"`);
        }
        console.log();
    }

    // ── Scan Major 2, Minor 5 (item configs) ──
    console.log("\n[PHASE 2] Config archive 2:5 (ability item configs?)...\n");

    try {
        const configArchive = await cache.getArchiveById(2, 5);
        console.log(`  Archive 2:5: ${configArchive.length} files`);

        let paramParsed = 0;
        const abilityParams: any[] = [];

        for (const sub of configArchive) {
            if (!sub.buffer || sub.buffer.byteLength < 4) continue;
            try {
                const state = makeState(cache, sub.buffer);
                // Try parsing as a generic opcode struct
                const result = parse.params?.parser?.read?.(state);
                if (result) {
                    paramParsed++;
                    // Check for ability-like params
                    if (result.name && abilitySet.has(result.name.toLowerCase())) {
                        abilityParams.push({ id: sub.fileid, ...result });
                    }
                }
            } catch { /* skip */ }
        }
        console.log(`  Parsed: ${paramParsed}`);
        console.log(`  Ability params found: ${abilityParams.length}`);
    } catch (e) {
        console.log(`  Failed: ${(e as Error).message}`);
    }

    // ── Full enum dump for ability-containing enums ──
    console.log("\n[PHASE 3] Full dump of ability-containing enums...\n");

    for (const [enumId] of byEnum) {
        const sub = enumArchive.find((s: any) => s.fileid === enumId);
        if (!sub) continue;

        const state = makeState(cache, sub.buffer);
        const result = parse.enums.parser.read(state);

        console.log(`--- Enum ${enumId} (keytype=${result.keytype}, valtype=${result.valtype}) ---`);
        const entries = Object.entries(result.values);
        for (const [k, v] of entries) {
            const marker = typeof v === 'string' && abilitySet.has(v.toLowerCase()) ? ' ◀' : '';
            console.log(`  [${k}] = ${JSON.stringify(v)}${marker}`);
        }
        console.log();
    }

    // Save complete results
    const outPath = 'D:/sovereign/cache_pedagogy/json_dumps/beta_config_abilities.json';
    const dump = {
        _meta: {
            source: 'RuneScape-BETA cache (config archive 2:11)',
            buildId: 1149,
            extracted: new Date().toISOString(),
            totalEnumFiles: enumArchive.length,
            parsedEnums: parsed,
            failedEnums: failed,
            abilityMatches: abilityEnums.length,
            uniqueEnumsWithAbilities: byEnum.size
        },
        abilityEnums: Object.fromEntries(byEnum)
    };

    fs.writeFileSync(outPath, JSON.stringify(dump, null, 2));
    console.log(`[SAVED] ${outPath}`);

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  Done");
    console.log("═══════════════════════════════════════════════════════════");
}

function makeState(cache: any, buf: Buffer) {
    return {
        isWrite: false,
        buffer: buf,
        stack: [],
        hiddenstack: [],
        scan: 0,
        endoffset: buf.byteLength,
        args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
    };
}

main().catch(console.error);
