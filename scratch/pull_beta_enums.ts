/**
 * pull_beta_enums.ts
 * 
 * Extract enums from BETA cache Major 2, Minor 11 (9404 files).
 * Find ability-related enums by scanning for string-valued entries
 * containing known ability names.
 */

import * as path from 'path';
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

async function main() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  BETA Enum Extraction (Major 2, Minor 11)");
    console.log("═══════════════════════════════════════════════════════════\n");

    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    const archive = await cache.getArchiveById(2, 11);
    console.log(`Archive 2:11 has ${archive.length} files\n`);

    const abilityKeywords = /slice|assault|surge|berserk|sunshine|death.?s swiftness|soul sap|touch of death|dragon breath|snipe|rapid fire|hurricane|quake|finger of death|omnipower/i;
    
    const abilityEnums: { fileId: number; entryCount: number; sample: string[] }[] = [];
    let totalParsed = 0;
    let totalFailed = 0;

    for (const sub of archive) {
        if (!sub.buffer || sub.buffer.byteLength < 4) continue;

        try {
            const state = {
                isWrite: false,
                buffer: sub.buffer,
                stack: [],
                hiddenstack: [],
                scan: 0,
                endoffset: sub.buffer.byteLength,
                args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
            };
            const parsed = parse.enums.parser.read(state);
            totalParsed++;

            if (parsed.values) {
                const vals = Object.values(parsed.values);
                const stringVals = vals.filter((v: any) => typeof v === 'string') as string[];
                
                // Check if any values match ability keywords
                const hasAbility = stringVals.some(v => abilityKeywords.test(v));
                
                if (hasAbility) {
                    abilityEnums.push({
                        fileId: sub.fileid,
                        entryCount: vals.length,
                        sample: stringVals.slice(0, 10)
                    });
                }
            }
        } catch {
            totalFailed++;
        }
    }

    console.log(`Parsed: ${totalParsed}, Failed: ${totalFailed}\n`);
    console.log(`Found ${abilityEnums.length} ability-related enums:\n`);

    for (const e of abilityEnums) {
        console.log(`  Enum ${e.fileId} (${e.entryCount} entries):`);
        for (const s of e.sample) {
            console.log(`    "${s}"`);
        }
        console.log();
    }

    // Now deep-dump the ability enums
    if (abilityEnums.length > 0) {
        console.log("═══════════════════════════════════════════════════════════");
        console.log("  Full Ability Enum Dumps");
        console.log("═══════════════════════════════════════════════════════════\n");

        for (const ae of abilityEnums.slice(0, 5)) {
            const sub = archive.find((s: any) => s.fileid === ae.fileId);
            if (!sub) continue;

            const state = {
                isWrite: false,
                buffer: sub.buffer,
                stack: [],
                hiddenstack: [],
                scan: 0,
                endoffset: sub.buffer.byteLength,
                args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
            };
            const parsed = parse.enums.parser.read(state);
            
            console.log(`--- Enum ${ae.fileId} (keytype=${parsed.keytype}, valtype=${parsed.valtype}) ---`);
            if (parsed.values) {
                const entries = Object.entries(parsed.values);
                for (const [k, v] of entries) {
                    console.log(`  [${k}] = ${JSON.stringify(v)}`);
                }
            }
            console.log();
        }
    }

    // Also scan Minor 32 (4907 files) and Minor 36 (5706 files) for struct data
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  Scanning Minor 32 (structs?) for ability params");
    console.log("═══════════════════════════════════════════════════════════\n");

    try {
        const structArchive = await cache.getArchiveById(2, 32);
        console.log(`Archive 2:32 has ${structArchive.length} files`);
        
        let structsParsed = 0;
        const abilityStructs: { fileId: number; params: Record<string, any> }[] = [];

        for (const sub of structArchive) {
            if (!sub.buffer || sub.buffer.byteLength < 4) continue;
            if (parse?.structs?.parser) {
                try {
                    const state = {
                        isWrite: false,
                        buffer: sub.buffer,
                        stack: [],
                        hiddenstack: [],
                        scan: 0,
                        endoffset: sub.buffer.byteLength,
                        args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
                    };
                    const parsed = parse.structs.parser.read(state);
                    structsParsed++;
                    
                    if (parsed.params) {
                        const paramVals = Object.values(parsed.params);
                        const hasAbilityRef = paramVals.some((v: any) => 
                            typeof v === 'string' && abilityKeywords.test(v)
                        );
                        if (hasAbilityRef) {
                            abilityStructs.push({ fileId: sub.fileid, params: parsed.params });
                        }
                    }
                } catch {}
            }
        }

        console.log(`Structs parsed: ${structsParsed}`);
        console.log(`Ability-related structs: ${abilityStructs.length}\n`);
        
        for (const s of abilityStructs.slice(0, 5)) {
            console.log(`  Struct ${s.fileId}:`);
            for (const [k, v] of Object.entries(s.params)) {
                console.log(`    [${k}] = ${JSON.stringify(v)}`);
            }
            console.log();
        }
    } catch (e) {
        console.log(`  Failed: ${(e as Error).message}`);
    }

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  Extraction Complete");
    console.log("═══════════════════════════════════════════════════════════");
}

main().catch(console.error);
