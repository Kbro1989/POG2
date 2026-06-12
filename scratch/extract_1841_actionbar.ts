import * as fs from 'fs';
import { HUDForensicsLimb } from '../src/limbs/spatial/HUDForensicsLimb.js';

async function extractActionBar() {
    console.log('=== INTERFACE 1841 (ACTION BAR) EXTRACTION ===\n');
    
    const hud = new HUDForensicsLimb();
    const result = await hud.getInterface(1841);
    
    if (!result.ok) {
        console.error('Failed to extract interface 1841:', result.error.message);
        return;
    }
    
    const iface = result.value;
    const { components } = iface;
    
    console.log(`Total components: ${components.length}`);
    
    // Find Action Bar script invocations (10896 or similar)
    console.log('\n--- Script Invocations (Potential Slots) ---');
    for (const comp of components) {
        if (!comp.scripts) continue;
        for (const [trigger, args] of Object.entries(comp.scripts)) {
            if (!args || !Array.isArray(args) || args.length === 0) continue;
            const scriptId = args[0];
            if (scriptId === 10896 || scriptId === 10496 || scriptId === 13138 || scriptId === 13133) {
                 console.log(`  Comp ${comp.componentId} [${trigger}]: script=${scriptId} args=[${args.join(',')}]`);
            }
        }
    }
    
    const outPath = 'D:/POG2/scratch/interface_1841_actionbar.json';
    fs.writeFileSync(outPath, JSON.stringify({ interfaceId: 1841, components, textLabels: iface.textLabels }, null, 2));
    console.log(`\nFull decode saved to: ${outPath}`);
}

extractActionBar().catch(console.error);
