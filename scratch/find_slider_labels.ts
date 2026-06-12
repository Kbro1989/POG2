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

function walk(id: number) {
    const c = compMap.get(id);
    if (c && c.text) {
        console.log(`  comp ${c.componentId}: ${c.text.replace(/<[^>]+>/g, '').trim()}`);
    }
    for (const child of childMap.get(id) || []) {
        walk(child.componentId);
    }
}

console.log('--- Texts inside 69 (Slider Container) ---');
walk(69);

console.log('\n--- Texts inside 94 (Slider Container sibling) ---');
walk(94);
