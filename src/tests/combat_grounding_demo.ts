import { OrchestrateEngine } from '../engines/OrchestrateEngine.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { TemporalHeartbeatLimb } from '../limbs/core/TemporalHeartbeatLimb.js';
import { createLogger } from '../utils/logger.js';
import { getDefaultSovereignConfig } from '../config/SovereignConfig.js';
import { Renderer } from '../ui/Renderer.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';

const logger = createLogger('CombatDemo');

async function runCombatDemo() {
    logger.info('⚔️ INITIATING COMBAT GROUNDING DEMO');

    // 1. Singleton Preparation
    HexagramManager.initializeMock();
    const config = getDefaultSovereignConfig();
    const renderer = new (Renderer as any)(); // Mocking minimal renderer 
    const router = new TernaryRouter(config);
    
    // 2. Engine Boot (Correct Order: config, router, renderer)
    const engine = new OrchestrateEngine(config, router, renderer);
    await engine.initialize();
    
    const gameplay = engine['gameplay'];
    const avatar = gameplay.avatar;
    const state = gameplay.globalState;

    // 3. Load Lumbridge Substrate
    await (engine as any).spatialSovereignty.loadMapsquare(50, 50);
    
    // Position avatar near the general store
    avatar.coord = { x: 3222, y: 3218, plane: 0 };
    avatar.x = 3222;
    avatar.y = 3218;

    // 4. Spawn a Target NPC (Dummy)
    const targetId = 999;
    const targetNPC: any = {
        id: targetId,
        name: 'Training Dummy',
        x: 3224, // 2 tiles away East
        y: 3218,
        plane: 0,
        interactionState: 'IDLE',
        metadata: {}
    };
    state.npcMap.set(targetId, targetNPC);
    state.npcSpatialIndex.set(`3224,3218,0`, [targetNPC]);

    console.log(`--- Avatar at (${avatar.x}, ${avatar.y}) ---`);
    console.log(`--- Target at (${targetNPC.x}, ${targetNPC.y}) - Distance: 2 ---`);

    // 5. Inject Combat Intent (Touch of Death - Range 1)
    // This should trigger "Target out of range -> Plot Path" logic.
    (avatar as any).intent = {
        action: 'castAbility',
        abilityId: '13', // Touch of Death
        range: 1, 
        targetId: `npc_${targetId}`,
        tickStarted: 0,
        contextHash: 'combat_demo'
    };

    console.log('\n--- IGNITING HEARTBEAT (5 PULSES) ---');
    const heartbeat = TemporalHeartbeatLimb.getInstance();

    for (let i = 0; i < 5; i++) {
        console.log(`\n>>> PULSE ${i} <<<`);
        
        // Manual cleanup of hit flash from previous tick
        targetNPC.metadata.hitFlash = false;

        await heartbeat.pulse();
        
        // Check state mutation
        if (avatar.adrenaline! > 0) {
            console.log(`[STATE] Adrenaline: ${avatar.adrenalinePercent} | Necrosis: ${avatar.necrosisStacks}`);
        }
        
        await new Promise(r => setTimeout(r, 100)); // Faster than 600ms for the demo
    }

    console.log('\n--- DEMO COMPLETE ---');
}

runCombatDemo().catch(err => {
    logger.error({ err }, 'Combat Demo CRASHED.');
});
