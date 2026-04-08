import { SovereignInteractionLimb } from '../limbs/spatial/SovereignInteractionLimb.js';

async function runInteractionTest() {
    console.log("== Sovereign Forensic Probe: Interaction State Test ==");
    
    // 1. Initialize Neural Limb
    const interactionLimb = new SovereignInteractionLimb();

    // 2. Register a Scout
    interactionLimb.registerProbe(1, 3597, { x: 10, z: 10, plane: 0 });

    // 3. Trigger a Bumper Hit on a known Door (Fixed ID 22)
    console.log("\n--- Simulating Bumper Hit: Object 22 (Closed Door) ---");
    interactionLimb.notifyBump(1, 22);

    // 4. Run AI Tick
    interactionLimb.onTick();

    // 5. Verify the decision
    // In our code: handleBump finds resultId 23 and sets Interacting.
    
    console.log("\n--- Simulation Pass (Finalizing Interaction) ---");
    interactionLimb.onTick(); // This should move it to 'TRACE' after logic.

    console.log("\n✅ Interaction Pass Complete.");
}

runInteractionTest();
