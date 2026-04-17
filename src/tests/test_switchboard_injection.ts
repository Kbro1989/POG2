import { SovereignAvatarEntity } from '../core/SovereignAvatar.js';
import { SimulationHarness } from '../engines/gameplay/SimulationHarness.js';
import { WorldGroundingLimb } from '../limbs/world_grounding/WorldGroundingLimb.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { AIDispatcher } from '../api/ai/Dispatcher.js';
import { EntityLimb } from '../limbs/technical/EntityLimb.js';
import { SwitchboardLimb } from '../monitor/SwitchboardLimb.js';

async function runTest() {
    console.log('[SIMULATION] Starting Phase 12: Switchboard Injection Test...');

    // 1. Setup minimal substrate
    const avatar = new SovereignAvatarEntity('Admin');
    const switchboard = SwitchboardLimb.getInstance();
    switchboard.initialize();

    // Mock dependencies
    const grounding = WorldGroundingLimb.getInstance();
    HexagramManager.initializeMock();
    const hexagram = HexagramManager.getInstance();
    const dispatcher = {} as AIDispatcher;
    const entityLimb = EntityLimb.getInstance();

    const harness = new SimulationHarness(grounding, hexagram, dispatcher, entityLimb, switchboard);

    // 2. Inject Command into Switchboard (As if via WebSocket)
    console.log('\n[INJECT] Sending ADMIN_COMMAND (VARP 100 -> 99) to Switchboard...');
    switchboard.pushAdminCommand({
        type: 'VARP',
        metadata: { id: 100, value: 99 }
    });

    // 3. Verify queue state before tick
    console.log(`[QUEUE] Current pending commands: ${switchboard.getAdminQueue().length}`);

    // 4. Trigger Heartbeat (Tick 1)
    console.log('\n[HEARTBEAT] Triggering 600ms Tick 1...');
    await harness.processTick(1, avatar.state, avatar);

    // 5. Assertions
    const finalValue = avatar.state.varps.get(100);
    console.log(`➡️ GameState Varp 100: ${finalValue} (Expected: 99)`);

    if (finalValue === 99) {
        console.log('\n[SUCCESS] Phase 12: Switchboard Tick-Synchronized Injection Verified.');
    } else {
        console.error('\n[FAILURE] Varp state mismatch!');
        process.exit(1);
    }

    // 6. Test Secondary command (REGION)
    console.log('\n[INJECT] Sending REGION (rx: 50, ry: 50) update...');
    switchboard.pushAdminCommand({
        type: 'REGION',
        metadata: { rx: 50, ry: 50 }
    });

    await harness.processTick(2, avatar.state, avatar);
    console.log(`➡️ Avatar Coordinates: [${avatar.x}, ${avatar.y}] (Expected: [3200, 3200])`);

    if (avatar.x === 3200 && avatar.y === 3200) {
        console.log('[SUCCESS] Administrative Region Rebuild Verified.');
    } else {
        console.error('[FAILURE] Region rebuild did not update avatar position.');
        process.exit(1);
    }
}

runTest().catch(err => {
    console.error(err);
    process.exit(1);
});
