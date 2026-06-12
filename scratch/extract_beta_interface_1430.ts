/**
 * extract_beta_interface_1430.ts
 *
 * Interface 1430 = Action Bar (269 components, 39 scripted, has slot numbers 1,2,3,4,5).
 * Interface 1433 = Ability Book (93 components, 28 scripted).
 *
 * Extract EXACT ability bindings and script data from these interfaces.
 * Also scan structs (2:32) for string params.
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

    // ── Interface 1430 (Action Bar) ──
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  Interface 1430 (Action Bar) — Full Component Dump");
    console.log("═══════════════════════════════════════════════════════════\n");

    const actionBar = await cache.getArchiveById(3, 1430);
    const components: any[] = [];

    for (const sub of actionBar) {
        try {
            const state = makeState(cache, sub.buffer);
            const comp = parse.interfaces.parser.read(state);
            comp._fileid = sub.fileid;
            components.push(comp);
        } catch { /* skip */ }
    }

    // Show scripted slots with their full script data
    const scripted = components.filter(c => c.scripts?.load?.length > 0);
    console.log(`  Total: ${components.length} components, ${scripted.length} scripted\n`);

    for (const comp of scripted) {
        console.log(`  Component ${comp._fileid}:`);
        console.log(`    type: ${comp.type}, hidden: ${comp.hidden}`);
        if (comp.textdata?.text) console.log(`    text: "${comp.textdata.text}"`);
        if (comp.text) console.log(`    text: "${comp.text}"`);
        if (comp.spritedata?.spriteid) console.log(`    sprite: ${comp.spritedata.spriteid}`);
        if (comp.spriteid) console.log(`    sprite: ${comp.spriteid}`);

        const opts = (comp.rightclickopts || []).filter((x: any) => x && x !== 'null');
        if (opts.length > 0) console.log(`    rightclick: [${opts.join(', ')}]`);

        for (const [scriptName, scriptData] of Object.entries(comp.scripts || {})) {
            if (Array.isArray(scriptData) && (scriptData as any[]).length > 0) {
                const preview = (scriptData as any[]).slice(0, 8);
                console.log(`    script.${scriptName}: [${preview.join(', ')}${(scriptData as any[]).length > 8 ? ', ...' : ''}]`);
            }
        }
        console.log();
    }

    // ── Interface 1433 (Ability Book) ──
    console.log("═══════════════════════════════════════════════════════════");
    console.log("  Interface 1433 (Ability Book) — Full Component Dump");
    console.log("═══════════════════════════════════════════════════════════\n");

    const abilityBook = await cache.getArchiveById(3, 1433);
    const abComponents: any[] = [];

    for (const sub of abilityBook) {
        try {
            const state = makeState(cache, sub.buffer);
            const comp = parse.interfaces.parser.read(state);
            comp._fileid = sub.fileid;
            abComponents.push(comp);
        } catch { /* skip */ }
    }

    const abScripted = abComponents.filter(c => c.scripts?.load?.length > 0);
    const abWithText = abComponents.filter(c => c.textdata?.text || c.text);
    console.log(`  Total: ${abComponents.length} components, ${abScripted.length} scripted, ${abWithText.length} with text\n`);

    // Show ALL text labels from ability book
    console.log("  Text labels:");
    for (const comp of abWithText) {
        const text = comp.textdata?.text || comp.text;
        console.log(`    [${comp._fileid}] "${text}"`);
    }

    // Show scripted ability book components
    console.log("\n  Scripted components:");
    for (const comp of abScripted.slice(0, 20)) {
        const text = comp.textdata?.text || comp.text || '';
        const opts = (comp.rightclickopts || []).filter((x: any) => x && x !== 'null');
        console.log(`    [${comp._fileid}] type=${comp.type} text="${text}" opts=[${opts.join(',')}]`);
        for (const [sn, sd] of Object.entries(comp.scripts || {})) {
            if (Array.isArray(sd) && (sd as any[]).length > 0) {
                console.log(`      script.${sn}: [${(sd as any[]).slice(0, 6).join(',')}${(sd as any[]).length > 6 ? ',...' : ''}]`);
            }
        }
    }

    // ── Scan all structs in 2:32 for string values ──
    console.log("\n═══════════════════════════════════════════════════════════");
    console.log("  Struct Archive 2:32 — String Param Search");
    console.log("═══════════════════════════════════════════════════════════\n");

    const structArchive = await cache.getArchiveById(2, 32);
    let structsParsed = 0;
    const stringStructs: { id: number; strings: string[] }[] = [];

    for (const sub of structArchive) {
        if (!sub.buffer || sub.buffer.byteLength < 4) continue;
        try {
            const state = makeState(cache, sub.buffer);
            const result = parse.structs.parser.read(state);
            structsParsed++;

            if (result.params) {
                const strings: string[] = [];
                for (const v of Object.values(result.params)) {
                    if (typeof v === 'string' && v.length > 1) strings.push(v as string);
                }
                if (strings.length > 0) {
                    stringStructs.push({ id: sub.fileid, strings });
                }
            }
        } catch { /* skip */ }
    }

    console.log(`  Parsed: ${structsParsed}, With strings: ${stringStructs.length}\n`);

    // Search for ability-like strings
    const abilityPattern = /slice|assault|surge|berserk|sunshine|death|soul|dragon|breath|snipe|hurricane|finger|omni|wild magic|asphyxiate|combust|chain|fury|havoc|punch|dismember|slaughter|flurry|piercing|ricochet|snap|rapid|corruption|bombardment|deadshot|sonic|concentrated|impact|runic|smoke|magma|meteor|overpower|pulverise|barricade|devotion|resonance|volley|skull|necrotic|bloat|spectral|ability|threshold|ultimate|basic|enhanced|adrenaline|cooldown/i;

    const abilityStructMatches: { id: number; strings: string[] }[] = [];
    for (const s of stringStructs) {
        const matches = s.strings.filter(str => abilityPattern.test(str));
        if (matches.length > 0) {
            abilityStructMatches.push({ id: s.id, strings: matches });
        }
    }

    console.log(`  Ability-related structs: ${abilityStructMatches.length}\n`);
    for (const s of abilityStructMatches.slice(0, 30)) {
        console.log(`  Struct ${s.id}: ${s.strings.join(' | ')}`);
    }

    // Save interface dumps
    const outPath = 'D:/sovereign/cache_pedagogy/json_dumps/beta_interfaces_1430_1433.json';
    fs.writeFileSync(outPath, JSON.stringify({
        _meta: { buildId: 1149, extracted: new Date().toISOString() },
        interface_1430: { total: components.length, scripted: scripted.length },
        interface_1433: { 
            total: abComponents.length, 
            scripted: abScripted.length, 
            textLabels: abWithText.map(c => ({ id: c._fileid, text: c.textdata?.text || c.text }))
        },
        structs_with_ability_strings: abilityStructMatches
    }, null, 2));
    console.log(`\n[SAVED] ${outPath}`);
}

main().catch(console.error);
