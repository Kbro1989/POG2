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

// Get ALL text labels accessible from a component (siblings + grandparent siblings)
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

// Find ALL components with script load triggers and extract varbit-like args
console.log('=== ALL SCRIPT LOAD INVOCATIONS IN INTERFACE 1420 ===\n');

interface Invocation {
    compId: number;
    parentId: number;
    scriptId: number;
    allArgs: number[];
    possibleVarbits: number[];
    labels: string[];
}

const invocations: Invocation[] = [];

for (const comp of comps) {
    if (!comp.scripts?.load || comp.scripts.load.length === 0) continue;
    const scriptId = comp.scripts.load[0];
    const allArgs = comp.scripts.load.slice(1) as number[];
    
    // Any arg > 100 that isn't negative (COMPONENT_SELF sentinel) could be a varbit
    const possibleVarbits = allArgs.filter((a: number) => typeof a === 'number' && a > 100 && a < 100000);
    const labels = getLabels(comp.componentId);
    
    invocations.push({
        compId: comp.componentId,
        parentId: comp.parentId,
        scriptId,
        allArgs,
        possibleVarbits,
        labels
    });
}

// Group by scriptId
const byScript = new Map<number, Invocation[]>();
for (const inv of invocations) {
    if (!byScript.has(inv.scriptId)) byScript.set(inv.scriptId, []);
    byScript.get(inv.scriptId)!.push(inv);
}

for (const [scriptId, invs] of [...byScript.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`\nScript ${scriptId} (${invs.length} invocations):`);
    for (const inv of invs) {
        const varbits = inv.possibleVarbits.length > 0 ? `varbits=[${inv.possibleVarbits.join(',')}]` : '';
        const labelStr = inv.labels.length > 0 ? `labels=[${inv.labels.slice(0, 3).join(' | ')}]` : '';
        console.log(`  comp=${inv.compId} parent=${inv.parentId} args=[${inv.allArgs.join(',')}] ${varbits} ${labelStr}`);
    }
}

// Summary: unique varbit candidates with their text context
console.log('\n\n=== VARBIT → LABEL CORRELATION ===\n');
const varbitLabels = new Map<number, Set<string>>();
for (const inv of invocations) {
    for (const vb of inv.possibleVarbits) {
        if (!varbitLabels.has(vb)) varbitLabels.set(vb, new Set());
        for (const l of inv.labels) varbitLabels.get(vb)!.add(l);
    }
}

for (const [vb, labels] of [...varbitLabels.entries()].sort((a, b) => a[0] - b[0])) {
    console.log(`Varbit ${vb}: ${[...labels].join(' | ')}`);
}
