/**
 * validate_beta_abilities.ts
 * 
 * Pull ability/combat config data directly from the BETA cache (js5-2.jcache = configs)
 * and cross-reference against AbilityBook's hardcoded COMBAT_PARAMS.
 * 
 * Major 2 = Config archive (structs, enums, params, etc.)
 * The ability definitions live in config sub-archives.
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

// Known ability-related enum IDs from RS3 cache structure
const ABILITY_ENUM_IDS = [
    // These are common enum IDs that map ability names to config IDs
    711,   // Combat abilities master enum
    3786,  // Action bar ability mapping
    5765,  // Ability cooldown configs  
    10079, // Necromancy abilities
];

// Struct IDs for ability parameters
const ABILITY_STRUCT_PARAMS = [
    682,  // Combat ability struct (common)
    683,  // Ability damage param
    684,  // Ability cooldown param
    685,  // Ability adrenaline param
];

async function main() {
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  BETA Cache Ability Validation                           ");
    console.log(`  Cache: ${BETA_CACHE_PATH}`);
    console.log("═══════════════════════════════════════════════════════════\n");

    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149; // BETA build

    // ── Pull Enums ──
    console.log("[PHASE 1] Scanning BETA cache enums for ability data...\n");
    
    if (parse?.enums?.parser) {
        for (const enumId of ABILITY_ENUM_IDS) {
            try {
                const archive = await cache.getFileById(2, 12, enumId);
                if (!archive) {
                    console.log(`  Enum ${enumId}: NOT FOUND in BETA cache`);
                    continue;
                }
                
                const state = {
                    isWrite: false,
                    buffer: archive,
                    stack: [],
                    hiddenstack: [],
                    scan: 0,
                    endoffset: archive.byteLength,
                    args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
                };

                const parsed = parse.enums.parser.read(state);
                const entryCount = parsed.values ? Object.keys(parsed.values).length : 0;
                console.log(`  Enum ${enumId}: ${entryCount} entries (keyType: ${parsed.keytype}, valType: ${parsed.valtype})`);
                
                // Show first few entries
                if (parsed.values) {
                    const keys = Object.keys(parsed.values).slice(0, 5);
                    for (const k of keys) {
                        console.log(`    [${k}] = ${JSON.stringify(parsed.values[k])}`);
                    }
                    if (entryCount > 5) console.log(`    ... and ${entryCount - 5} more`);
                }
                console.log();
            } catch (e) {
                console.log(`  Enum ${enumId}: PARSE ERROR — ${(e as Error).message}`);
            }
        }
    } else {
        console.log("  ⚠ parse.enums not available, trying raw archive scan...");
    }

    // ── Pull Structs ──
    console.log("\n[PHASE 2] Scanning BETA cache structs for ability parameters...\n");
    
    if (parse?.structs?.parser) {
        for (const structId of ABILITY_STRUCT_PARAMS) {
            try {
                const archive = await cache.getFileById(2, 26, structId);
                if (!archive) {
                    console.log(`  Struct ${structId}: NOT FOUND`);
                    continue;
                }
                
                const state = {
                    isWrite: false,
                    buffer: archive,
                    stack: [],
                    hiddenstack: [],
                    scan: 0,
                    endoffset: archive.byteLength,
                    args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
                };

                const parsed = parse.structs.parser.read(state);
                const paramCount = parsed.params ? Object.keys(parsed.params).length : 0;
                console.log(`  Struct ${structId}: ${paramCount} params`);
                
                if (parsed.params) {
                    for (const [k, v] of Object.entries(parsed.params).slice(0, 8)) {
                        console.log(`    param[${k}] = ${JSON.stringify(v)}`);
                    }
                }
                console.log();
            } catch (e) {
                console.log(`  Struct ${structId}: PARSE ERROR — ${(e as Error).message}`);
            }
        }
    }

    // ── Pull Interface 1841 (Action Bar) from BETA ──
    console.log("\n[PHASE 3] Extracting Interface 1841 (Action Bar) from BETA cache...\n");
    
    try {
        const archive = await cache.getArchiveById(3, 1841);
        console.log(`  Interface 1841: ${archive.length} components`);
        
        let slotsWithScripts = 0;
        let slotsWithSprites = 0;
        
        for (const sub of archive) {
            const state: any = {
                isWrite: false,
                buffer: sub.buffer,
                stack: [],
                hiddenstack: [],
                scan: 0,
                endoffset: sub.buffer.byteLength,
                args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
            };

            try {
                const comp = parse.interfaces.parser.read(state);
                if (comp.scripts?.load && comp.scripts.load.length > 0) slotsWithScripts++;
                if (comp.spritedata?.spriteid || comp.spriteid) slotsWithSprites++;
                
                // Show action bar slots that have load scripts (these are ability bindings)
                if (comp.scripts?.load && comp.scripts.load.length > 0 && sub.fileid < 30) {
                    const scriptPreview = comp.scripts.load.slice(0, 5);
                    console.log(`  Slot ${sub.fileid}: script.load=[${scriptPreview.join(',')}${comp.scripts.load.length > 5 ? ',...' : ''}] sprite=${comp.spritedata?.spriteid || comp.spriteid || 'none'} opts=[${(comp.rightclickopts || []).filter((x: any) => x).join(',')}]`);
                }
            } catch {
                // Skip unparseable components
            }
        }
        
        console.log(`\n  Summary: ${slotsWithScripts} slots with scripts, ${slotsWithSprites} with sprites`);
    } catch (e) {
        console.log(`  Interface 1841: FAILED — ${(e as Error).message}`);
    }

    // ── Pull the json_dumps enums for ability name cross-ref ──
    console.log("\n[PHASE 4] Cross-referencing AbilityBook COMBAT_PARAMS against BETA enum 711...\n");
    
    try {
        const archive = await cache.getFileById(2, 12, 711);
        if (archive && parse?.enums?.parser) {
            const state = {
                isWrite: false,
                buffer: archive,
                stack: [],
                hiddenstack: [],
                scan: 0,
                endoffset: archive.byteLength,
                args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
            };
            const parsed = parse.enums.parser.read(state);
            
            if (parsed.values) {
                const betaAbilityNames = new Set(Object.values(parsed.values).map((v: any) => typeof v === 'string' ? v : ''));
                
                // Cross-reference against COMBAT_PARAMS
                const knownAbilities = [
                    'Sever', 'Havoc', 'Smash', 'Dismember', 'Fury', 'Punish', 'Backhand',
                    'Flurry', 'Hurricane', 'Quake', 'Slaughter', 'Assault',
                    'Overpower', 'Meteor Strike', 'Berserk', 'Pulverise',
                    'Piercing Shot', 'Snipe', 'Fragmentation Shot', 'Ricochet',
                    'Snap Shot', 'Rapid Fire', "Death's Swiftness",
                    'Dragon Breath', 'Sonic Wave', 'Impact', 'Combust', 'Chain',
                    'Asphyxiate', 'Wild Magic', 'Sunshine', 'Omnipower',
                    'Touch of Death', 'Soul Sap', 'Soul Strike', 'Finger of Death',
                    'Volley of Souls', 'Death Skulls',
                    'Resonance', 'Devotion', 'Barricade', 'Surge', 'Escape'
                ];

                let matched = 0;
                let missing = 0;
                const missingNames: string[] = [];

                for (const name of knownAbilities) {
                    if (betaAbilityNames.has(name)) {
                        matched++;
                    } else {
                        missing++;
                        missingNames.push(name);
                    }
                }

                console.log(`  BETA enum 711 has ${betaAbilityNames.size} entries`);
                console.log(`  AbilityBook matched: ${matched}/${knownAbilities.length}`);
                if (missingNames.length > 0) {
                    console.log(`  Missing from BETA: ${missingNames.join(', ')}`);
                }
                
                // Find NEW abilities in BETA that aren't in our book
                const bookNames = new Set(knownAbilities.map(n => n.toLowerCase()));
                const newInBeta: string[] = [];
                for (const name of betaAbilityNames) {
                    if (name && !bookNames.has((name as string).toLowerCase())) {
                        newInBeta.push(name as string);
                    }
                }
                if (newInBeta.length > 0) {
                    console.log(`\n  NEW abilities in BETA (not in AbilityBook):`);
                    for (const n of newInBeta.slice(0, 20)) {
                        console.log(`    + ${n}`);
                    }
                    if (newInBeta.length > 20) console.log(`    ... and ${newInBeta.length - 20} more`);
                }
            }
        } else {
            console.log("  Enum 711 not available in BETA cache");
        }
    } catch (e) {
        console.log(`  Cross-reference failed: ${(e as Error).message}`);
    }

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  BETA Cache Validation Complete");
    console.log("═══════════════════════════════════════════════════════════");
}

main().catch(console.error);
