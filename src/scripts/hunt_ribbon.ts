import { HUDForensicsLimb } from '../limbs/spatial/HUDForensicsLimb.js';

// Suppress console.error and console.log except ours
const ogError = console.error;
const ogLog = console.log;
console.error = () => {};
console.log = () => {};

async function huntRibbon() {
    ogLog("Initializing HUDForensicsLimb...");
    const limb = new HUDForensicsLimb();
    
    ogLog("Hunting for 'hero', 'powers', 'adventures' in interfaces...");
    // Let's just scan 0-2000 silently
    for (let i = 1400; i < 1500; i++) {
        // RS3 main interfaces are usually in the 1400s (e.g. 1430 = ribbon maybe?)
        // Let's just do 1400 to 1500 for a quick check. If not, 1400-1600.
    }
    
    for (let id = 0; id <= 2000; id++) {
        try {
            const res = await limb.getInterface(id);
            if (res.ok) {
                const iface = res.value;
                const labels = iface.textLabels.join(" ").toLowerCase();
                
                if (labels.includes("hero") && labels.includes("adventures") && labels.includes("powers")) {
                    ogLog(`\n\n=== JACKPOT: Ribbon Candidate Interface ID ${iface.interfaceId} ===`);
                    
                    const ribbonKeys = ["hero", "customisations", "adventures", "powers", "community", "options", "runemetrics"];
                    
                    const ribbonComponents = iface.components.filter(c => c.text || c.spriteId);
                    for (const comp of ribbonComponents) {
                        if (comp.text && ribbonKeys.some(k => comp.text?.toLowerCase().includes(k))) {
                            ogLog(`Comp ID ${comp.componentId}: Text: [${comp.text}], Sprite ID: ${comp.spriteId}`);
                        }
                    }
                    break; // stop when found!
                }
            }
        } catch { }
        if (id % 100 === 0) ogLog(`Scanned ${id}/2000...`);
    }
    ogLog("Scan complete.");
}

huntRibbon();

