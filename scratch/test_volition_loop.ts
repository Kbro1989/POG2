import { SovereignAvatarEntity } from '../src/core/SovereignAvatar.js';
import { PlayerAgent } from '../src/engines/gameplay/PlayerAgent.js';
import { GhostSplatEngine, GhostSplatField } from '../src/substrates/GhostSplatEngine.js';

async function main() {
    console.log("=== Sovereign Avatar Volition Test (Dynamic) ===");
    
    // 1. Initialize Avatar
    const avatar = new SovereignAvatarEntity('TestAvatar');
    avatar.skills[0] = { id: 0, level: 99, xp: 14000000, name: 'Attack' }; // Attack
    avatar.skills[2] = { id: 2, level: 99, xp: 14000000, name: 'Strength' }; // Strength
    avatar.metadata.combatStyle = 'melee';
    avatar.metadata.combatArchetype = 'aggressive';
    avatar.actionBarSlots = [
        'slice', 'fury', 'cleave', '',
        'assault', 'destroy', '', '',
        'meteor_strike', 'berserk', '', '',
        '', ''
    ];
    
    // 2. Setup event listeners
    avatar.combatEngine.on(event => {
        if (event.type === 'ADRENALINE_CHANGED') {
            console.log(`[Adrenaline] ${event.from / 10}% -> ${event.to / 10}%`);
        } else if (event.type === 'ABILITY_USED') {
            console.log(`[Combat] Executed ${event.ability.name} (Damage: ${event.damage})`);
        } else if (event.type === 'ABILITY_OFF_COOLDOWN') {
            console.log(`[Cooldown] ${event.ability.name} is ready!`);
        }
    });

    const playerAgent = new PlayerAgent(avatar as any);
    let tickCount = 0;

    // Create a mock GhostSplatField with a target
    const field: GhostSplatField = {
        heatmap: new Uint8Array(2500) as any,
        entityHeat: new Uint8Array(2500),
        avatarHeat: new Uint8Array(2500),
        projections: new Map([
            ['mock_npc', { projectedCoord: { x: 3200, y: 3200, plane: 0 }, lastUpdate: 0, opacity: 1 }]
        ]) as any,
        safespots: [],
        tickDepth: 0
    };
    
    // Set target heat so PlayerAgent acquires it
    if (field.entityHeat) {
        field.entityHeat[1250] = 0.9; // High heat at center
    }
    avatar.coord = { x: 3200, y: 3200, plane: 0 };
    avatar.state = { npcMap: new Map([['mock_npc', { id: 'mock_npc', currentHp: 10000 }]]) } as any;
    const bridge = CombatHUDBridge.getInstance();

    function simulateTick() {
        tickCount++;
        // 1. Tick the Adrenaline State Machine (handles regen & cooldowns)
        avatar.combatEngine.tick();
        
        // Synchronize avatar state for CombatRotationEngine
        avatar.adrenaline = (avatar.combatEngine as any).currentState.adrenaline;
        
        const cooldownMap: Record<string, number> = {};
        for (const slot of (avatar.combatEngine as any).slotStates) {
            if (slot.ability && slot.cooldownTicksRemaining > 0) {
                cooldownMap[slot.ability.id.toLowerCase()] = tickCount + slot.cooldownTicksRemaining;
            }
        }
        avatar.cooldowns = cooldownMap;
        
        // 2. Evaluate Intents Dynamically
        const intent = playerAgent.evaluateCombatRotation(field, tickCount);
        
        if (intent && intent.action === 'execute_ability') {
            console.log(`\n[Tick ${tickCount}] Volition selected: ${intent.abilityName}`);
            
            // Actually use the ability in the state machine
            const abilityId = intent.abilityId;
            const slotIdx = avatar.actionBarSlots.indexOf(abilityId);
            if (slotIdx !== -1) {
                const damage = avatar.combatEngine.useAbility(slotIdx);
                if (damage !== null) {
                    console.log(`[Tick ${tickCount}] HIT SPLAT on ${intent.targetId}: ${damage}`);
                    // Broadcast hitsplat to HUD
                    bridge.hitsplat(damage, damage > 100 ? 'CRIT' : 'DAMAGE', intent.targetId);
                } else {
                    console.log(`[Tick ${tickCount}] Ability blocked by state machine (Adrenaline/Cooldown).`);
                }
            }
        } else {
            // console.log(`[Tick ${tickCount}] Waiting...`);
        }
    }

    // --- The Simulation Loop ---
    console.log("\nStarting 1000-tick persistent simulation...");
    const interval = setInterval(() => {
        simulateTick();
        if (tickCount >= 1000) clearInterval(interval);
    }, 600); // 1 RS tick = 600ms
}

import { CombatHUDBridge } from '../src/utils/CombatHUDBridge.js';
main().catch(console.error);
