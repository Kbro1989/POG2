import { GameState, SovereignAvatar } from '../src/core/models.js';
import { InteractionGateway } from '../src/limbs/logical/InteractionGateway.js';
import { VarbitSovereigntyLimb } from '../src/limbs/spatial/VarbitSovereigntyLimb.js';

async function testSearchIntent() {
    console.log('[Test] Initializing test state...');
    
    // Create a mock state
    const state: GameState = {
        tickNumber: 1,
        npcMap: new Map(),
        objectMap: new Map(),
        groundItems: new Map(),
        varbits: new Map()
    };
    
    // Create a mock avatar
    const avatar: SovereignAvatar = {
        id: 'player_sovereign',
        name: 'Sovereign',
        coord: { x: 3200, y: 3200, plane: 0 },
        interactionState: 'IDLE',
        intent: {
            action: 'SEARCH',
            query: 'abyssal whip'
        },
        metadata: {}
    } as any;

    const gateway = new InteractionGateway();
    
    console.log('[Test] Triggering evaluateInteraction with UI component 703:50 (Grand Exchange Search)...');
    
    // Trigger interaction
    const events = await gateway.evaluateInteraction(avatar, 'SEARCH', 'ui_703:50', state, null);
    
    console.log('[Test] Interaction Gateway Events:');
    events.forEach(e => console.log(e));
    
    // Check Varbit
    const searchVarbitId = 28556;
    const varbitLimb = VarbitSovereigntyLimb.getInstance();
    const varbitVal = varbitLimb.resolveVarbitValue(searchVarbitId, state);
    
    console.log(`\n[Test] Varbit 28556 (Search State) = ${varbitVal}`);
    console.log(`[Test] Avatar Metadata:`, avatar.metadata);
    
    if (varbitVal === 1 && avatar.metadata.activeSearchQuery === 'abyssal whip') {
        console.log('\n[Test] SUCCESS: Search Intent properly mapped to Varbit 28556 and Avatar metadata.');
    } else {
        console.log('\n[Test] FAILED: State was not correctly updated.');
    }
}

testSearchIntent().catch(console.error);
