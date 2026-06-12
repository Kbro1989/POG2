import * as fs from 'fs';
import * as path from 'path';

const dump = JSON.parse(fs.readFileSync('D:/POG2/scratch/interface_1420_dump.json', 'utf8'));
const comps: any[] = dump.components || dump;

// Authoritative varbit source: individual per-ID files from sovereign pedagogy
const VARBITS_DIR = 'D:/sovereign/memory/pedagogy/varbits_json';

// Lazy varbit loader — reads from the 60,507-file ground truth on demand
const varbitCache = new Map<number, { varid: number; bits: [number, number] } | null>();
function getVarbit(id: number): { varid: number; bits: [number, number] } | null {
    if (varbitCache.has(id)) return varbitCache.get(id)!;
    const filePath = path.join(VARBITS_DIR, `varbits-${id}.json`);
    try {
        if (!fs.existsSync(filePath)) { varbitCache.set(id, null); return null; }
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (data.varid == null || data.bits == null) { varbitCache.set(id, null); return null; }
        const entry = { varid: data.varid, bits: data.bits as [number, number] };
        varbitCache.set(id, entry);
        return entry;
    } catch { varbitCache.set(id, null); return null; }
}

// Build parent→children and componentId→comp maps
const childMap = new Map<number, any[]>();
const compMap = new Map<number, any>();
for (const comp of comps) {
    compMap.set(comp.componentId, comp);
    if (comp.parentId !== undefined) {
        if (!childMap.has(comp.parentId)) childMap.set(comp.parentId, []);
        childMap.get(comp.parentId)!.push(comp);
    }
}

// Gather text labels at increasing ancestor distances
function getContextLabels(compId: number, maxDepth = 3): string[] {
    const labels: string[] = [];
    let current = compMap.get(compId);
    for (let depth = 0; depth < maxDepth && current; depth++) {
        const parentId = current.parentId;
        if (parentId === undefined) break;
        const siblings = childMap.get(parentId) || [];
        for (const sib of siblings) {
            if (sib.text && sib.text.trim().length > 0) {
                const clean = sib.text.replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').trim();
                if (clean.length > 0 && clean.length < 60) {
                    labels.push(clean);
                }
            }
        }
        current = compMap.get(parentId);
    }
    return [...new Set(labels)];
}

interface MorphMapping {
    varbitId: number;
    width: number;
    maxValue: number;
    varid: number;
    bits: [number, number];
    componentId: number;
    scriptId: number;
    scriptArgs: number[];
    enumArg: number;
    contextLabels: string[];
    semanticName: string; // inferred
}

const mappings: MorphMapping[] = [];

// Scan all components for script load invocations matching the 10896 pattern
// Pattern: [scriptId, COMPONENT_SELF(-2147483645), enumId|(-1), varbitId]
for (const comp of comps) {
    if (!comp.scripts?.load || comp.scripts.load.length < 2) continue;
    
    const scriptId = comp.scripts.load[0];
    const args = comp.scripts.load.slice(1);
    
    // Check for varbit IDs in argument positions
    // The last integer argument that matches a known varbit is likely the varbit reference
    for (let i = args.length - 1; i >= 0; i--) {
        const candidate = args[i];
        if (typeof candidate !== 'number' || candidate < 100 || candidate > 65000) continue;
        
        const meta = getVarbit(candidate);
        if (!meta) continue;
        
        const width = meta.bits[1] - meta.bits[0] + 1;
        const contextLabels = getContextLabels(comp.componentId);
        
        // Infer semantic name from nearby text
        let semanticName = 'unknown';
        const lowerLabels = contextLabels.map(l => l.toLowerCase());
        
        if (lowerLabels.some(l => l.includes('skin') && l.includes('colour'))) semanticName = 'skinTone';
        else if (lowerLabels.some(l => l.includes('skin'))) semanticName = 'skinProperty';
        else if (lowerLabels.some(l => l.includes('hair') && l.includes('style'))) semanticName = 'hairStyle';
        else if (lowerLabels.some(l => l.includes('hair') && l.includes('colour'))) semanticName = 'hairColour';
        else if (lowerLabels.some(l => l.includes('hair'))) semanticName = 'hair';
        else if (lowerLabels.some(l => l.includes('body'))) semanticName = 'bodyType';
        else if (lowerLabels.some(l => l.includes('head'))) semanticName = 'headShape';
        else if (lowerLabels.some(l => l.includes('face'))) semanticName = 'faceShape';
        else if (lowerLabels.some(l => l.includes('jaw'))) semanticName = 'jawWidth';
        else if (lowerLabels.some(l => l.includes('nose'))) semanticName = 'noseBridge';
        else if (lowerLabels.some(l => l.includes('eye'))) semanticName = 'eyeSpacing';
        else if (lowerLabels.some(l => l.includes('muscle'))) semanticName = 'muscleDefinition';
        else if (lowerLabels.some(l => l.includes('gender'))) semanticName = 'gender';
        else if (lowerLabels.some(l => l.includes('appearance'))) semanticName = 'appearance';
        else if (lowerLabels.some(l => l.includes('game mode'))) semanticName = 'gameMode';
        else if (lowerLabels.some(l => l.includes('randomise'))) semanticName = 'randomise';
        else if (lowerLabels.some(l => l.includes('leave') || l.includes('sure'))) semanticName = 'exitConfirm';
        else if (lowerLabels.some(l => l.includes('arm'))) semanticName = 'armType';
        else if (lowerLabels.some(l => l.includes('leg'))) semanticName = 'legType';
        else if (lowerLabels.some(l => l.includes('torso') || l.includes('chest'))) semanticName = 'torsoType';
        else if (lowerLabels.some(l => l.includes('feet') || l.includes('boot'))) semanticName = 'feetType';
        else if (lowerLabels.some(l => l.includes('hand') || l.includes('glove'))) semanticName = 'handsType';
        
        const enumArg = args.length >= 3 ? args[args.length - 2] : -1;
        
        mappings.push({
            varbitId: candidate,
            width,
            maxValue: Math.pow(2, width) - 1,
            varid: meta.varid,
            bits: meta.bits,
            componentId: comp.componentId,
            scriptId,
            scriptArgs: args,
            enumArg,
            contextLabels,
            semanticName
        });
        
        break; // Only take the first valid varbit per component
    }
}

// Deduplicate by varbitId, keeping the one with the best semantic name
const deduped = new Map<number, MorphMapping>();
for (const m of mappings) {
    const existing = deduped.get(m.varbitId);
    if (!existing || (existing.semanticName === 'unknown' && m.semanticName !== 'unknown')) {
        deduped.set(m.varbitId, m);
    }
}

// Output
console.log('=== COMPLETE INTERFACE 1420 MORPHOLOGY MAP ===');
console.log(`Total script-bound varbits found: ${mappings.length}`);
console.log(`Unique varbits: ${deduped.size}\n`);

const named = [...deduped.values()].filter(m => m.semanticName !== 'unknown');
const unnamed = [...deduped.values()].filter(m => m.semanticName === 'unknown');

console.log('--- Named Morphology Varbits ---');
for (const m of named) {
    console.log(`${m.semanticName}: varbit=${m.varbitId} (${m.width}-bit, 0-${m.maxValue}) varp=${m.varid} script=${m.scriptId} comp=${m.componentId}`);
    console.log(`  Labels: ${m.contextLabels.join(' | ')}`);
}

console.log('\n--- Unnamed Varbits (need manual/calibration labeling) ---');
for (const m of unnamed) {
    console.log(`varbit=${m.varbitId} (${m.width}-bit, 0-${m.maxValue}) varp=${m.varid} script=${m.scriptId} comp=${m.componentId}`);
    console.log(`  Labels: ${m.contextLabels.length > 0 ? m.contextLabels.join(' | ') : '(none)'}`);
}

// Write full mapping as JSON
const outputMap: Record<string, any> = {};
for (const [id, m] of deduped) {
    outputMap[id] = {
        semanticName: m.semanticName,
        width: m.width,
        maxValue: m.maxValue,
        varid: m.varid,
        bits: m.bits,
        scriptId: m.scriptId,
        enumArg: m.enumArg,
        componentId: m.componentId,
        contextLabels: m.contextLabels
    };
}

const outPath = 'D:/POG2/scratch/interface_1420_morph_map.json';
fs.writeFileSync(outPath, JSON.stringify(outputMap, null, 2));
console.log(`\nFull map written to: ${outPath}`);
