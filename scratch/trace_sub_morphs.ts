import * as fs from 'fs';

const dump = JSON.parse(fs.readFileSync('D:/POG2/scratch/interface_1420_dump.json', 'utf8'));
const comps: any[] = dump.components || dump;

const childMap = new Map<number, any[]>();
const compMap = new Map<number, any>();
for (const comp of comps) {
    compMap.set(comp.componentId, comp);
    if (comp.parentId !== undefined) {
        if (!childMap.has(comp.parentId)) childMap.set(comp.parentId, []);
        childMap.get(comp.parentId)!.push(comp);
    }
}

function getLabels(compId: number): string[] {
    const labels: string[] = [];
    let cur = compMap.get(compId);
    for (let d = 0; d < 4 && cur; d++) {
        const pid = cur.parentId;
        if (pid === undefined) break;
        for (const sib of childMap.get(pid) || []) {
            if (sib.text && sib.text.trim().length > 0) {
                labels.push(sib.text.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').trim());
            }
        }
        cur = compMap.get(pid);
    }
    return [...new Set(labels)];
}

console.log('=== FACE/BODY SUB-MORPH SLIDERS (SCRIPT 7893) ===\n');

for (const comp of comps) {
    if (!comp.scripts || !comp.scripts.load || comp.scripts.load[0] !== 7893) continue;
    
    const args = comp.scripts.load.slice(1);
    const labels = getLabels(comp.componentId);
    
    console.log(`Comp ${comp.componentId} Slider Script 7893:`);
    console.log(`  Args: [${args.join(', ')}]`);
    console.log(`  Labels: ${labels.join(' | ')}`);
}

console.log('\n=== WARDROBE THEME/SLOT DECODE (VARBIT 28680) ===\n');

// Varbit 28680 is 14 bits.
// We expect 5 themes * 5 slots = something that fits in 14 bits.
// Actually 14 bits = 16384. If it's a bitmask for 5 slots + 3-bit theme or something.
// Let's print out what 14 bits looks like in hex: 0x3FFF

console.log('Varbit 28680 is 14-bit (0x0000 - 0x3FFF).');
console.log('Themes: Frozen, Furnished, Abandoned, Occult, Warped (5 options).');
console.log('Slots: Head, Body, Hands, Legs, Feet (5 options).');
console.log('Hypothesis: Theme is bits 0-2 (0-4 values), Slots are bits 3-7 (5 bits, one for each slot unlocked)? Or bits 0-4 = slots, bits 5-7 = theme?');
