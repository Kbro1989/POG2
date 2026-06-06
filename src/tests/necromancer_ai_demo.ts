import { OrchestrateEngine } from '../engines/OrchestrateEngine.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { createLogger } from '../utils/logger.js';
import { getDefaultSovereignConfig } from '../config/SovereignConfig.js';
import { Renderer } from '../ui/Renderer.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { NecromancerBrain } from '../entities/ai/NecromancerBrain.js';
import { SpatialRadarLimb } from '../limbs/spatial/SpatialRadarLimb.js';

const logger = createLogger('NecroDemo');

async function runNecroDemo() {
    logger.info('🕯️ INITIATING NECROMANCER AI GROUNDING DEMO');

    // 1. Engine Setup
    HexagramManager.initializeSimulation();
    const config = getDefaultSovereignConfig();
    const renderer = new (Renderer as any)(); 
    const router = new TernaryRouter(config);
    const engine = new OrchestrateEngine(config, router, renderer);
    await engine.initialize({ diagnosticOnly: true });
    
    const gameplay = engine['gameplay'];
    const radar = SpatialRadarLimb.getInstance();

    // 2. Spawn Necromancer as a "Cognitive Entity"
    const necroId = 555;
    const necro = {
        id: necroId,
        name: 'Necromancer',
        x: 3225, // Distance 7 from player
        y: 3218,
        plane: 0,
        adrenaline: 0,
        necrosisStacks: 0,
        residualSouls: 0,
        lastCombatTick: 0,
        cooldowns: {},
        interactionState: 'IDLE' as any,
        metadata: {}
    };
    
    // Inject Decentralized Brain
    (necro as any).brain = new NecromancerBrain(necro as any);
    
    gameplay.globalState.npcMap.set(necroId, necro as any);
    
    // Position player
    gameplay.avatar.x = 3218;
    gameplay.avatar.y = 3218;
    gameplay.avatar.coord = { x: 3218, y: 3218, plane: 0 };

    logger.info('--- HEARTBEAT START ---');
    
    for (let i = 1; i <= 20; i++) {
        gameplay.processTick();
        
        // Render Output
        console.clear();
        console.log(radar.render(gameplay.globalState, gameplay.avatar, false));
        console.log(`\nAdrenaline: ${necro.adrenaline} | Stacks: ${necro.necrosisStacks} | State: ${necro.interactionState}`);
        
        await new Promise(r => setTimeout(r, 600)); // Real heartbeat timing
    }

    logger.info('--- DEMO COMPLETE ---');
}

runNecroDemo().catch(console.error);

