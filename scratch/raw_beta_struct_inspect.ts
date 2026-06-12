/**
 * raw_beta_struct_inspect.ts
 *
 * The rsmv struct parser returns only numeric params. Let's dump the raw
 * parsed struct data to understand the internal schema, then cross-reference
 * with the live cache json_dumps (which DO have resolved strings).
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

    // ── Phase 1: Dump first 20 structs raw ──
    console.log("═══ BETA Struct Raw Dump (first 20 with params) ═══\n");
    
    const structArchive = await cache.getArchiveById(2, 32);
    let shown = 0;

    for (const sub of structArchive) {
        if (!sub.buffer || sub.buffer.byteLength < 4) continue;
        try {
            const state = makeState(cache, sub.buffer);
            const result = parse.structs.parser.read(state);
            
            if (result.params && Object.keys(result.params).length > 0) {
                shown++;
                console.log(`Struct ${sub.fileid} (${sub.buffer.byteLength} bytes):`);
                console.log(JSON.stringify(result, null, 2));
                console.log();
                if (shown >= 20) break;
            }
        } catch {}
    }

    // ── Phase 2: Dump first 10 enums raw ──
    console.log("\n═══ BETA Enum Raw Dump (first 10 with values) ═══\n");

    const enumArchive = await cache.getArchiveById(2, 11);
    let eShown = 0;

    for (const sub of enumArchive) {
        if (!sub.buffer || sub.buffer.byteLength < 4) continue;
        try {
            const state = makeState(cache, sub.buffer);
            const result = parse.enums.parser.read(state);
            
            if (result.values && Object.keys(result.values).length > 0) {
                eShown++;
                const entryCount = Object.keys(result.values).length;
                console.log(`Enum ${sub.fileid} (${entryCount} entries, keytype=${result.keytype}, valtype=${result.valtype}):`);
                // Show first 10 entries
                const entries = Object.entries(result.values);
                for (const [k, v] of entries.slice(0, 10)) {
                    console.log(`  [${k}] = ${JSON.stringify(v)}`);
                }
                if (entries.length > 10) console.log(`  ... ${entries.length - 10} more`);
                console.log();
                if (eShown >= 10) break;
            }
        } catch {}
    }

    // ── Phase 3: Check the LIVE cache enums.json for ability-defining enums ──
    console.log("\n═══ Cross-referencing with LIVE cache enums.json ═══\n");

    const liveEnumsPath = 'D:/sovereign/cache_pedagogy/json_dumps/enums.json';
    const liveEnums = JSON.parse(fs.readFileSync(liveEnumsPath, 'utf-8'));
    
    // Find enums that map integers to ability-like names
    const abilityNames = new Set([
        'Havoc', 'Dismember', 'Fury', 'Punish', 'Backhand', 'Flurry', 'Hurricane',
        'Slaughter', 'Assault', 'Overpower', 'Meteor Strike', 'Berserk', 'Pulverise',
        'Piercing Shot', 'Snipe', 'Ricochet', 'Snap Shot', 'Rapid Fire',
        'Dragon Breath', 'Sonic Wave', 'Concentrated Blast', 'Impact', 'Combust',
        'Chain', 'Asphyxiate', 'Wild Magic', 'Sunshine', 'Omnipower',
        'Touch of Death', 'Soul Sap', 'Finger of Death', 'Death Skulls',
        'Resonance', 'Devotion', 'Debilitate', 'Reflect', 'Barricade',
        'Surge', 'Escape', 'Slice', 'Sever', 'Wrack', 'Detonate',
    ]);

    // Search live enums for ability names
    for (const [enumIdStr, enumData] of Object.entries(liveEnums)) {
        const data = enumData as any;
        if (!data?.values) continue;
        
        const vals = Object.values(data.values);
        const abilityMatches = vals.filter((v: any) => typeof v === 'string' && abilityNames.has(v));
        
        if ((abilityMatches as any[]).length >= 3) {
            console.log(`  LIVE Enum ${enumIdStr}: ${(abilityMatches as any[]).length} ability matches`);
            console.log(`    keytype=${data.keytype}, valtype=${data.valtype}`);
            console.log(`    Matches: ${(abilityMatches as any[]).slice(0, 10).join(', ')}`);
            
            // Show full entries
            const entries = Object.entries(data.values);
            for (const [k, v] of entries.slice(0, 20)) {
                const marker = typeof v === 'string' && abilityNames.has(v) ? ' ◀' : '';
                console.log(`    [${k}] = ${JSON.stringify(v)}${marker}`);
            }
            if (entries.length > 20) console.log(`    ... ${entries.length - 20} more`);
            console.log();
        }
    }
}

main().catch(console.error);
