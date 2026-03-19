/**
 * cache_npc_forensics.ts - Full NPC Decompiler Proof-of-Work
 *
 * Pulls the complete opcode-decoded definition for any NPC ID from the RS3 cache.
 * Extracts models, animations, actions, and combat data.
 * Special handling for Player NPC templates (15516-15524).
 *
 * Usage: npx tsx cache_npc_forensics.ts --id 50          (King Black Dragon)
 *        npx tsx cache_npc_forensics.ts --id 15516       (Player template)
 *        npx tsx cache_npc_forensics.ts --range 50-60    (range)
 *
 * Substrate hook: Powers EntityLimb.catalogEntity() and PedagogyLimb NPC learning.
 */
import { GameCacheLoader } from './tmp_rsmv_inspect/src/cache/sqlite.js';
import { parse } from './tmp_rsmv_inspect/src/opdecoder.js';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
global.__non_webpack_require__ = require;
// ─── Config ───
const CACHE_PATH = 'C:\\ProgramData\\Jagex\\RuneScape';
const MAJOR_NPCS = 18;
const ARCH_SIZE = 128;
const PLAYER_TEMPLATE_IDS = new Set([15516, 15517, 15518, 15519, 15520, 15521, 15522, 15523, 15524]);
// ─── Cache Bridge ───
async function loadNpc(cache, id) {
    const archiveId = Math.floor(id / ARCH_SIZE);
    const fileId = id % ARCH_SIZE;
    try {
        const archive = await cache.getArchiveById(MAJOR_NPCS, archiveId);
        const file = archive.find((f) => f.fileid === fileId);
        if (!file)
            return null;
        const raw = parse.npc.read(file.buffer, cache);
        const name = raw.name || `NPCS ${id}`;
        const isPlayerTemplate = PLAYER_TEMPLATE_IDS.has(id) || name === 'Player';
        // Extract models (models is number[] in the npcs type)
        const models = raw.models ? [...raw.models] : [];
        // Head models (headModels is number[] in the npcs type)
        const headModels = raw.headModels ? [...raw.headModels] : [];
        // Actions
        const actions = [];
        for (let i = 0; i < 5; i++) {
            const key = `actions_${i}`;
            if (raw[key])
                actions.push(raw[key]);
        }
        // Animation group (individual anims are packed into animation_group reference)
        const animationGroup = raw.animation_group ?? null;
        const animations = {
            idle: null,
            walk: null,
            run: null,
            turnBack: null,
            turnLeft: null,
            turnRight: null,
        };
        // Classification
        let classification = 'unknown';
        if (isPlayerTemplate)
            classification = 'player_template';
        else if (raw.combat != null && raw.combat > 0)
            classification = 'combat_npc';
        else if (actions.some(a => a.toLowerCase().includes('talk') || a.toLowerCase().includes('trade')))
            classification = 'passive_npc';
        else if (models.length > 0)
            classification = 'scenery_npc';
        // Model complexity
        const totalModels = models.length + headModels.length;
        const modelComplexity = totalModels === 0 ? 'simple' :
            totalModels <= 3 ? 'moderate' : 'complex';
        const summary = [
            `"${name}" (ID ${id})`,
            isPlayerTemplate ? '⚡ PLAYER TEMPLATE' : '',
            raw.combat != null ? `Combat Lv.${raw.combat}` : 'non-combat',
            `${models.length} body model(s)`,
            `${headModels.length} head model(s)`,
            actions.length ? `actions=[${actions.join(', ')}]` : 'no actions',
        ].filter(Boolean).join(', ');
        return {
            id,
            raw,
            forensics: {
                name,
                combatLevel: raw.combat ?? null,
                isPlayerTemplate,
                models,
                headModels,
                actions,
                boundSize: raw.boundSize ?? null,
                colorReplacements: raw.color_replacements ?? null,
                materialReplacements: raw.material_replacements ?? null,
                animationGroup,
                animations,
                isMinimapVisible: raw.drawMapDot === false ? false : true,
            },
            pedagogy: {
                summary,
                classification,
                modelComplexity,
            },
        };
    }
    catch (e) {
        console.error(`[WARN] Failed to load NPC ${id}: ${e.message}`);
        return null;
    }
}
// ─── CLI ───
function parseArgs() {
    const args = process.argv.slice(2);
    let ids = [];
    let outputFile;
    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--id':
                ids = args[++i].split(',').map(Number);
                break;
            case '--range': {
                const [start, end] = args[++i].split('-').map(Number);
                for (let j = start; j <= end; j++)
                    ids.push(j);
                break;
            }
            case '--output':
            case '-o':
                outputFile = args[++i];
                break;
        }
    }
    if (ids.length === 0) {
        console.log('Usage: npx tsx cache_npc_forensics.ts --id 50');
        console.log('       npx tsx cache_npc_forensics.ts --id 50,15516');
        console.log('       npx tsx cache_npc_forensics.ts --range 15516-15524');
        console.log('       npx tsx cache_npc_forensics.ts --id 50 --output kbd.json');
        process.exit(1);
    }
    return { ids, outputFile };
}
// ─── Main ───
async function main() {
    const { ids, outputFile } = parseArgs();
    console.log(`\n🔬 Cache NPC Forensics`);
    console.log(`   Decompiling ${ids.length} NPC(s) from RS3 cache...\n`);
    const cache = new GameCacheLoader(CACHE_PATH);
    cache.buildnr = 940;
    const results = [];
    for (const id of ids) {
        const result = await loadNpc(cache, id);
        if (result) {
            results.push(result);
            console.log(`  ✅ ${result.pedagogy.summary}`);
        }
        else {
            console.log(`  ❌ NPC ${id}: not found or parse error`);
        }
    }
    cache.close();
    // Output
    if (outputFile) {
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
        console.log(`\n  → Saved ${results.length} forensic results to ${outputFile}`);
    }
    // Pedagogy
    console.log(`\n  🧠 Pedagogy Summary:`);
    const byClass = results.reduce((acc, r) => {
        acc[r.pedagogy.classification] = (acc[r.pedagogy.classification] || 0) + 1;
        return acc;
    }, {});
    console.log(`    Classification: ${JSON.stringify(byClass)}`);
    const playerTemplates = results.filter(r => r.forensics.isPlayerTemplate);
    if (playerTemplates.length > 0) {
        console.log(`    ⚡ Player Templates Found: ${playerTemplates.map(p => p.id).join(', ')}`);
        console.log(`       These are empty avatar chassis — equipment applied at runtime via avatar service.`);
    }
    console.log();
}
import { fileURLToPath } from 'url';
if (import.meta.url.startsWith('file:') && process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch(console.error);
}
export { loadNpc, PLAYER_TEMPLATE_IDS };
