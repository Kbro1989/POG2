/**
 * cache_item_forensics.ts - Full Item Decompiler Proof-of-Work
 * 
 * Pulls the complete opcode-decoded definition for any item ID from the RS3 cache.
 * Extracts equipment data, models, colors, quest links, and actions.
 * 
 * Usage: npx tsx cache_item_forensics.ts --id 4151       (single item)
 *        npx tsx cache_item_forensics.ts --id 4151,1053  (multiple items)
 *        npx tsx cache_item_forensics.ts --range 1050-1060 (ID range)
 * 
 * Substrate hook: Powers PedagogyLimb equipment learning and EntityLimb catalog.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require("./tmp_rsmv_inspect/src/cache/sqlite.js");
const { parse } = require("./tmp_rsmv_inspect/src/opdecoder.js");
import * as fs from 'fs';




(global as any).__non_webpack_require__ = require;

// ─── Types ───
const SLOT_NAMES = [
    'helm', 'cape', 'necklace', 'weapon', 'body', 'offhand',
    'arms', 'legs', 'face', 'gloves', 'boots', 'beard',
    'ring', 'ammo', 'aura', 'slot15'
];

interface ItemForensicResult {
    id: number;
    raw: any;
    forensics: {
        name: string;
        isEquippable: boolean;
        equipSlot: string | null;
        equipSlotId: number | null;
        isMember: boolean;
        isStackable: boolean;
        isTradeable: boolean;
        value: number | null;
        maleModels: (number | null)[];
        femaleModels: (number | null)[];
        maleHeads: (number | null)[];
        femaleHeads: (number | null)[];
        colorReplacements: [number, number][] | null;
        materialReplacements: [number, number][] | null;
        groundActions: string[];
        widgetActions: string[];
        questLinks: [number, number][] | null;
    };
    pedagogy: {
        summary: string;
        equipContext: string | null;
        modelCount: number;
    };
}

// ─── Cache Bridge ───
const CACHE_PATH = 'C:\\ProgramData\\Jagex\\RuneScape';
const MAJOR_ITEMS = 19;
const ARCH_SIZE = 256;

async function loadItem(cache: any, id: number): Promise<ItemForensicResult | null> {
    const archiveId = Math.floor(id / ARCH_SIZE);
    const fileId = id % ARCH_SIZE;

    try {
        const archive = await cache.getArchiveById(MAJOR_ITEMS, archiveId);
        const file = archive.find((f: any) => f.fileid === fileId);
        if (!file) return null;

        const raw = parse.item.read(file.buffer, cache);
        const name = raw.name || `ITEMS ${id}`;
        const equipSlotId = raw.equipSlotId ?? null;
        const isEquippable = equipSlotId !== null;

        // Extract models
        const maleModels = [
            raw.maleModels_0?.id ?? null,
            raw.maleModels_1 ?? null,
            raw.maleModels_2 ?? null,
        ];
        const femaleModels = [
            raw.femaleModels_0?.id ?? null,
            raw.femaleModels_1 ?? null,
            raw.femaleModels_2 ?? null,
        ];
        const maleHeads = [raw.maleHeads_0 ?? null, raw.maleHeads_1 ?? null];
        const femaleHeads = [raw.femaleHeads_0 ?? null, raw.femaleHeads_1 ?? null];

        const modelCount = [...maleModels, ...femaleModels, ...maleHeads, ...femaleHeads]
            .filter(m => m !== null).length;

        // Ground/widget actions
        const groundActions: string[] = [];
        for (let i = 0; i < 5; i++) {
            const key = `ground_actions_${i}` as keyof typeof raw;
            if (raw[key]) groundActions.push(raw[key] as string);
        }
        const widgetActions: string[] = [];
        for (let i = 0; i < 5; i++) {
            const key = `widget_actions_${i}` as keyof typeof raw;
            if (raw[key]) widgetActions.push(raw[key] as string);
        }

        // Pedagogy context
        const equipSlotName = (isEquippable && equipSlotId !== null && equipSlotId < SLOT_NAMES.length)
            ? SLOT_NAMES[equipSlotId]
            : null;

        const equipContext = isEquippable
            ? `Equips to slot ${equipSlotId} (${equipSlotName}). Has ${modelCount} model reference(s).`
            : null;

        const summary = [
            `"${name}" (ID ${id})`,
            isEquippable ? `is equippable in the ${equipSlotName} slot` : 'is NOT equippable',
            raw.members ? '(members)' : '(F2P)',
            raw.tradeable ? 'tradeable' : 'untradeable',
            raw.value != null ? `value=${raw.value}` : '',
            widgetActions.length ? `actions=[${widgetActions.join(', ')}]` : '',
        ].filter(Boolean).join(', ');

        return {
            id,
            raw,
            forensics: {
                name,
                isEquippable,
                equipSlot: equipSlotName,
                equipSlotId,
                isMember: !!raw.members,
                isStackable: !!raw.stackable_1,
                isTradeable: !!raw.tradeable,
                value: raw.value ?? null,
                maleModels,
                femaleModels,
                maleHeads,
                femaleHeads,
                colorReplacements: raw.color_replacements ?? null,
                materialReplacements: raw.material_replacements ?? null,
                groundActions,
                widgetActions,
                questLinks: raw.quests ?? null,
            },
            pedagogy: {
                summary,
                equipContext,
                modelCount,
            },
        };
    } catch (e) {
        console.error(`[WARN] Failed to load item ${id}: ${(e as Error).message}`);
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
        console.log('Usage: npx tsx cache_item_forensics.ts --id 4151');
        console.log('       npx tsx cache_item_forensics.ts --id 4151,1053');
        console.log('       npx tsx cache_item_forensics.ts --range 1050-1060');
        console.log('       npx tsx cache_item_forensics.ts --id 4151 --output item_4151.json');
        process.exit(1);
    }

    return { ids, outputFile };
}

// ─── Main ───
async function main() {
    const { ids, outputFile } = parseArgs();

    console.log(`\n🔬 Cache Item Forensics`);
    console.log(`   Decompiling ${ids.length} item(s) from RS3 cache...\n`);

    const cache = new GameCacheLoader(CACHE_PATH);
    (cache as any).buildnr = 940;

    const results: ItemForensicResult[] = [];

    for (const id of ids) {
        const result = await loadItem(cache, id);
        if (result) {
            results.push(result);
            console.log(`  ✅ ${result.pedagogy.summary}`);
        } else {
            console.log(`  ❌ Item ${id}: not found or parse error`);
        }
    }

    cache.close();

    // Output
    if (outputFile) {
        fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
        console.log(`\n  → Saved ${results.length} forensic results to ${outputFile}`);
    }

    // Pedagogy summary
    console.log(`\n  🧠 Pedagogy Summary:`);
    const equippable = results.filter(r => r.forensics.isEquippable);
    const unequippable = results.filter(r => !r.forensics.isEquippable);
    console.log(`    Equippable: ${equippable.length} | Non-equippable: ${unequippable.length}`);
    if (equippable.length > 0) {
        const slotBreakdown = equippable.reduce((acc, r) => {
            const slot = r.forensics.equipSlot || 'unknown';
            acc[slot] = (acc[slot] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        console.log(`    Slot distribution: ${JSON.stringify(slotBreakdown)}`);
    }
    console.log();
}

import { fileURLToPath } from 'url';
if (import.meta.url.startsWith('file:') && process.argv[1] === fileURLToPath(import.meta.url)) {
    main().catch(console.error);
}

export { loadItem, SLOT_NAMES };
export type { ItemForensicResult };
