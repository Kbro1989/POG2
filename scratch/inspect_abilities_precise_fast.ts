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
} catch (e: any) {
    console.error('Failed to load RSMV modules:', e.message);
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

function getEnumStrings(parsed: any): string[] {
    const strings: string[] = [];
    if (typeof parsed.stringValue === 'string') {
        strings.push(parsed.stringValue);
    }
    if (Array.isArray(parsed.stringArrayValue1)) {
        for (const entry of parsed.stringArrayValue1) {
            if (Array.isArray(entry) && entry.length >= 2 && typeof entry[1] === 'string') {
                strings.push(entry[1]);
            }
        }
    }
    if (parsed.stringArrayValue2 && Array.isArray(parsed.stringArrayValue2.values)) {
        for (const entry of parsed.stringArrayValue2.values) {
            if (Array.isArray(entry) && entry.length >= 2 && typeof entry[1] === 'string') {
                strings.push(entry[1]);
            }
        }
    }
    return strings;
}

async function scanCache(cachePath: string, name: string) {
    const results: any[] = [];
    if (!fs.existsSync(cachePath)) {
        console.log(`Cache path ${cachePath} does not exist.`);
        return results;
    }

    const cache = new GameCacheLoader(cachePath);
    let buildnr = 940;
    if (name.includes('BETA')) {
        buildnr = 1149;
    }
    cache.buildnr = buildnr;

    try {
        const index = await cache.getCacheIndex(cacheMajors.enums);

        for (const entry of index) {
            if (!entry) continue;
            try {
                const subfiles = await cache.getFileArchive(entry);
                for (const sub of subfiles) {
                    if (!sub.buffer || sub.buffer.byteLength < 4) continue;

                    const enumId = entry.minor * 256 + sub.fileid;

                    const state = {
                        isWrite: false,
                        buffer: sub.buffer,
                        stack: [],
                        hiddenstack: [],
                        scan: 0,
                        endoffset: sub.buffer.byteLength,
                        args: { ...cache.getDecodeArgs(), clientVersion: buildnr }
                    };

                    const parsed = parse.enums.parser.read(state);
                    const strings = getEnumStrings(parsed);
                    const matches = strings.filter(s => abilitySet.has(s.trim().toLowerCase()));

                    if (matches.length > 0) {
                        results.push({
                            enumId,
                            keyType: parsed.key_type1 || parsed.key_type2,
                            valType: parsed.value_type1 || parsed.value_type2,
                            stringValue: parsed.stringValue,
                            stringArrayValue1: parsed.stringArrayValue1,
                            stringArrayValue2: parsed.stringArrayValue2,
                            matches
                        });
                    }
                }
            } catch (e) {
                // skip failed archives
            }
        }
    } catch (e: any) {
        console.error(`Failed to scan Major 17:`, e.message);
    }

    cache.close();
    return results;
}

async function main() {
    console.log("Scanning Beta cache...");
    const betaResults = await scanCache(BETA_CACHE_PATH, 'BETA');
    console.log(`Beta matching enums found: ${betaResults.length}`);

    console.log("Scanning Live cache...");
    const liveResults = await scanCache(LIVE_CACHE_PATH, 'LIVE');
    console.log(`Live matching enums found: ${liveResults.length}`);

    const allResults = {
        beta: betaResults,
        live: liveResults
    };

    fs.writeFileSync('d:/POG2/scratch/matching_enums_results.json', JSON.stringify(allResults, null, 2));
    console.log("All results written to d:/POG2/scratch/matching_enums_results.json");
}

main().catch(console.error);
