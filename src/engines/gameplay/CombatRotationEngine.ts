/**
 * CombatRotationEngine.ts
 * 
 * Archetype-driven combat rotation evaluator.
 * Given a combatant's state + target, returns the optimal next ability.
 * 
 * Constraint pipeline per ability:
 *  1. Is target in range? (Chebyshev distance)
 *  2. Is ability off cooldown? (per-ability CD + GCD)
 *  3. Does attacker have enough adrenaline?
 *  4. Is attacker locked? (channeling)
 *  5. Is target stun-immune? (prevents wasted stun GCDs)
 * 
 * Archetype priority chains:
 *  - aggressive: Ultimate → Threshold → Basic
 *  - methodical: Debuff → Threshold → Basic
 *  - cowardly:   Defensive ultimate → Defensive threshold → Basic → (flee)
 *  - predator:   Stun → Channeled threshold → Basic
 */

import { AbilityBook, AbilityDefinition, CombatStyle } from './AbilityBook.js';
import { Coord, CombatantState } from '../../core/models.js';
import { GhostSplatField } from '../../substrates/GhostSplatEngine.js';
import { PADDED_SIZE } from '../../limbs/spatial/SpatialSovereigntyLimb.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('CombatRotationEngine');

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export type TacticalArchetype = 'aggressive' | 'methodical' | 'cowardly' | 'predator';

export interface CombatEvaluationContext {
    /** The attacker's combatant state */
    adrenaline: number;           // 0–10000
    cooldowns: Record<string, number>;
    coord: Coord;
    currentTick: number;
    /** GCD end tick — no ability can fire before this */
    gcdEndTick: number;
    /** Channel end tick — attacker is locked if currentTick < channelEndTick */
    channelEndTick: number;
    /** Currently equipped combat style */
    combatStyle: CombatStyle;
    /** Archetype driving priority chain */
    archetype: TacticalArchetype;
}

export interface TargetContext {
    entityId: string;
    coord: Coord;
    currentHp: number;
    /** Stun immunity end tick — stun abilities wasted if currentTick < this */
    stunImmunityEndTick: number;
}

export interface CombatIntent {
    action: 'execute_ability';
    abilityId: string;
    abilityName: string;
    targetId: string;
    tickStarted: number;
    contextHash: string;
    coord?: Coord;  // target coord for ranged/magic
}

// ═══════════════════════════════════════════════════════
// Chebyshev Distance (RS3 attack range uses this)
// ═══════════════════════════════════════════════════════

function chebyshevDistance(a: Coord, b: Coord): number {
    return Math.max(Math.abs(a.x - b.x), Math.abs(a.y - b.y));
}

// ═══════════════════════════════════════════════════════
// CombatRotationEngine
// ═══════════════════════════════════════════════════════

export class CombatRotationEngine {
    private static instance: CombatRotationEngine;
    private book: AbilityBook;

    private constructor() {
        this.book = AbilityBook.getInstance();
    }

    public static getInstance(): CombatRotationEngine {
        if (!CombatRotationEngine.instance) {
            CombatRotationEngine.instance = new CombatRotationEngine();
        }
        return CombatRotationEngine.instance;
    }

    /**
     * Evaluate the optimal next ability given the attacker's state and a target.
     * Returns null if no valid ability can fire this tick (GCD, channel lock, no target, etc.)
     */
    public evaluateRotation(
        ctx: CombatEvaluationContext,
        target: TargetContext
    ): CombatIntent | null {
        // Gate 1: Channel lock
        if (ctx.currentTick < ctx.channelEndTick) {
            return null;
        }

        // Gate 2: Global cooldown
        if (ctx.currentTick < ctx.gcdEndTick) {
            return null;
        }

        // Gate 3: Target alive
        if (target.currentHp <= 0) {
            return null;
        }

        // Get prioritized ability list based on archetype
        const candidates = this.buildPriorityList(ctx, target);

        // Evaluate each candidate through the constraint pipeline
        for (const ability of candidates) {
            if (this.passesConstraints(ability, ctx, target)) {
                return {
                    action: 'execute_ability',
                    abilityId: ability.id,
                    abilityName: ability.name,
                    targetId: target.entityId,
                    tickStarted: ctx.currentTick,
                    contextHash: `${ability.type}_${ability.style}`,
                    coord: target.coord,
                };
            }
        }

        return null;
    }

    /**
     * Resolve the highest-threat target from the GhostSplat field.
     * Returns the entity projection that generated the most heat within attack range.
     */
    public resolveTargetFromHeat(
        field: GhostSplatField,
        selfCoord: Coord,
        maxRange: number,
        isPlayer: boolean
    ): TargetContext | null {
        // Player reads entityHeat (NPC threats), NPC reads avatarHeat (player threats)
        const heatMap = isPlayer ? field.entityHeat : field.avatarHeat;
        if (!heatMap) return null;

        let bestProjection: { entityId: string; coord: Coord; heat: number } | null = null;

        for (const [entityId, ghosts] of field.projections) {
            // Skip self-projections
            if (isPlayer && entityId === 'player_sovereign') continue;
            if (!isPlayer && entityId !== 'player_sovereign') continue;

            for (const ghost of ghosts) {
                const dist = chebyshevDistance(selfCoord, ghost.projectedCoord);
                if (dist > maxRange) continue;

                // Sample heat at ghost's projected coord
                const localX = ghost.projectedCoord.x - selfCoord.x + Math.floor(PADDED_SIZE / 2);
                const localY = ghost.projectedCoord.y - selfCoord.y + Math.floor(PADDED_SIZE / 2);

                if (localX < 0 || localX >= PADDED_SIZE || localY < 0 || localY >= PADDED_SIZE) continue;

                const heatIdx = localY * PADDED_SIZE + localX;
                const heat = heatMap[heatIdx] || 0;

                if (!bestProjection || heat > bestProjection.heat) {
                    bestProjection = {
                        entityId,
                        coord: ghost.projectedCoord,
                        heat
                    };
                }
            }
        }

        if (!bestProjection) return null;

        return {
            entityId: bestProjection.entityId,
            coord: bestProjection.coord,
            currentHp: 1000, // Default; overridden by live NPC state when available
            stunImmunityEndTick: 0,
        };
    }

    // ═══════════════════════════════════════════════════════
    // Priority List Builders (per archetype)
    // ═══════════════════════════════════════════════════════

    private buildPriorityList(ctx: CombatEvaluationContext, target: TargetContext): AbilityDefinition[] {
        switch (ctx.archetype) {
            case 'aggressive':
                return this.buildAggressiveList(ctx);
            case 'methodical':
                return this.buildMethodicalList(ctx);
            case 'cowardly':
                return this.buildCowardlyList(ctx);
            case 'predator':
                return this.buildPredatorList(ctx, target);
            default:
                return this.buildAggressiveList(ctx);
        }
    }

    /**
     * aggressive: Ultimate (if 100%) → Threshold (if 50%) → Basic
     * Dumps adrenaline as fast as possible into highest-damage abilities.
     */
    private buildAggressiveList(ctx: CombatEvaluationContext): AbilityDefinition[] {
        const ults = this.book.getUltimates(ctx.combatStyle);
        const thresholds = this.book.getThresholds(ctx.combatStyle);
        const basics = this.book.getBasics(ctx.combatStyle);

        return [...ults, ...thresholds, ...basics];
    }

    /**
     * methodical: Debuff first → Threshold → Basic
     * Applies debuffs/vulnerability before damage, respects all cooldowns.
     */
    private buildMethodicalList(ctx: CombatEvaluationContext): AbilityDefinition[] {
        const all = [...this.book.getByStyle(ctx.combatStyle)];
        
        // Debuffs first
        const debuffs = all.filter(a => a.flags.includes('debuff'));
        const thresholds = all.filter(a => a.type === 'threshold' && !a.flags.includes('debuff'));
        const basics = all.filter(a => a.type === 'basic' && !a.flags.includes('debuff'));
        const ults = all.filter(a => a.type === 'ultimate');

        return [...debuffs, ...thresholds, ...basics, ...ults];
    }

    /**
     * cowardly: Defensive ultimate → Defensive threshold → Basic → flee
     * Prioritizes survival. Uses offensive basics only when no defensive option available.
     */
    private buildCowardlyList(ctx: CombatEvaluationContext): AbilityDefinition[] {
        const defensives = this.book.getDefensiveAbilities();
        const defUlts = defensives.filter(a => a.type === 'ultimate');
        const defThresholds = defensives.filter(a => a.type === 'threshold');
        const basics = this.book.getBasics(ctx.combatStyle);

        return [...defUlts, ...defThresholds, ...basics];
    }

    /**
     * predator: Stun → Channeled threshold → Basic
     * Maximizes target control. Locks targets down before channeling damage.
     */
    private buildPredatorList(ctx: CombatEvaluationContext, target: TargetContext): AbilityDefinition[] {
        const all = this.book.getByStyle(ctx.combatStyle);
        
        // Only include stuns if target is not immune
        const stuns = target.stunImmunityEndTick <= ctx.currentTick
            ? all.filter(a => a.flags.includes('stun'))
            : [];
        const channels = all.filter(a => a.isChanneled && a.type === 'threshold');
        const thresholds = all.filter(a => a.type === 'threshold' && !a.isChanneled && !a.flags.includes('stun'));
        const basics = all.filter(a => a.type === 'basic' && !a.flags.includes('stun'));

        return [...stuns, ...channels, ...thresholds, ...basics];
    }

    // ═══════════════════════════════════════════════════════
    // Constraint Pipeline
    // ═══════════════════════════════════════════════════════

    private passesConstraints(
        ability: AbilityDefinition,
        ctx: CombatEvaluationContext,
        target: TargetContext
    ): boolean {
        // 1. Range check (Chebyshev) — skip for self-targeted abilities (range 0)
        if (ability.range > 0) {
            const dist = chebyshevDistance(ctx.coord, target.coord);
            if (dist > ability.range) return false;
        }

        // 2. Per-ability cooldown
        const cdEnd = ctx.cooldowns[ability.id] || 0;
        if (ctx.currentTick < cdEnd) return false;

        // 3. Adrenaline
        if (ctx.adrenaline < ability.adrenalineCost) return false;

        // 4. Stun waste prevention
        if (ability.flags.includes('stun') && ctx.currentTick < target.stunImmunityEndTick) {
            return false;
        }

        return true;
    }

    // ═══════════════════════════════════════════════════════
    // Public Utilities
    // ═══════════════════════════════════════════════════════

    /**
     * Calculate damage for an ability hit.
     * Simplified formula: weaponDamage * random(min%, max%).
     */
    public calculateDamage(ability: AbilityDefinition, weaponDamage: number): number {
        const [minPct, maxPct] = ability.damageRange;
        if (minPct === 0 && maxPct === 0) return 0; // Buff/defensive, no damage

        const pct = minPct + Math.random() * (maxPct - minPct);
        return Math.floor(weaponDamage * (pct / 100));
    }

    public healthCheck(): { online: boolean; details: string } {
        const bookHealth = this.book.healthCheck();
        return {
            online: bookHealth.online,
            details: `CombatRotationEngine: ${bookHealth.loaded} abilities available. Ready for rotation evaluation.`
        };
    }
}
