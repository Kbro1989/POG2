import * as fs from 'fs';
import * as path from 'path';

// Load varbit registry
const varbitRegistry: Record<string, { varid: number; bits: [number, number] }> = 
    JSON.parse(fs.readFileSync('D:/sovereign/cache_pedagogy/json_dumps/varbits_registry_new.json', 'utf8'));

// Helper to decode packed component refs
function decodeComponentRef(packed: number): { interfaceId: number; componentId: number } | null {
    if (packed < 0 || packed > 0x7FFFFFFF) return null;
    const interfaceId = (packed >>> 16) & 0xFFFF;
    const componentId = packed & 0xFFFF;
    if (interfaceId === 0 || interfaceId > 3000) return null;
    return { interfaceId, componentId };
}

// Generalized scanner for any interface dump
function scanInterface(ifaceId: number) {
    const dumpPath = `D:/POG2/scratch/interface_${ifaceId}_dump.json`;
    if (!fs.existsSync(dumpPath)) {
        console.log(`Interface dump ${dumpPath} not found.`);
        return;
    }
    
    const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
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
    
    // Get text labels accessible from a component (siblings + grandparent siblings)
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
    
    interface Invocation {
        compId: number;
        scriptId: number;
        possibleVarbits: number[];
        labels: string[];
    }
    
    const invocations: Invocation[] = [];
    
    for (const comp of comps) {
        // Scripts can be under various triggers like load, hover, click etc. Check all of them.
        if (!comp.scripts) continue;
        for (const [trigger, scriptArgs] of Object.entries(comp.scripts)) {
            const args = scriptArgs as any[];
            if (!args || args.length === 0) continue;
            
            const scriptId = args[0];
            const remainingArgs = args.slice(1);
            
            // Check for valid varbits
            const possibleVarbits = remainingArgs.filter((a: any) => typeof a === 'number' && a > 100 && a < 65000 && !!varbitRegistry[String(a)]);
            
            if (possibleVarbits.length > 0) {
                invocations.push({
                    compId: comp.componentId,
                    scriptId,
                    possibleVarbits,
                    labels: getLabels(comp.componentId)
                });
            }
        }
    }
    
    console.log(`\n=== INTERFACE ${ifaceId} VARBIT → LABEL CORRELATION ===\n`);
    const varbitLabels = new Map<number, Set<string>>();
    for (const inv of invocations) {
        for (const vb of inv.possibleVarbits) {
            if (!varbitLabels.has(vb)) varbitLabels.set(vb, new Set());
            for (const l of inv.labels) varbitLabels.get(vb)!.add(l);
        }
    }
    
    for (const [vb, labels] of [...varbitLabels.entries()].sort((a, b) => a[0] - b[0])) {
        const meta = varbitRegistry[String(vb)];
        const width = meta ? (meta.bits[1] - meta.bits[0] + 1) : '?';
        console.log(`Varbit ${vb} (${width}-bit): ${[...labels].join(' | ')}`);
    }
}

scanInterface(1797);
