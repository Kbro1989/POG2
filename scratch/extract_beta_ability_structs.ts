/**
 * extract_beta_ability_structs.ts
 *
 * RS3 abilities are defined through struct params. The struct contains:
 *   - param 667/668/669: ability name
 *   - param 662: cooldown
 *   - param 663: adrenaline cost
 *   etc.
 *
 * Scan ALL structs in config 2:32 (BETA has 4907) and dump every param value.
 * Also scan 2:33, 2:34, 2:35 for related config data.
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

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    console.log("═══════════════════════════════════════════════════════════");
    console.log("  BETA Struct Param Dump — ALL string values from 2:32");
    console.log("═══════════════════════════════════════════════════════════\n");

    // ── Dump ALL string values from structs ──
    const structArchive = await cache.getArchiveById(2, 32);
    console.log(`  Archive 2:32: ${structArchive.length} files\n`);

    const allStringParams: { structId: number; paramKey: string; value: string }[] = [];
    let parsed = 0;
    let failed = 0;

    for (const sub of structArchive) {
        if (!sub.buffer || sub.buffer.byteLength < 4) continue;
        try {
            const state = makeState(cache, sub.buffer);
            const result = parse.structs.parser.read(state);
            parsed++;

            if (result.params) {
                for (const [key, val] of Object.entries(result.params)) {
                    if (typeof val === 'string' && val.length > 0) {
                        allStringParams.push({ structId: sub.fileid, paramKey: key, value: val as string });
                    }
                }
            }
        } catch { failed++; }
    }

    console.log(`  Parsed: ${parsed}, Failed: ${failed}`);
    console.log(`  Total string params: ${allStringParams.length}\n`);

    // Show unique strings with high-value content
    const uniqueStrings = new Map<string, number[]>();
    for (const p of allStringParams) {
        const arr = uniqueStrings.get(p.value) || [];
        arr.push(p.structId);
        uniqueStrings.set(p.value, arr);
    }

    console.log(`  Unique string values: ${uniqueStrings.size}\n`);
    console.log("  First 100 unique strings:\n");
    let count = 0;
    for (const [str, ids] of uniqueStrings) {
        if (count++ >= 100) break;
        console.log(`    "${str}" → structs [${ids.slice(0, 3).join(', ')}${ids.length > 3 ? '...' : ''}]`);
    }

    // ── Now check ALL enums for int→string mappings that might be ability names ──
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  ALL Enum String Values from 2:11 (Sample)");
    console.log("═══════════════════════════════════════════════════════════\n");

    const enumArchive = await cache.getArchiveById(2, 11);
    const enumStrings = new Map<string, { enumId: number; key: string }[]>();
    let eParsed = 0;

    for (const sub of enumArchive) {
        if (!sub.buffer || sub.buffer.byteLength < 4) continue;
        try {
            const state = makeState(cache, sub.buffer);
            const result = parse.enums.parser.read(state);
            eParsed++;

            if (result.values) {
                for (const [k, v] of Object.entries(result.values)) {
                    if (typeof v === 'string' && v.length > 1) {
                        const arr = enumStrings.get(v as string) || [];
                        arr.push({ enumId: sub.fileid, key: k });
                        enumStrings.set(v as string, arr);
                    }
                }
            }
        } catch {}
    }

    console.log(`  Parsed enums: ${eParsed}`);
    console.log(`  Unique enum string values: ${enumStrings.size}\n`);

    // Search enum strings for ability-like names
    const abilityPattern = /^(Havoc|Dismember|Fury|Punish|Backhand|Flurry|Hurricane|Slaughter|Assault|Overpower|Meteor Strike|Berserk|Pulverise|Chaos Roar|Barge|Piercing Shot|Snipe|Ricochet|Binding Shot|Corruption Shot|Galeshot|Snap Shot|Rapid Fire|Shadow Tendrils|Bombardment|Death's Swiftness|Deadshot|Dragon Breath|Sonic Wave|Concentrated Blast|Impact|Combust|Chain|Asphyxiate|Wild Magic|Smoke Tendrils|Magma Tempest|Corruption Blast|Sunshine|Omnipower|Runic Charge|Touch of Death|Soul Sap|Soul Strike|Necrotic Burst|Command Undead|Conjure Undead|Finger of Death|Volley of Souls|Death Skulls|Living Death|Bloat|Spectral Scythe|Resonance|Devotion|Debilitate|Reflect|Barricade|Immortality|Rejuvenate|Surge|Escape|Bladed Dive|Slice|Sever|Smash|Quake|Cleave|Destroy|Wrack|Detonate|Metamorphosis)$/i;

    console.log("  Ability name matches in enums:");
    let abilityCount = 0;
    for (const [str, refs] of enumStrings) {
        if (abilityPattern.test(str.trim())) {
            abilityCount++;
            const refsStr = refs.map(r => `enum${r.enumId}[${r.key}]`).join(', ');
            console.log(`    "${str}" → ${refsStr}`);
        }
    }
    console.log(`\n  Total ability matches: ${abilityCount}`);

    // Save everything
    const outPath = 'D:/sovereign/cache_pedagogy/json_dumps/beta_struct_params.json';
    const dump = {
        _meta: { 
            source: 'RuneScape-BETA 2:32', 
            buildId: 1149,
            extracted: new Date().toISOString(),
            structsParsed: parsed,
            uniqueStrings: uniqueStrings.size,
            enumsParsed: eParsed,
            enumUniqueStrings: enumStrings.size
        },
        structStrings: allStringParams,
        enumAbilityMatches: abilityCount
    };
    fs.writeFileSync(outPath, JSON.stringify(dump, null, 2));
    console.log(`\n[SAVED] ${outPath}`);
}

main().catch(console.error);
