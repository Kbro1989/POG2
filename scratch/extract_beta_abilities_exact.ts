/**
 * extract_beta_abilities_exact.ts
 *
 * Extract ability data from BETA cache using the correct rsmv major/minor mapping:
 *   - Enums: major 17 (cacheMajors.enums)  
 *   - Structs: major 22 (cacheMajors.structs)
 *   - Params: major 2, minor 11 (cacheConfigPages.params)
 *   - Items: major 19
 *
 * This uses openTable() for proper iteration.
 */

import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';
const RSMV_PATH = 'D:/sovereign/cache_pedagogy/rsmv_inspector';

let GameCacheLoader: any;
let parse: any;
const constants = require(path.join(RSMV_PATH, 'src', 'constants.ts'));
const { cacheMajors, cacheConfigPages } = constants;

try {
    ({ GameCacheLoader } = require(path.join(RSMV_PATH, 'src', 'cache', 'sqlite.ts')));
    ({ parse } = require(path.join(RSMV_PATH, 'src', 'opdecoder.ts')));
} catch (e) {
    console.error('Failed to load RSMV modules:', (e as Error).message);
    process.exit(1);
}

const ABILITY_KEYWORDS = /slice|assault|surge|berserk|sunshine|death.?s swiftness|soul sap|touch of death|dragon breath|snipe|rapid fire|hurricane|quake|finger of death|omnipower|wild magic|asphyxiate|combust|chain|fury|havoc|punish|backhand|dismember|slaughter|flurry|piercing shot|ricochet|binding shot|snap shot|corruption|bombardment|deadshot|galeshot|sonic wave|concentrated blast|impact|runic charge|smoke tendrils|magma tempest|meteor strike|overpower|pulverise|barricade|devotion|resonance|debilitate|reflect|immortality|rejuvenate|volley of souls|death skulls|necrotic burst|soul strike|conjure undead|command undead/i;

async function main() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  EXACT BETA Cache Ability Extraction");
    console.log(`  Cache: ${BETA_CACHE_PATH}`);
    console.log(`  Enums major: ${cacheMajors.enums}, Structs major: ${cacheMajors.structs}`);
    console.log("═══════════════════════════════════════════════════════════\n");

    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    // ── Phase 1: Extract enums from major 17 ──
    console.log("[PHASE 1] Scanning BETA enums (major 17)...\n");

    const enumTable = cache.openTable(cacheMajors.enums);
    const abilityEnums: { id: number; keytype: number; valtype: number; entries: Record<string, any> }[] = [];
    let enumCount = 0;

    for await (const { id, file } of iterateTable(cache, cacheMajors.enums)) {
        enumCount++;
        if (!file || file.byteLength < 4) continue;

        try {
            const state = makeState(cache, file);
            const parsed = parse.enums.parser.read(state);
            if (!parsed.values) continue;

            const vals = Object.values(parsed.values);
            const stringVals = vals.filter((v: any) => typeof v === 'string') as string[];
            const hasAbility = stringVals.some(v => ABILITY_KEYWORDS.test(v));

            if (hasAbility) {
                abilityEnums.push({
                    id,
                    keytype: parsed.keytype,
                    valtype: parsed.valtype,
                    entries: parsed.values
                });
            }
        } catch { /* skip unparseable */ }
    }

    console.log(`  Total enums scanned: ${enumCount}`);
    console.log(`  Ability-related enums found: ${abilityEnums.length}\n`);

    for (const e of abilityEnums) {
        const entries = Object.entries(e.entries);
        const stringEntries = entries.filter(([, v]) => typeof v === 'string');
        console.log(`  Enum ${e.id} (keytype=${e.keytype}, valtype=${e.valtype}, ${entries.length} entries):`);
        for (const [k, v] of stringEntries.slice(0, 15)) {
            console.log(`    [${k}] = "${v}"`);
        }
        if (stringEntries.length > 15) console.log(`    ... ${stringEntries.length - 15} more`);
        console.log();
    }

    // ── Phase 2: Extract structs from major 22 ──
    console.log("[PHASE 2] Scanning BETA structs (major 22) for ability params...\n");

    let structCount = 0;
    const abilityStructs: { id: number; params: Record<string, any> }[] = [];

    for await (const { id, file } of iterateTable(cache, cacheMajors.structs)) {
        structCount++;
        if (!file || file.byteLength < 4) continue;

        try {
            const state = makeState(cache, file);
            const parsed = parse.structs.parser.read(state);
            if (!parsed.params) continue;

            const paramVals = Object.values(parsed.params);
            const hasAbilityRef = paramVals.some((v: any) =>
                typeof v === 'string' && ABILITY_KEYWORDS.test(v)
            );
            if (hasAbilityRef) {
                abilityStructs.push({ id, params: parsed.params });
            }
        } catch { /* skip */ }
    }

    console.log(`  Total structs scanned: ${structCount}`);
    console.log(`  Ability-related structs found: ${abilityStructs.length}\n`);

    for (const s of abilityStructs.slice(0, 20)) {
        console.log(`  Struct ${s.id}:`);
        for (const [k, v] of Object.entries(s.params)) {
            console.log(`    param[${k}] = ${JSON.stringify(v)}`);
        }
        console.log();
    }

    // ── Phase 3: Dump ability-related enums to JSON ──
    const outPath = 'D:/sovereign/cache_pedagogy/json_dumps/beta_ability_enums.json';
    const dump = {
        _meta: {
            source: 'RuneScape-BETA cache',
            buildId: 1149,
            extracted: new Date().toISOString(),
            totalEnums: enumCount,
            abilityEnums: abilityEnums.length,
            totalStructs: structCount,
            abilityStructs: abilityStructs.length
        },
        enums: abilityEnums,
        structs: abilityStructs
    };

    fs.writeFileSync(outPath, JSON.stringify(dump, null, 2));
    console.log(`\n[SAVED] ${outPath}`);

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  Extraction Complete");
    console.log("═══════════════════════════════════════════════════════════");
}

// ── Helpers ──

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

async function* iterateTable(cache: any, major: number) {
    const index = await cache.getCacheIndex(major);
    for (let id = 0; id < index.length; id++) {
        if (!index[id]) continue;
        try {
            const file = await cache.getFileById(major, id);
            if (file) yield { id, file };
        } catch { /* skip */ }
    }
}

main().catch(console.error);
