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
    for (let d = 0; d < 5 && cur; d++) {
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

let count = 0;
for (const comp of comps) {
    if (!comp.scripts) continue;
    for (const [trigger, scriptArgs] of Object.entries(comp.scripts)) {
        const args = scriptArgs as any[];
        if (Array.isArray(args) && args[0] === 7893) {
            console.log(`Comp ${comp.componentId} (trigger=${trigger}):`);
            console.log(`  Args: ${JSON.stringify(args)}`);
            console.log(`  Labels: ${getLabels(comp.componentId).join(' | ')}`);
            count++;
        }
    }
}

console.log(`\nTotal 7893 invocations: ${count}`);

// Also list all scripts triggered on drag or interaction that might be sliders
console.log('\n=== OTHER SLIDER CANDIDATES ===\n');
for (const comp of comps) {
    if (!comp.scripts) continue;
    const dragScripts = comp.scripts.drag || comp.scripts.mousehover;
    if (Array.isArray(dragScripts) && dragScripts.length > 0 && dragScripts[0] !== 7893) {
        const labels = getLabels(comp.componentId);
        if (labels.some(l => l.includes('Nose') || l.includes('Jaw') || l.includes('Eye') || l.includes('Muscle'))) {
            console.log(`Comp ${comp.componentId} Slider candidate (Script ${dragScripts[0]}):`);
            console.log(`  Labels: ${labels.join(' | ')}`);
        }
    }
}
