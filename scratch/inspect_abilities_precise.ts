import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';
const LIVE_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape';
const RSMV_PATH = 'D:/sovereign/cache_pedagogy/rsmv_inspector';

let GameCacheLoader: any;
let parse: any;
const constants = require(path.join(RSMV_PATH, 'src', 'constants.ts'));
const { cacheMajors } = constants;

try {
    ({ GameCacheLoader } = require(path.join(RSMV_PATH, 'src', 'cache', 'sqlite.ts')));
    ({ parse } = require(path.join(RSMV_PATH, 'src', 'opdecoder.ts')));
} catch (e) {
    console.error('Failed to load RSMV modules:', (e as Error).message);
    process.exit(1);
}

const ABILITY_NAMES = [
    'Touch of Death', 'Finger of Death', 'Death Skulls', 'Soul Sap', 'Soul Strike',
    'Volley of Souls', 'Spectral Scythe', 'Slice', 'Cleave', 'Sever', 'Havoc', 'Smash',
    'Assault', 'Destroy', 'Hurricane', 'Quake', 'Slaughter', 'Overpower', 'Meteor Strike',
    'Berserk', 'Pulverise', 'Piercing Shot', 'Dazing Shot', 'Needle Strike', 'Snap Shot',
    'Rapid Fire', 'Shadow Tendrils', 'Bombardment', 'Tight Bindings', "Death's Swiftness",
    'Unload', 'Wrack', 'Dragon Breath', 'Sonic Wave', 'Impact', 'Wild Magic', 'Asphyxiate',
    'Deep Impact', 'Detonate', 'Sunshine', 'Omnipower', 'Resonance', 'Barricade',
    'Devotion', 'Debilitate', 'Reflect', 'Immortality', 'Natural Instinct', 'Surge',
    'Escape', 'Bladed Dive'
];

const abilitySet = new Set(ABILITY_NAMES.map(n => n.toLowerCase()));

async function scanCache(cachePath: string, name: string) {
    console.log(`\n================ SCANNING ${name} CACHE (${cachePath}) ================`);
    if (!fs.existsSync(cachePath)) {
        console.log(`Cache path ${cachePath} does not exist.`);
        return;
    }

    const cache = new GameCacheLoader(cachePath);
    // Determine build nr
    let buildnr = 940;
    if (name.includes('BETA')) {
        buildnr = 1149;
    } else {
        // Try to read build from index 255 or default
        buildnr = 940;
    }
    cache.buildnr = buildnr;
    console.log(`Set cache buildnr to ${buildnr}`);

    // Scan Enums (Major 17)
    console.log("Scanning Major 17 (Enums)...");
    let matchCount = 0;
    
    // Get index of major 17
    try {
        const index = await cache.getCacheIndex(cacheMajors.enums);
        console.log(`Major 17 index has ${index.length} entries.`);
        
        // Loop through all potential enum IDs
        // Enums are typically indexed up to 12000+
        for (let enumId = 0; enumId < 15000; enumId++) {
            try {
                const buffer = await cache.getFileById(cacheMajors.enums, enumId);
                if (!buffer || buffer.byteLength < 4) continue;
                
                const state = {
                    isWrite: false,
                    buffer,
                    stack: [],
                    hiddenstack: [],
                    scan: 0,
                    endoffset: buffer.byteLength,
                    args: { ...cache.getDecodeArgs(), clientVersion: buildnr }
                };
                
                const parsed = parse.enums.parser.read(state);
                if (parsed.values) {
                    const entries = Object.entries(parsed.values);
                    const matching = entries.filter(([, v]) => typeof v === 'string' && abilitySet.has((v as string).trim().toLowerCase()));
                    if (matching.length > 0) {
                        matchCount++;
                        console.log(`  [MATCH] Enum ${enumId} (keyType=${parsed.keytype}, valType=${parsed.valtype}, size=${entries.length}):`);
                        for (const [k, v] of entries) {
                            const isAbility = typeof v === 'string' && abilitySet.has((v as string).trim().toLowerCase());
                            console.log(`    [${k}] = ${JSON.stringify(v)}${isAbility ? ' ◀' : ''}`);
                        }
                    }
                }
            } catch (e) {
                // skip missing or unparseable enums
            }
        }
    } catch (e) {
        console.error(`Failed to scan Major 17:`, (e as Error).message);
    }
    
    console.log(`Total matching enums found: ${matchCount}`);
}

async function main() {
    await scanCache(BETA_CACHE_PATH, 'BETA');
    await scanCache(LIVE_CACHE_PATH, 'LIVE');
}

main().catch(console.error);
