import * as fs from 'fs';

const dump = JSON.parse(fs.readFileSync('D:/POG2/scratch/interface_1420_dump.json', 'utf8'));
const comps: any[] = dump.components || dump;

const compMap = new Map<number, any>();
const childrenMap = new Map<number, any[]>();

for (const c of comps) {
    compMap.set(c.componentId, c);
    if (c.parentId !== -1) {
        if (!childrenMap.has(c.parentId)) childrenMap.set(c.parentId, []);
        childrenMap.get(c.parentId)!.push(c);
    }
}

function traverse(id: number, depth: number = 0) {
    const c = compMap.get(id);
    if (!c) return;
    
    let triggerInfo = '';
    if (c.scripts) {
        const triggers = Object.entries(c.scripts).map(([k, v]) => `${k}:${JSON.stringify(v)}`).join(' ');
        if (triggers) triggerInfo = ` | Triggers: ${triggers}`;
    }
    
    console.log(`${'  '.repeat(depth)}Comp ${id} (${c.type}) ${c.name || ''}${triggerInfo}`);
    
    const children = childrenMap.get(id) || [];
    for (const child of children) {
        traverse(child.componentId, depth + 1);
    }
}

console.log("=== Exploring Comp 122 (Skin Color Select) ===");
traverse(122);

console.log("\n=== Exploring Comp 105 & 113 ===");
traverse(105);
traverse(113);
