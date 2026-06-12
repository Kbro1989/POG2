import fs from 'fs';
import { HUDForensicsLimb } from '../src/limbs/spatial/HUDForensicsLimb.js';

async function main() {
    const hud = new HUDForensicsLimb();
    const result = await hud.getInterface(1430);
    if (!result.ok) return;

    const iface = result.value;
    console.log('Interface 1430 - Hotkey Components:');
    
    for (const comp of iface.components) {
        if (comp.text && /^[0-9=\-ZXZ]$/.test(comp.text)) {
            console.log(`Comp ${comp.componentId}: text="${comp.text}" pos=(${comp.baseposx},${comp.baseposy}) size=${comp.basewidth}x${comp.baseheight} parent=${comp.parentId}`);
            // Check siblings or children of this parent
            const siblings = iface.components.filter(c => c.parentId === comp.parentId && c.componentId !== comp.componentId);
            for (const sib of siblings) {
                console.log(`  Sibling ${sib.componentId}: pos=(${sib.baseposx},${sib.baseposy}) size=${sib.basewidth}x${sib.baseheight} scripts=${JSON.stringify(sib.scripts)}`);
            }
        }
    }
}

main();
