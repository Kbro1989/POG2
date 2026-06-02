import { CombatRotationEngine } from './CombatRotationEngine.js';
import { AbilityDefinition, CombatStyle } from './AbilityBook.js';
import { WikiMonsterMeta } from '../../utils/WikiEquipmentEnricher.js';

export interface AggressionProjection {
    hitChance: number;
    expectedHit: number;
    dps: number;
    timeToKill: number;
    recommendedStyle: CombatStyle;
    styleReasoning: string;
}

/**
 * AggressionSimulator
 * 
 * Projects DPS and TTK using the March 2026 logarithmic damage formula
 * and affinity-based hit chance calculations.
 */
export class AggressionSimulator {
    /**
     * Projects DPS and TTK against a specific monster using March 2026 rules.
     */
    public static async projectEncounter(
        attackerLevel: number,
        weaponTier: number,
        attackStyle: CombatStyle,
        monster: WikiMonsterMeta,
        ability: AbilityDefinition,
        cycleTicks: number = 3
    ): Promise<AggressionProjection> {
        // Authoritative aggression lookup using name as identifier
        // Using `any` cast here as the API might need external typing check later if not available in context.
        const monsterData = (await (import('../../utils/BestiaryApi.js')).then(m => m.BestiaryApi.enrichByName(monster.name))) as any;
        const isAggressive = monsterData?.aggressive ?? false;

        // 1. Calculate base hit chance based on monster affinities (March 2026 rules)
        // Affinity ranges from ~40 to 90. 55 is neutral.
        let affinity = 55;
        if (attackStyle === 'melee') affinity = monster.affinityMelee ?? 55;
        if (attackStyle === 'ranged') affinity = monster.affinityRanged ?? 55;
        if (attackStyle === 'magic') affinity = monster.affinityMagic ?? 55;
        if (attackStyle === 'necromancy') affinity = monster.affinityNecromancy ?? 55;

        // Base hit chance heuristic: Affinity * (Attacker Level / Monster Defence)
        const monsterDefence = monster.defence ?? 0;
        const combatLevelMultiplier = (monster.combatLevel ?? 0) * 0.8;
        const def = Math.max(1, monsterDefence || combatLevelMultiplier);
        
        const rawHitChance = (affinity / 100) * (attackerLevel / def);
        const hitChance = Math.min(1.0, Math.max(0.1, rawHitChance));

        // 2. Damage calculation using logarithmic formula (March 2026)
        const baseDamage = CombatRotationEngine.logarithmicBaseDamage(attackerLevel, weaponTier);
        
        // Ability damage bounds
        const [minPct, maxPct] = ability.damageRange;
        const avgPct = (minPct + maxPct) / 2;
        
        // Expected hit per cast (Hit Chance * Average Damage)
        const expectedHit = hitChance * (baseDamage * (avgPct / 100));

        // 3. DPS Projection
        // 1 tick = 0.6s
        const cycleTimeSeconds = cycleTicks * 0.6;
        const dps = expectedHit / cycleTimeSeconds;

        // 4. TTK Projection
        const lifePoints = monster.lifePoints ?? 0;
        const timeToKill = lifePoints > 0 && dps > 0 
            ? lifePoints / dps 
            : 0;

        return {
            hitChance,
            expectedHit,
            dps,
            timeToKill,
            recommendedStyle: attackStyle,
            styleReasoning: `Aggression status: ${isAggressive}`
        };
    }
}


import type { EngineContract, ExecutionContext, ContractResult } from '../../core/HexagramNetworkBridge.js';
export const AggressionSimulatorContract: EngineContract = {
  name: 'AggressionSimulator',
  validate: (ctx) => {
    // Only fire if there are active NPCs in the context
    return (ctx.payload?.activeEntities?.npcs || 0) > 0;
  },
  execute: async (ctx): Promise<ContractResult> => {
    const start = performance.now();
    
    // Extract context variables (defaulting safely)
    const npcLevel = ctx.payload?.npc?.combatLevel || 1;
    const npcHp = ctx.payload?.npc?.hp || 1000;
    const npcMaxHp = ctx.payload?.npc?.maxHp || 1000;
    const npcName = (ctx.payload?.npc?.name || '').toLowerCase();
    const ticksInArea = ctx.payload?.npc?.ticksInArea || 0;
    const lastAttackerId = ctx.payload?.npc?.lastAttackerId;
    
    const playerLevel = ctx.payload?.playerState?.combatLevel || 138;
    
    // 1. Tolerance (10 minutes = 1000 ticks)
    const isTolerant = ticksInArea >= 1000;
    
    // 2. RS3 Combat Level Check
    // Aggressive if NPC level * 2 + 1 >= Player Level
    let wouldAggro = (npcLevel * 2 + 1) >= playerLevel;
    
    // Hexagram Modulation
    let escalationFactor = 1.0;
    let chaosRoll = 0;
    const bottomTrigram = ctx.hexagram.binary.substring(0, 3);
    
    if (bottomTrigram === '100') { // Thunder (growth/action)
        escalationFactor = 0.6; // Faster transitions, lower enrage thresholds
    } else if (bottomTrigram === '010') { // Water (chaos/abyssal)
        chaosRoll = Math.random(); // Erratic behavior
    }
    
    // Aggression Decision Logic
    let decisionAction: 'wander' | 'flee' | 'attack' | 'call_help' = 'wander';
    let newState = 'idle';
    
    // Tolerant Retaliation
    if (isTolerant && lastAttackerId === 'player') {
        wouldAggro = true; // Retaliate even if tolerant
    }
    
    if (wouldAggro && !isTolerant) {
        decisionAction = 'attack';
        newState = 'aggressive';
    }
    
    // Special Behaviors
    const hpPercent = npcHp / Math.max(1, npcMaxHp);
    
    // Ripper demon enrage (<35% HP)
    if (npcName.includes('ripper demon') && hpPercent < (0.35 * escalationFactor)) {
        decisionAction = 'attack';
        newState = 'enraged';
    }
    
    // Feline akh call help (<50% HP)
    if (npcName.includes('feline akh') && hpPercent < (0.5 * escalationFactor)) {
        decisionAction = 'call_help';
        newState = 'aggressive';
    }
    
    // Chaos Modulation (Water)
    if (chaosRoll > 0.8 && decisionAction === 'attack') {
        decisionAction = 'wander'; // Confusion
        newState = 'confused';
    } else if (chaosRoll > 0.9 && decisionAction === 'wander') {
        decisionAction = 'attack'; // Sudden aggro
        newState = 'aggressive';
    }

    return {
      success: true,
      engineName: 'AggressionSimulator',
      hexagramId: ctx.hexagram.id,
      tick: ctx.tick,
      data: {
        decision: {
          action: decisionAction,
          newState: newState
        },
        mechanics: {
          toleranceReached: isTolerant,
          levelCheckPassed: wouldAggro,
          escalationFactor
        }
      },
      durationMs: performance.now() - start
    };
  },
  fallback: async (ctx): Promise<ContractResult> => {
    return {
      success: true,
      engineName: 'AggressionSimulator',
      hexagramId: ctx.hexagram.id,
      tick: ctx.tick,
      data: { 
          decision: { action: 'wander', newState: 'idle' },
          reason: 'fallback' 
      },
      durationMs: 0
    };
  }
};
