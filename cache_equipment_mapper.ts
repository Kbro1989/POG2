/**
 * cache_equipment_mapper.ts - Equipment Slot Classifier Proof-of-Work
 * 
 * Scans all 59k+ items from the RS3 cache and exports only equippable ones,
 * grouped by the 16 avatar equipment slots.
 * 
 * Usage: npx tsx cache_equipment_mapper.ts
 *        npx tsx cache_equipment_mapper.ts --output equipment_by_slot.json
 *        npx tsx cache_equipment_mapper.ts --slot weapon
 *        npx tsx cache_equipment_mapper.ts --slot helm,cape
 * 
 * Substrate hook: Consumed by RSCLimb for equipment awareness,
 * PedagogyLimb for "what can go in each slot?", and avatar composition.
 */



import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader  } = require("./rsmv/src/cache/sqlite.js");
const { parse  } = require("./rsmv/src/opdecoder.js");
import * as fs from 'fs';



(global as any).__non_webpack_require__ = require;

// ─── Types ───
const SLOT_NAMES = [
    'helm', 'cape', 'necklace', 'weapon', 'body', 'offhand',
    'arms', 'legs', 'face', 'gloves', 'boots', 'beard',
    'ring', 'ammo', 'aura', 'slot15'
];

interface EquipmentEntry {
    id: number;
    name: string;
    equipSlotId: number;
    equipId: number | null;
    isMember: boolean;
    isTradeable: boolean;
    value: number | null;
    maleModelId: number | null;
    femaleModelId: number | null;
    colorReplacements: [number, number][] | null;
    actions: string[];
}

interface EquipmentBySlot {
    [slotName: string]: {
        slotId: number;
        count: number;
        items: EquipmentEntry[];
    };
}

interface EquipmentMapOutput {
    totalEquippable: number;
    totalScanned: number;
    slotBreakdown: Record<string, number>;
    equipment: EquipmentBySlot;
    timestamp: string;
    pedagogy: {
        averagePerSlot: number;
        mostPopulatedSlot: string;
        leastPopulatedSlot: string;
        emptySlots: string[];
    };
}

// ─── Config ───
const CACHE_PATH = 'C:\\ProgramData\\Jagex\\RuneScape';
const MAJOR_ITEMS = 19;
const ARCH_SIZE = 256;

// ─── Main ───
async function main() {
    const args = process.argv.slice(2);
    let outputFile = 'equipment_by_slot.json';
    let filterSlots: string[] = [];

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--output': case '-o': outputFile = args[++i]; break;
            case '--slot': filterSlots = args[++i].split(',').map(s => s.trim().toLowerCase()); break;
        }
    }

    console.log(`\n🔬 Cache Equipment Mapper`);
    console.log(`   Scanning RS3 cache for all equippable items...\n`);

    const cache = new GameCacheLoader(CACHE_PATH);
    (cache as any).buildnr = 940;

    // Initialize slot buckets
    const equipment: EquipmentBySlot = {};
    for (let i = 0; i < SLOT_NAMES.length; i++) {
        equipment[SLOT_NAMES[i]] = { slotId: i, count: 0, items: [] };
    }

    let totalScanned = 0;
    let totalEquippable = 0;

    try {
        const indices = await cache.getCacheIndex(MAJOR_ITEMS);
        console.log(`  Found ${indices.length} archives in Major ${MAJOR_ITEMS}.`);

        for (const index of indices) {
            if (!index) continue;
            try {
                const archive = await cache.getArchiveById(MAJOR_ITEMS, index.minor);
                for (const file of archive) {
                    totalScanned++;
                    const id = index.minor * ARCH_SIZE + file.fileid;
                    try {
                        const raw = parse.item.read(file.buffer, cache);
                        if (raw.equipSlotId == null) continue;

                        const slotId = raw.equipSlotId;
                        if (slotId < 0 || slotId >= SLOT_NAMES.length) continue;

                        const slotName = SLOT_NAMES[slotId];
                        const name = raw.name || `ITEMS ${id}`;

                        // Skip placeholders
                        if (name.startsWith('ITEMS ')) continue;

                        // Widget actions
                        const actions: string[] = [];
                        for (let i = 0; i < 5; i++) {
                            const key = `widget_actions_${i}` as keyof typeof raw;
                            if (raw[key]) actions.push(raw[key] as string);
                        }

                        const entry: EquipmentEntry = {
                            id,
                            name,
                            equipSlotId: slotId,
                            equipId: raw.equipId ?? null,
                            isMember: !!raw.members,
                            isTradeable: !!raw.tradeable,
                            value: raw.value ?? null,
                            maleModelId: raw.maleModels_0?.id ?? null,
                            femaleModelId: raw.femaleModels_0?.id ?? null,
                            colorReplacements: raw.color_replacements ?? null,
                            actions,
                        };

                        equipment[slotName].items.push(entry);
                        equipment[slotName].count++;
                        totalEquippable++;
                    } catch {
                        // Skip parse errors
                    }
                }
            } catch {
                // Skip archive errors
            }

            if (index.minor % 30 === 0) {
                process.stdout.write(`\r  Scanned ${totalScanned} items, found ${totalEquippable} equippable...`);
            }
        }
    } catch (e) {
        console.error(`Failed to scan cache: ${(e as Error).message}`);
    }

    cache.close();
    console.log(`\r  Scanned ${totalScanned} items, found ${totalEquippable} equippable.     \n`);

    // Slot breakdown
    const slotBreakdown: Record<string, number> = {};
    let mostPop = { name: '', count: 0 };
    let leastPop = { name: '', count: Infinity };
    const emptySlots: string[] = [];

    for (const slotName of SLOT_NAMES) {
        const count = equipment[slotName].count;
        slotBreakdown[slotName] = count;
        if (count > mostPop.count) mostPop = { name: slotName, count };
        if (count < leastPop.count) leastPop = { name: slotName, count };
        if (count === 0) emptySlots.push(slotName);
    }

    // Console output
    console.log('  ┌──────────┬────────┬─────────────────────────────────────┐');
    console.log('  │ Slot     │ Count  │ Top 3 Items                         │');
    console.log('  ├──────────┼────────┼─────────────────────────────────────┤');
    for (const slotName of SLOT_NAMES) {
        const slot = equipment[slotName];
        const top3 = slot.items.slice(0, 3).map(i => i.name).join(', ');
        const slotStr = slotName.padEnd(8);
        const countStr = String(slot.count).padStart(6);
        const top3Str = (top3 || '(empty)').padEnd(37).slice(0, 37);
        console.log(`  │ ${slotStr} │ ${countStr} │ ${top3Str} │`);
    }
    console.log('  └──────────┴────────┴─────────────────────────────────────┘');

    // Filter if requested
    let outputData: EquipmentBySlot = equipment;
    if (filterSlots.length > 0) {
        outputData = {};
        for (const slot of filterSlots) {
            if (equipment[slot]) outputData[slot] = equipment[slot];
        }
        console.log(`\n  Filtered to slots: ${filterSlots.join(', ')}`);
    }

    // Output
    const output: EquipmentMapOutput = {
        totalEquippable,
        totalScanned,
        slotBreakdown,
        equipment: outputData,
        timestamp: new Date().toISOString(),
        pedagogy: {
            averagePerSlot: Math.round(totalEquippable / SLOT_NAMES.length),
            mostPopulatedSlot: mostPop.name,
            leastPopulatedSlot: leastPop.name,
            emptySlots,
        },
    };

    fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
    console.log(`\n  → Saved to ${outputFile}`);

    // Pedagogy
    console.log(`\n  🧠 Pedagogy Summary:`);
    console.log(`    Total equippable items: ${totalEquippable} / ${totalScanned} scanned`);
    console.log(`    Average per slot: ${Math.round(totalEquippable / SLOT_NAMES.length)}`);
    console.log(`    Most populated: ${mostPop.name} (${mostPop.count})`);
    console.log(`    Least populated: ${leastPop.name} (${leastPop.count})`);
    if (emptySlots.length) console.log(`    Empty slots: ${emptySlots.join(', ')}`);
    console.log();
}

main().catch(console.error);
