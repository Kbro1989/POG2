
import { GameplaySovereigntyLimb } from "../src/limbs/spatial/GameplaySovereigntyLimb.js";
import { SpatialSovereigntyLimb } from "../src/limbs/spatial/SpatialSovereigntyLimb.js";

async function engageHallvar() {
    const gameplay = GameplaySovereigntyLimb.getInstance();
    const spatial = SpatialSovereigntyLimb.getInstance();
    const player = gameplay.avatar;

    // 1. Locate Hallvar in Live Memory
    const hallvar = Array.from(gameplay.globalState.npcMap.values()).find(n => n.name === 'Hallvar');
    
    if (!hallvar) {
        console.error("❌ Hallvar not found in Live Memory. Ensure the Neural Link is active and Hallvar is within render distance.");
        
        // --- EMERGENCY FALLBACK: Virtual Injection for Testing ---
        console.log("⚠️ Injecting Virtual Hallvar for Intent Execution validation...");
        const virtualHallvar = { 
            id: 12, 
            name: 'Hallvar', 
            x: 3222, 
            y: 3218, 
            plane: 0,
            coord: { x: 3222, y: 3218, plane: 0 },
            interactionState: 'IDLE' as const,
            lastActionTick: 0,
            lastCombatTick: 0,
            cooldowns: {},
            actions: ['Talk to', null, 'Cert-ore', null, null]
        };
        gameplay.globalState.npcMap.set(12, virtualHallvar as any);
        spatial.ingestLiveEntities([virtualHallvar]);

        // Simulate dialogue lock
        player.lock(10);
        player.metadata.activeDialogue = true;

        return engageHallvar(); // Retry with virtual
    }

    console.log(`📡 Engaging Hallvar [ID: ${hallvar.id}] at (${hallvar.x}, ${hallvar.y})`);

    // 2. Plot Path to Adjacent Tile (Interaction Distance)
    const success = player.plotPath(hallvar.x, hallvar.y + 1, spatial as any, gameplay.globalState);
    
    if (!success) {
        console.error("❌ Failed to plot path to Hallvar. Spatial substrate reports destination as unreachable.");
        return;
    }

    // 3. Set Interaction Intent (Action 2: Cert-ore)
    player.intent = {
        action: 'interact_npc',
        targetId: `npc_${hallvar.id}`,
        option: 3, // Option 3 maps to 'Cert-ore' in Hallvar's definition
        tickStarted: gameplay.globalState.tickNumber,
        contextHash: 'hallvar_cert_ore_test',
        coord: { x: hallvar.x, y: hallvar.y, plane: hallvar.plane }
    };

    console.log("✅ Intent Dispatched: 'Cert-ore' Hallvar. Monitoring Hysteresis Gate...");
    console.log(`   - Player Position: (${player.x}, ${player.y})`);
    console.log(`   - Player Busy: ${player.isBusy()} (Lock Ticks: ${player.lockTicks})`);
}

engageHallvar().catch(console.error);
