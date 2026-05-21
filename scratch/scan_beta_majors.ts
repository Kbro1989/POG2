/**
 * scan_beta_majors.ts
 * 
 * Enumerate the actual archive structure of the BETA cache.
 * Find which major/minor pairs exist and contain config data.
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
    console.log("  BETA Cache Structure Scan");
    console.log("═══════════════════════════════════════════════════════════\n");

    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    // Check what the cache loader exposes
    console.log("[INFO] Cache loader methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(cache)).filter(m => !m.startsWith('_')).join(', '));
    console.log();

    // Scan major archives
    const majors = [2, 3, 5, 14, 17, 18, 19, 20, 22, 26, 40, 41, 49, 55, 57, 58, 59, 60, 61];
    
    for (const major of majors) {
        try {
            // Try to get the index for this major
            const indexArchive = await cache.getArchiveById(255, major);
            if (indexArchive) {
                console.log(`  Major ${major.toString().padStart(2)}: index has ${indexArchive.length} entries`);
            }
        } catch (e) {
            // Try getFileById for the index
            try {
                const meta = await cache.getFileById(255, major, 0);
                if (meta) {
                    console.log(`  Major ${major.toString().padStart(2)}: index file exists (${meta.byteLength} bytes)`);
                }
            } catch {
                console.log(`  Major ${major.toString().padStart(2)}: not accessible`);
            }
        }
    }

    // Deep scan Major 2 (configs)
    console.log("\n[DEEP SCAN] Major 2 sub-archives:\n");
    
    for (let minor = 0; minor < 40; minor++) {
        try {
            const archive = await cache.getArchiveById(2, minor);
            if (archive && archive.length > 0) {
                console.log(`  Major 2, Minor ${minor.toString().padStart(2)}: ${archive.length} files`);
                
                // Try to identify the type by attempting known parsers
                if (archive.length > 0 && archive[0].buffer) {
                    const firstSize = archive[0].buffer.byteLength;
                    console.log(`    First file: ${firstSize} bytes`);
                }
            }
        } catch {
            // Minor doesn't exist
        }
    }

    // Deep scan Major 3 (interfaces) — find which interfaces exist
    console.log("\n[DEEP SCAN] Major 3 (Interfaces) — checking key HUD interfaces:\n");
    
    const hudInterfaces = [
        { id: 320, name: 'Inventory' },
        { id: 548, name: 'Main HUD' },
        { id: 745, name: 'Chat Box' },
        { id: 768, name: 'Ribbon' },
        { id: 1430, name: 'Action Bar (legacy?)' },
        { id: 1433, name: 'Ability Book' },
        { id: 1477, name: 'Modern HUD' },
        { id: 1496, name: 'HUD Forensics' },
        { id: 1841, name: 'Action Bar' },
        { id: 1929, name: 'Necromancy?' },
        { id: 1946, name: 'Unknown' },
    ];

    for (const iface of hudInterfaces) {
        try {
            const archive = await cache.getArchiveById(3, iface.id);
            if (archive) {
                let scriptsCount = 0;
                let textLabels: string[] = [];
                
                for (const sub of archive) {
                    try {
                        const state: any = {
                            isWrite: false,
                            buffer: sub.buffer,
                            stack: [],
                            hiddenstack: [],
                            scan: 0,
                            endoffset: sub.buffer.byteLength,
                            args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
                        };
                        const comp = parse.interfaces.parser.read(state);
                        if (comp.scripts?.load?.length > 0) scriptsCount++;
                        if (comp.textdata?.text) textLabels.push(comp.textdata.text);
                        if (comp.text) textLabels.push(comp.text);
                    } catch {}
                }
                
                const labelPreview = textLabels.filter(t => t.length > 0).slice(0, 5).join(', ');
                console.log(`  Interface ${iface.id.toString().padStart(4)} (${iface.name}): ${archive.length} components, ${scriptsCount} scripted${labelPreview ? ` [${labelPreview}]` : ''}`);
            }
        } catch {
            console.log(`  Interface ${iface.id.toString().padStart(4)} (${iface.name}): not found`);
        }
    }

    // Try to find enum archives — they might be in a different minor
    console.log("\n[DEEP SCAN] Searching for enum data in Major 2...\n");
    
    for (let minor = 0; minor < 40; minor++) {
        try {
            const archive = await cache.getArchiveById(2, minor);
            if (!archive || archive.length === 0) continue;
            
            // Try parsing first file as enum
            if (parse?.enums?.parser && archive[0].buffer.byteLength > 4) {
                try {
                    const state = {
                        isWrite: false,
                        buffer: archive[0].buffer,
                        stack: [],
                        hiddenstack: [],
                        scan: 0,
                        endoffset: archive[0].buffer.byteLength,
                        args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
                    };
                    const parsed = parse.enums.parser.read(state);
                    if (parsed.values && Object.keys(parsed.values).length > 0) {
                        console.log(`  Minor ${minor}: ENUM CANDIDATE — ${Object.keys(parsed.values).length} entries (keytype=${parsed.keytype}, valtype=${parsed.valtype})`);
                    }
                } catch {}
            }
        } catch {}
    }

    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  Scan Complete");
    console.log("═══════════════════════════════════════════════════════════");
}

main().catch(console.error);
