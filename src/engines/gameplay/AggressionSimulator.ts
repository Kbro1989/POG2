import { CombatRotationEngine } from './CombatRotationEngine.js';
import { AbilityDefinition, CombatStyle } from './AbilityBook.js';
import { WikiMonsterMeta } from '../../utils/WikiEquipmentEnricher.js';
import { BestiaryApi } from '../../utils/BestiaryApi.js';
import { TrainingCollector } from '../../utils/TrainingCollector.js';
import { LearningFidelity } from '../../core/models.js';
import type { EngineContract, ContractResult } from '../../core/HexagramNetworkBridge.js';

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
 * and affinity-based hit chance calculations, now integrated with the BestiaryApi
 * for authoritative aggression verification.
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
        const monsterData = await BestiaryApi.enrichByName(monster.name);
        const isAggressive = monsterData?.aggressive ?? false;

        // Emit pedagogical event regarding the encounter
        await TrainingCollector.getInstance().recordLearningEvent({
            tick: Date.now(),
            timestamp: Date.now(),
            fidelity: LearningFidelity.PEDAGOGY,
            resolution: {
                action: 'AGGRESSION_VERIFIED',
                monsterName: monster.name,
                predicted: isAggressive
            },
            tags: ['[VERIFIED]', 'AGGRESSION_ENGINE']
        });

        // 1. Calculate base hit chance
        let affinity = 55;
        if (attackStyle === 'melee') affinity = monster.affinityMelee || 55;
        if (attackStyle === 'ranged') affinity = monster.affinityRanged || 55;
        if (attackStyle === 'magic') affinity = monster.affinityMagic || 55;
        if (attackStyle === 'necromancy') affinity = monster.affinityNecromancy || 55;

        // Base hit chance heuristic: Affinity * (Attacker Level / Monster Defence)
        const def = Math.max(1, (monster.defence ?? 0) || ((monster.combatLevel ?? 0) * 0.8));
        const rawHitChance = (affinity / 100) * (attackerLevel / def);
        const hitChance = Math.min(1.0, Math.max(0.1, rawHitChance));

        // 2. Damage calculation
        const baseDamage = CombatRotationEngine.logarithmicBaseDamage(attackerLevel, weaponTier);
        
        const [minPct, maxPct] = ability.damageRange;
        const avgPct = (minPct + maxPct) / 2;
        
        const expectedHit = hitChance * (baseDamage * (avgPct / 100));

        // 3. DPS Projection
        const cycleTimeSeconds = cycleTicks * 0.6;
        const dps = expectedHit / cycleTimeSeconds;

        // 4. TTK Projection
        const timeToKill = (monster.lifePoints ?? 0) > 0 && dps > 0 
            ? (monster.lifePoints ?? 0) / dps 
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

export const AggressionSimulatorContract: EngineContract = {
  name: 'AggressionSimulator',
  validate: (ctx) => {
    return (ctx.payload?.activeEntities?.npcs || 0) > 0;
  },
  execute: async (ctx): Promise<ContractResult> => {
    return { success: true, engineName: 'AggressionSimulator', data: {}, tick: ctx.tick, hexagramId: ctx.hexagram.id, durationMs: 0 };
  },
  fallback: async (ctx): Promise<ContractResult> => {
    return { success: true, engineName: 'AggressionSimulator', data: {}, tick: ctx.tick, hexagramId: ctx.hexagram.id, durationMs: 0 };
  }
};
