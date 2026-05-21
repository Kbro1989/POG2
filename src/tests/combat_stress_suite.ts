import { SovereignAvatarEntity } from '../core/SovereignAvatar.js';
import { PlayerAgent } from '../engines/gameplay/PlayerAgent.js';
import { GhostSplatField } from '../substrates/GhostSplatEngine.js';
import { CombatHUDBridge } from '../utils/CombatHUDBridge.js';
import { PVMERotationLimb } from '../limbs/gameplay/PVMERotationLimb.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('StressTestSuite');

async function runStressTest() {
    console.log("\n🚀 INITIALIZING COMBAT SUBSTRATE STRESS SUITE [MAY 2026]\n");

    const PADDED_SIZE = 66;
    const avatar = new SovereignAvatarEntity('StressTestAvatar');
    avatar.metadata.combatStyle = 'ranged';
    avatar.metadata.combatArchetype = 'aggressive';
    // March 2026 Ranged Abilities
    avatar.actionBarSlots = ['galeshot', 'ricochet', 'piercing shot', 'snipe', 'snap shot', 'rapid fire', 'deadshot'];
    
    // Place avatar near Nex (within ranged distance of 7 tiles)
    avatar.coord = { x: 3200, y: 3205, plane: 0 };
    avatar.x = 3200;
    avatar.y = 3205;

    const playerAgent = new PlayerAgent(avatar as any);
    const pvme = PVMERotationLimb.getInstance();
    let tickCount = 0;

    // Build a GhostSplat field with a seeded Nex projection so resolveTargetFromHeat can find it
    const entityHeat = new Uint8Array(PADDED_SIZE * PADDED_SIZE);
    const projections = new Map();
    
    // Nex projection: 5 tiles south of avatar (within ranged range of 7)
    const nexCoord = { x: 3200, y: 3200, plane: 0 };
    projections.set('nex', {
        entityId: 'nex',
        projectedCoord: nexCoord,
        ticksAhead: 1,
        confidence: 1.0,
        source: 'path_queue'
    });
    
    // Seed entityHeat at Nex's local position relative to avatar
    const localX = nexCoord.x - avatar.coord.x + Math.floor(PADDED_SIZE / 2); // 33 - 0 = 33
    const localY = nexCoord.y - avatar.coord.y + Math.floor(PADDED_SIZE / 2); // 33 - 5 = 28
    if (localX >= 0 && localX < PADDED_SIZE && localY >= 0 && localY < PADDED_SIZE) {
        entityHeat[localY * PADDED_SIZE + localX] = 10;
    }

    const field: GhostSplatField = {
        heatmap: new Uint8Array(PADDED_SIZE * PADDED_SIZE),
        entityHeat,
        avatarHeat: new Uint8Array(PADDED_SIZE * PADDED_SIZE),
        projections: projections as any,
        safespots: [],
        tickDepth: 1
    };

    console.log(`[Diagnostic] Loaded Bosses: ${Array.from((pvme as any).bossData.keys()).join(', ')}`);

    // --- SCENARIO 1: Shadow Phase Tagging ---
    console.log("--- SCENARIO 1: Shadow Phase Tagging ---");
    // Mock Nex and Minions
    avatar.state = {
        messages: [],
        npcMap: new Map([
            ['nex', { id: 'nex', name: 'Nex', currentHp: 150000, coord: { x: 3200, y: 3200, plane: 0 } }],
            ['fumus', { id: 'fumus', name: 'Fumus', currentHp: 10000, coord: { x: 3210, y: 3210, plane: 0 } }]
        ])
    } as any;
    avatar.metadata.activeTargetId = 'nex';

    // Force rotation to a state that includes "Tag Fumus" 
    pvme.setPhase('nex', 'Shadow Phase'); 
    
    // Evaluate
    let intent = playerAgent.evaluateCombatRotation(field, tickCount);
    console.log(`[Result] Intent: ${intent?.action} | Target: ${intent?.action === 'switch_target' ? intent.targetId : 'N/A'}`);
    if (intent?.action === 'switch_target' && intent.targetId === 'fumus') {
        console.log("✅ SUCCESS: Agent identified 'Tag Fumus' and switched target.");
    } else {
        console.log("❌ FAILURE: Agent failed to resolve minion switch.");
    }

    // --- SCENARIO 2: Blood Phase Siphon (Chat Buffer) ---
    console.log("\n--- SCENARIO 2: Blood Phase Siphon Trigger ---");
    (avatar.state as any).messages = ["I will siphon your energy!"];
    (avatar.state as any).npcMap.set('nex', { id: 'nex', name: 'Nex', currentHp: 120000, coord: { x: 3200, y: 3200, plane: 0 } });
    
    intent = playerAgent.evaluateCombatRotation(field, ++tickCount);
    const activeRot = pvme.getActiveRotationLabel('nex');
    console.log(`[Result] Active Phase: ${activeRot}`);
    if (activeRot?.toLowerCase().includes('blood')) {
        console.log("✅ SUCCESS: Agent detected Siphon chat and synchronized Blood Phase rotation.");
    } else {
        console.log("❌ FAILURE: Phase transition desync.");
    }

    // --- SCENARIO 3: Adrenaline Starvation (Build Phase) ---
    console.log("\n--- SCENARIO 3: Adrenaline Starvation Fallback ---");
    // Force a threshold to be next
    // Adrenaline at 0
    (avatar.combatEngine as any).currentState.adrenaline = 0;
    avatar.adrenaline = 0;
    
    intent = playerAgent.evaluateCombatRotation(field, ++tickCount);
    const abilityName = intent?.action === 'execute_ability' ? intent.abilityName : 'N/A';
    const contextHash = intent?.action === 'execute_ability' ? intent.contextHash : 'N/A';
    console.log(`[Result] Intent: ${intent?.action} | Ability: ${abilityName} | Context: ${contextHash}`);
    if (contextHash === 'pvme_build_phase') {
        console.log("✅ SUCCESS: Adrenaline low. Agent executed filler basic (Style-Locked).");
    } else {
        console.log("❌ FAILURE: Agent stalled or skipped sequence.");
    }

    // --- SCENARIO 4: Cooldown Desync (Peek-Validate-Consume) ---
    console.log("\n--- SCENARIO 4: Cooldown Desync Handling ---");
    // Mock a basic ability on cooldown
    const nextAb = pvme.peekNextAbility('nex', 'Nex');
    if (nextAb) {
        console.log(`Next in rotation: ${nextAb.name}`);
        // Let's force it on cooldown
        avatar.cooldowns[nextAb.name.toLowerCase()] = tickCount + 10;
        
        intent = playerAgent.evaluateCombatRotation(field, ++tickCount);
        const nextAbilityName = intent?.action === 'execute_ability' ? intent.abilityName : 'N/A';
        console.log(`[Result] Intent Ability: ${nextAbilityName}`);
    }

    console.log("\n=== STRESS SUITE COMPLETE ===\n");
}

runStressTest().catch(console.error);
