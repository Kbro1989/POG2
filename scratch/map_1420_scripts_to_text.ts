import * as fs from 'fs';

const dump = JSON.parse(fs.readFileSync('D:/POG2/scratch/interface_1420_dump.json', 'utf8'));
const comps: any[] = dump.components || dump;

// Build parent→children map
const childMap = new Map<number, any[]>();
for (const comp of comps) {
    if (comp.parentId !== undefined) {
        if (!childMap.has(comp.parentId)) childMap.set(comp.parentId, []);
        childMap.get(comp.parentId)!.push(comp);
    }
}

// Find all script load invocations
console.log('=== Script 10896 invocations with context ===');
for (const comp of comps) {
    if (comp.scripts?.load?.[0] === 10896) {
        const args = comp.scripts.load.slice(1);
        const varbitArg = args[args.length - 1]; // Last arg is typically varbit ID
        
        // Find nearby text labels (siblings with text)
        const siblings = childMap.get(comp.parentId) || [];
        const nearbyTexts = siblings
            .filter((c: any) => c.text && c.text.trim().length > 0)
            .map((c: any) => `  comp${c.componentId}: "${c.text}"`);
        
        // Look at grandparent level too
        const parent = comps.find((c: any) => c.componentId === comp.parentId);
        const grandparentSiblings = parent ? (childMap.get(parent.parentId) || []) : [];
        const gpTexts = grandparentSiblings
            .filter((c: any) => c.text && c.text.trim().length > 0)
            .map((c: any) => `  comp${c.componentId}: "${c.text}"`);
        
        console.log(`\nComp ${comp.componentId} (parent=${comp.parentId}) → varbit ${varbitArg}`);
        console.log(`  Script args: [${args.join(', ')}]`);
        if (nearbyTexts.length) {
            console.log(`  Sibling labels:`);
            nearbyTexts.forEach((t: string) => console.log(`    ${t}`));
        }
        if (gpTexts.length) {
            console.log(`  Grandparent-level labels:`);
            gpTexts.slice(0, 5).forEach((t: string) => console.log(`    ${t}`));
        }
    }
}

// Also find text labels that mention morphology-relevant terms
console.log('\n=== Morphology Text Labels in Interface 1420 ===');
const morphTerms = ['skin', 'colour', 'color', 'hair', 'body', 'face', 'jaw', 'nose', 'muscle', 'appearance', 'head', 'arm', 'leg', 'torso', 'chest', 'shoulder', 'gender', 'male', 'female', 'tone', 'style', 'height', 'weight', 'build'];
for (const comp of comps) {
    if (comp.text && comp.text.trim().length > 0) {
        const lower = comp.text.toLowerCase();
        if (morphTerms.some(t => lower.includes(t))) {
            // Find what script loads nearby
            const siblings = childMap.get(comp.parentId) || [];
            const nearbyScripts = siblings
                .filter((c: any) => c.scripts?.load?.length > 0)
                .map((c: any) => `script ${c.scripts.load[0]} args=[${c.scripts.load.slice(1).join(',')}]`);
            
            console.log(`Comp ${comp.componentId}: "${comp.text}" (parent=${comp.parentId})`);
            if (nearbyScripts.length) {
                nearbyScripts.forEach((s: string) => console.log(`  → ${s}`));
            }
        }
    }
}
