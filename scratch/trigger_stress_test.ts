import { runStressTest } from '../src/tests/AdversarialStressTest.js';
import { SimulationHarness } from '../src/engines/gameplay/SimulationHarness.js';
import { WorldGroundingLimb } from '../src/limbs/world_grounding/WorldGroundingLimb.js';
import { HexagramManager } from '../src/routing/HexagramManager.js';
import { AIDispatcher } from '../src/api/ai/Dispatcher.js';
import { EntityLimb } from '../src/limbs/technical/EntityLimb.js';
import { SwitchboardLimb } from '../src/monitor/SwitchboardLimb.js';

async function bootstrapAndTest() {
    console.log('--- BOOTSTRAPPING FOR STRESS TEST ---');
    
    // Minimal bootstrap to get singletons ready
    HexagramManager.initializeMock();
    const hexagram = HexagramManager.getInstance();

    const { getDefaultSovereignConfig } = await import('../src/config/SovereignConfig.js');
    const { TernaryRouter } = await import('../src/routing/TernaryRouter.js');
    const { ModelClient } = await import('../src/clients/ModelClient.js');
    const { WorkforceManifest } = await import('../src/routing/WorkforceManifest.js');

    const config = getDefaultSovereignConfig();
    const router = new TernaryRouter(config);
    const client = new ModelClient(config, router);
    const workforce = new WorkforceManifest(config);
    const dispatcher = new AIDispatcher(client, workforce);

    const grounding = WorldGroundingLimb.getInstance();
    const entityLimb = EntityLimb.getInstance();
    const switchboard = SwitchboardLimb.getInstance();
    
    const harness = SimulationHarness.bootstrap(grounding, hexagram, dispatcher, entityLimb, switchboard);
    
    // Create a dummy avatar and state
    const avatar: any = { 
        x: 3200, y: 3200, plane: 0, 
        coord: { x: 3200, y: 3200, plane: 0 },
        metadata: {},
        currentPath: null,
        processTick: async () => {}
    };
    const state: any = {
        tickNumber: 0,
        npcMap: new Map()
    };

    // Add some dummy NPCs for jitter testing
    state.npcMap.set('npc_1', { 
        id: 1, 
        x: 3205, y: 3205, plane: 0, 
        coord: { x: 3205, y: 3205, plane: 0 },
        path: [{ x: 3206, y: 3206, plane: 0 }, { x: 3207, y: 3207, plane: 0 }] 
    });
    state.npcMap.set('npc_2', { 
        id: 2, 
        x: 3195, y: 3195, plane: 0, 
        coord: { x: 3195, y: 3195, plane: 0 },
        path: [{ x: 3196, y: 3196, plane: 0 }, { x: 3197, y: 3197, plane: 0 }]
    });

    // Background Pulse Loop
    let running = true;
    const pulse = async () => {
        if (!running) return;
        try {
            await harness.processTick(state.tickNumber++, state, avatar);
        } catch (e) {}
        setTimeout(pulse, 600);
    };
    pulse();

    // Run the test
    await runStressTest(100);
    
    running = false;
    console.log('--- STRESS TEST COMPLETE ---');
    process.exit(0);
}

bootstrapAndTest().catch(err => {
    console.error(err);
    process.exit(1);
});
