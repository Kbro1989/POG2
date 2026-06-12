/**
 * extract_beta_dbrows.ts
 *
 * RS3 abilities are heavily integrated into the DBTable system.
 * DBTables are config archive 2:40.
 * DBRows are config archive 2:41.
 * Let's scan all DBRows in the BETA cache for ability data!
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
    console.log("  BETA DBRows Extraction (Archive 2:41)");
    console.log("═══════════════════════════════════════════════════════════\n");

    try {
        const dbRowsArchive = await cache.getArchiveById(2, 41);
        console.log(`  Archive 2:41 (DBRows): ${dbRowsArchive.length} files\n`);

        let parsed = 0;
        let failed = 0;
        const allStrings: { fileid: number; str: string }[] = [];
        const abilityRows: any[] = [];

        for (const sub of dbRowsArchive) {
            if (!sub.buffer || sub.buffer.byteLength < 4) continue;
            try {
                const state = makeState(cache, sub.buffer);
                const result = parse.dbrows.parser.read(state);
                parsed++;

                let hasAbilityName = false;
                
                // Inspect all column data looking for strings
                if (result.column_data) {
                    for (const col of result.column_data) {
                        for (const val of col.values) {
                            if (typeof val === 'string' && val.length > 0) {
                                allStrings.push({ fileid: sub.fileid, str: val });
                                if (/^(Slice|Assault|Surge|Berserk|Sunshine|Dragon Breath|Wild Magic|Omnipower|Havoc|Dismember|Sonic Wave|Concentrated Blast)$/i.test(val)) {
                                    hasAbilityName = true;
                                }
                            }
                        }
                    }
                }

                if (hasAbilityName) {
                    result._fileid = sub.fileid;
                    abilityRows.push(result);
                }
            } catch { failed++; }
        }

        console.log(`  Parsed: ${parsed}, Failed: ${failed}`);
        console.log(`  Total string values found: ${allStrings.length}`);
        console.log(`  Ability matches: ${abilityRows.length}\n`);

        if (abilityRows.length > 0) {
            console.log("  Sample Ability DBRows:");
            for (const r of abilityRows.slice(0, 10)) {
                console.log(`    Row ${r._fileid}:`);
                console.log(JSON.stringify(r, null, 2));
            }
        }

        // Search for specific ability names
        const abilityNames = new Set([
            'Havoc', 'Dismember', 'Fury', 'Punish', 'Backhand', 'Flurry', 'Hurricane',
            'Slaughter', 'Assault', 'Overpower', 'Meteor Strike', 'Berserk', 'Pulverise',
            'Dragon Breath', 'Sonic Wave', 'Concentrated Blast', 'Impact', 'Combust',
            'Chain', 'Asphyxiate', 'Wild Magic', 'Sunshine', 'Omnipower',
            'Piercing Shot', 'Snipe', 'Ricochet', 'Snap Shot', 'Rapid Fire', 'Bombardment',
            'Touch of Death', 'Soul Sap', 'Finger of Death', 'Death Skulls',
            'Resonance', 'Devotion', 'Debilitate', 'Reflect', 'Barricade'
        ]);

        const exactMatches = allStrings.filter(s => abilityNames.has(s.str));
        if (exactMatches.length > 0) {
            console.log("\n  Exact ability names found in DBRows:");
            for (const m of exactMatches.slice(0, 20)) {
                console.log(`    Row ${m.fileid} -> "${m.str}"`);
            }
        }

        // Save dump
        const outPath = 'D:/sovereign/cache_pedagogy/json_dumps/beta_dbrows_abilities.json';
        fs.writeFileSync(outPath, JSON.stringify({
            meta: { files: dbRowsArchive.length, parsed, failed, stringCount: allStrings.length },
            abilityRows
        }, null, 2));
        console.log(`\n[SAVED] ${outPath}`);

    } catch (e) {
        console.error("Failed to extract DBRows:", e);
    }
}

main().catch(console.error);
