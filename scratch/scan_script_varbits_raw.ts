import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const inspectorPath = 'D:/sovereign/cache_pedagogy/rsmv_inspector';
const varbitRegistryPath = 'D:/sovereign/cache_pedagogy/json_dumps/varbits_registry_new.json';
const BETA_CACHE = 'C:/ProgramData/Jagex/RuneScape-BETA';

const { parse } = require(path.join(inspectorPath, 'src', 'opdecoder.js'));
const { GameCacheLoader } = require(path.join(inspectorPath, 'src', 'cache', 'sqlite.js'));

// Target scripts from interface 1420 (Character Creation) components
const TARGET_SCRIPTS = [
    10896,  // Skin Colour component
    10496,  // Appearance sub-component
    7937,   // Character model builder
    9344,   // Appearance tab handler
    9342,   // Equipment tab handler
    9343,   // Equipment sub-handler
    7888,   // Body morph slider?
    7893,   // Repeated handler (6x in 1420)
    7897,   // Unknown handler
    7898,   // Unknown handler  
    7880,   // Equipment renderer
    7881,   // Equipment renderer 2
    10702,  // Morph controller?
    10703,  // Morph controller 2?
    11195,  // Avatar refresh handler
    15550,  // High-ID character creation
    15551,  // High-ID character creation 2
    15560,  // Body customization
    15563,  // Face customization
    15565,  // Hair customization
    15566,  // Color customization
    15569,  // Skin customization
    15570,  // Gender handler
    15572,  // Apply changes
    15573,  // Reset handler
    15574,  // Wardrobe tab
    15577,  // Slot handler
    15578,  // Slot handler 2
    15587,  // Preview handler
    15656,  // Avatar refresh preview
    16899,  // High-ID morph
    13914,  // Confirmation/save handler
    1586,   // Equipment slot writer
    4135,   // Generic UI handler
    312,    // Core script
    6233,   // Utility script
    6689,   // Utility script 2
    8799,   // Preview renderer
    44,     // Master interaction
];

interface VarbitMatch {
    scriptId: number;
    varbitId: number;
    varid: number;
    bitBase: number;
    bitEnd: number;
    width: number;
    byteOffset: number;
}

async function scanScriptBytecodeForVarbits() {
    console.log("=== CS2 Raw Bytecode Varbit Scanner ===");
    console.log(`Cache: ${BETA_CACHE}`);
    console.log(`Registry: ${varbitRegistryPath}\n`);
    
    // Load varbit registry
    const registry: Record<string, { varid: number; bits: [number, number] }> = 
        JSON.parse(fs.readFileSync(varbitRegistryPath, 'utf8'));
    
    const varbitSet = new Set<number>();
    const varbitMeta = new Map<number, { varid: number; bits: [number, number] }>();
    for (const [key, value] of Object.entries(registry)) {
        const id = parseInt(key, 10);
        varbitSet.add(id);
        varbitMeta.set(id, value);
    }
    console.log(`Loaded ${varbitSet.size} varbits from registry.`);
    
    // Load BETA cache
    const cache = new GameCacheLoader(BETA_CACHE);
    cache.buildnr = 1149;
    
    const allMatches: VarbitMatch[] = [];
    
    for (const scriptId of TARGET_SCRIPTS) {
        try {
            // JS5 major 12 = client scripts
            const buf = await cache.getFile(12, scriptId);
            if (!buf || buf.length < 10) continue;
            
            // The clientscriptdata structure:
            // The opcode bytecode is in the middle of the buffer.
            // Footer contains: switchsize (2 bytes), instructioncount (2 bytes), 
            // localintcount (2 bytes), localstringcount (2 bytes), locallongcount (2 bytes)
            // at the end of the buffer before the footer.
            // The opcode data starts at offset 0 (after a leading byte) and ends before the string table.
            
            // Read the scriptdata footer first (parse.clientscriptdata gives us the metadata)
            let scriptdata: any;
            try {
                scriptdata = parse.clientscriptdata.read(buf, cache);
            } catch {
                continue;
            }
            
            // Scan for 2-byte, 3-byte, and 4-byte integer patterns that match varbit IDs
            const matches: VarbitMatch[] = [];
            
            for (let offset = 0; offset < buf.length - 1; offset++) {
                // Check 2-byte big-endian (varbit IDs are often < 65536)
                if (offset + 2 <= buf.length) {
                    const val16 = buf.readUInt16BE(offset);
                    if (varbitSet.has(val16) && val16 > 100) {
                        const meta = varbitMeta.get(val16)!;
                        matches.push({
                            scriptId,
                            varbitId: val16,
                            varid: meta.varid,
                            bitBase: meta.bits[0],
                            bitEnd: meta.bits[1],
                            width: meta.bits[1] - meta.bits[0] + 1,
                            byteOffset: offset
                        });
                    }
                }
                
                // Check 4-byte big-endian int (for pushvar-style packed varids)
                if (offset + 4 <= buf.length) {
                    const val32 = buf.readInt32BE(offset);
                    if (val32 > 100 && val32 < 65536 && varbitSet.has(val32)) {
                        const meta = varbitMeta.get(val32)!;
                        // Only add if not already captured as 16-bit
                        if (!matches.some(m => m.varbitId === val32 && Math.abs(m.byteOffset - offset) < 3)) {
                            matches.push({
                                scriptId,
                                varbitId: val32,
                                varid: meta.varid,
                                bitBase: meta.bits[0],
                                bitEnd: meta.bits[1],
                                width: meta.bits[1] - meta.bits[0] + 1,
                                byteOffset: offset
                            });
                        }
                    }
                }
            }
            
            if (matches.length > 0) {
                allMatches.push(...matches);
            }
        } catch (e: any) {
            // Script not found in cache
        }
    }
    
    // Deduplicate: same scriptId + varbitId
    const deduped = new Map<string, VarbitMatch>();
    for (const m of allMatches) {
        const key = `${m.scriptId}:${m.varbitId}`;
        if (!deduped.has(key)) {
            deduped.set(key, m);
        }
    }
    
    // Group by varbit
    const grouped = new Map<number, VarbitMatch[]>();
    for (const m of deduped.values()) {
        if (!grouped.has(m.varbitId)) grouped.set(m.varbitId, []);
        grouped.get(m.varbitId)!.push(m);
    }
    
    // Sort by number of scripts referencing (most referenced = most important)
    const sorted = [...grouped.entries()].sort((a, b) => b[1].length - a[1].length);
    
    console.log(`\n=== AVATAR VARBIT CANDIDATES (from ${TARGET_SCRIPTS.length} scripts) ===`);
    console.log(`Total unique varbit references: ${deduped.size}`);
    console.log(`Unique varbits referenced: ${grouped.size}\n`);
    
    // Filter to morphology-relevant bit widths
    const morphRelevant = sorted.filter(([_, matches]) => {
        const w = matches[0].width;
        return w >= 3; // 3+ bits = meaningful state (skin tones, sliders, etc)
    });
    
    console.log(`--- High-Confidence Morphology Candidates (3+ bit width, multi-script) ---`);
    for (const [varbitId, matches] of morphRelevant.slice(0, 40)) {
        const m = matches[0];
        const scripts = matches.map(r => r.scriptId);
        const maxVal = Math.pow(2, m.width) - 1;
        console.log(`VarBit ${varbitId}: ${m.width}-bit [${m.bitBase}-${m.bitEnd}] (0-${maxVal}) varp=${m.varid}`);
        console.log(`  Scripts: ${scripts.join(', ')}`);
    }
    
    // Also output the full mapping as JSON for downstream consumption
    const output: any = {};
    for (const [varbitId, matches] of sorted) {
        const m = matches[0];
        output[varbitId] = {
            width: m.width,
            bits: [m.bitBase, m.bitEnd],
            varid: m.varid,
            maxValue: Math.pow(2, m.width) - 1,
            scripts: matches.map(r => r.scriptId)
        };
    }
    
    const outPath = 'D:/POG2/scratch/avatar_varbit_candidates.json';
    fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
    console.log(`\nFull mapping written to: ${outPath}`);
}

scanScriptBytecodeForVarbits().catch(console.error);
