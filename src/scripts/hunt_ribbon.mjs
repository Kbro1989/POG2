import { HUDForensicsLimb } from '../limbs/spatial/HUDForensicsLimb.js';

async function huntRibbon() {
    console.log("Initializing HUDForensicsLimb...");
    const limb = new HUDForensicsLimb();
    const probe = limb.healthCheck();
    console.log("HUD Forensics Limb Health:", probe);
    
    if (!probe.online) return;

    // Search specifically for ribbon options
    console.log("Hunting for 'Adventures' or 'Hero' in interfaces...");
    const res = await limb.searchInterfaces('Adventures', 200);

    if (res.ok) {
        for (const iface of res.value) {
            const labels = iface.textLabels.join(" ").toLowerCase();
            
            // Check for Ribbon-specific labels
            if (labels.includes("hero") && labels.includes("powers")) {
                console.log(`\n\n=== JACKPOT: Ribbon Candidate Interface ID ${iface.interfaceId} ===`);
                
                const ribbonKeys = ["hero", "customisations", "adventures", "powers", "community", "options", "runemetrics"];
                
                const ribbonComponents = iface.components.filter(c => c.text || c.spriteId);
                for (const comp of ribbonComponents) {
                    if (comp.text && ribbonKeys.some(k => comp.text.toLowerCase().includes(k))) {
                        console.log(`Comp ID ${comp.componentId}: Text: [${comp.text}], Sprite ID: ${comp.spriteId}`);
                    }
                }
            }
        }
        console.log("Scan complete.");
    } else {
        console.error("Search failed:", res.error);
    }
}

huntRibbon();
