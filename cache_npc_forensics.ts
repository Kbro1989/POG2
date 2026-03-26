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

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require("./tmp_rsmv_inspect/src/cache/sqlite.js");
const { parse } = require("./tmp_rsmv_inspect/src/opdecoder.js");
import * as fs from 'fs';
import { getRSMVCachePath } from './src/utils/SovereignPathResolver.js';

(global as any).__non_webpack_require__ = require;

// ─── Types ───
interface NpcForensicResult {
    id: number;
    raw: any;
    forensics: {
        name: string;
        combatLevel: number | null;
        isPlayerTemplate: boolean;
        models: number[];
        headModels: number[];
        actions: string[];
        boundSize: number | null;
        colorReplacements: [number, number][] | null;
        materialReplacements: [number, number][] | null;
        animationGroup: number | null;
        animations: {
            idle: number | null;
            walk: number | null;
            run: number | null;
            turnBack: number | null;
            turnLeft: number | null;
            turnRight: number | null;
        };
        isMinimapVisible: boolean | null;
    };
    pedagogy: {
        summary: string;
        classification: 'player_template' | 'combat_npc' | 'passive_npc' | 'scenery_npc' | 'unknown';
        modelComplexity: 'simple' | 'moderate' | 'complex';
    };
}

// ─── Config ───
const CACHE_PATH = getRSMVCachePath();
const MAJOR_NPCS = 18;
const ARCH_SIZE = 128;
const PLAYER_TEMPLATE_IDS = new Set([15516, 15517, 15518, 15519, 15520, 15521, 15522, 15523, 15524]);

// ─── Cache Bridge ───
async function loadNpc(cache: any, id: number): Promise<NpcForensicResult | null> {
    const archiveId = Math.floor(id / ARCH_SIZE);
    const fileId = id % ARCH_SIZE;

    try {
        const archive = await cache.getArchiveById(MAJOR_NPCS, archiveId);
        const file = archive.find((f: any) => f.fileid === fileId);
        if (!file) return null;

        const raw = parse.npc.read(file.buffer, cache);
        const name = raw.name || `NPCS ${id}`;
        const isPlayerTemplate = PLAYER_TEMPLATE_IDS.has(id) || name === 'Player';

        // Extract models
        const models: number[] = raw.models ? [...raw.models] : [];

        // Head models
        const headModels: number[] = raw.headModels ? [...raw.headModels] : [];

        // Actions
        const actions: string[] = [];
        for (let i = 0; i < 5; i++) {
            const key = `actions_${i}` as keyof typeof raw;
            if (raw[key]) actions.push(raw[key] as string);
        }

        // Animation group
        const animationGroup = raw.animation_group ?? null;
        const animations = {
            idle: null as number | null,
            walk: null as number | null,
            run: null as number | null,
            turnBack: null as number | null,
            turnLeft: null as number | null,
            turnRight: null as number | null,
        };

        // Classification
        let classification: NpcForensicResult['pedagogy']['classification'] = 'unknown';
        if (isPlayerTemplate) classification = 'player_template';
        else if (raw.combat != null && raw.combat > 0) classification = 'combat_npc';
        else if (actions.some(a => a.toLowerCase().includes('talk') || a.toLowerCase().includes('trade'))) classification = 'passive_npc';
        else if (models.length > 0) classification = 'scenery_npc';

        // Model complexity
        const totalModels = models.length + headModels.length;
        const modelComplexity: NpcForensicResult['pedagogy']['modelComplexity'] =
            totalModels === 0 ? 'simple' :
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
    } catch (e) {
        console.error(`[WARN] Failed to load NPC ${id}: ${(e as Error).message}`);
        return null;
    }
}

// ─── CLI ───
function parseArgs(): { ids: number[]; outputFile?: string } {
    const args = process.argv.slice(2);
    let ids: number[] = [];
    let outputFile: string | undefined;

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--id':
                ids = args[++i].split(',').map(Number);
                break;
            case '--range': {
                const [start, end] = args[++i].split('-').map(Number);
                for (let j = start; j <= end; j++) ids.push(j);
                break;
            }
            case '--output': case '-o':
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
    (cache as any).buildnr = 940;

    const results: NpcForensicResult[] = [];

    for (const id of ids) {
        const result = await loadNpc(cache, id);
        if (result) {
            results.push(result);
            console.log(`  ✅ ${result.pedagogy.summary}`);
        } else {
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
    }, {} as Record<string, number>);
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
export type { NpcForensicResult };
