/**
 * CombatRotationEngine.ts
 * 
 * March 2026 Modernized combat rotation evaluator.
 * Given a combatant's state + target, returns the optimal next ability.
 * 
 * Constraint pipeline per ability:
 *  1. Is target in range? (Chebyshev distance)
 *  2. Is ability off cooldown? (per-ability CD + GCD)
 *  3. Does attacker have enough adrenaline?
 *  4. Is attacker locked? (channeling)
 *  5. Is target stun-immune? (prevents wasted stun GCDs)
 *  6. Stack/buff gating (Bloodlust, Anima, Searing Winds, Shadow Imbued)
 * 
 * Damage model: Logarithmic scaling (March 2026)
 *   baseDamage = 145 * weaponTier * ln(1 + 0.6 * level / 145) / ln(1.6)
 * 
 * Archetype priority chains:
 *  - aggressive: Ultimate → Enhanced → Basic (promotes buff-window consumers)
 *  - methodical: Debuff → Enhanced → Basic
 *  - cowardly:   Eat Food → Defensive ultimate → Defensive enhanced → Basic → (flee)
 *  - predator:   Stun → Channeled enhanced → Basic
 */

import { AbilityBook, AbilityDefinition, CombatStyle } from './AbilityBook.js';
import { CanonicalClock } from '../../utils/CanonicalClock.js';
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
    /** Attacker's full state for stack/buff checks */
    state: CombatantState;
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

        // Gate 4: Survival (Eat food if HP < 40%)
        if (ctx.state.hp && ctx.state.maxHp && (ctx.state.hp / ctx.state.maxHp) < 0.4) {
            const food = this.book.getByName('Eat Food'); // Assuming 'Eat Food' is in the book
            if (food && this.passesConstraints(food, ctx, target)) {
                return {
                    action: 'execute_ability',
                    abilityId: food.id,
                    abilityName: food.name,
                    targetId: 'self',
                    tickStarted: ctx.currentTick,
                    contextHash: 'survival_heal',
                };
            }
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

        for (const [entityId, ghost] of field.projections) {
            // Skip self-projections
            if (isPlayer && entityId === 'player_sovereign') continue;
            if (!isPlayer && entityId !== 'player_sovereign') continue;

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
     * aggressive: Ultimate → Enhanced → Basic
     * Dumps adrenaline as fast as possible into highest-damage abilities.
     * March 2026: Promotes buff-window consumers when buffs are active.
     */
    private buildAggressiveList(ctx: CombatEvaluationContext): AbilityDefinition[] {
        const ults = this.book.getUltimates(ctx.combatStyle);
        const enhanced = this.book.getEnhancedAbilities(ctx.combatStyle);
        const basics = this.book.getBasics(ctx.combatStyle);

        // March 2026: Promote buff-window consumers when a buff is active
        const buffConsumers = this.getActiveBuffConsumers(ctx, [...ults, ...enhanced, ...basics]);
        const nonConsumers = [...ults, ...enhanced, ...basics].filter(a => !buffConsumers.includes(a));

        return [...buffConsumers, ...nonConsumers];
    }

    /**
     * methodical: Debuff first → Threshold → Basic
     * Applies debuffs/vulnerability before damage, respects all cooldowns.
     */
    private buildMethodicalList(ctx: CombatEvaluationContext): AbilityDefinition[] {
        const all = [...this.book.getByStyle(ctx.combatStyle)];
        
        // Debuffs first
        const debuffs = all.filter(a => a.flags.includes('debuff'));
        const enhanced = all.filter(a => a.type === 'enhanced' && !a.flags.includes('debuff'));
        const basics = all.filter(a => a.type === 'basic' && !a.flags.includes('debuff'));
        const ults = all.filter(a => a.type === 'ultimate');

        return [...debuffs, ...enhanced, ...basics, ...ults];
    }

    /**
     * cowardly: Defensive ultimate → Defensive threshold → Basic → flee
     * Prioritizes survival. Uses offensive basics only when no defensive option available.
     */
    private buildCowardlyList(ctx: CombatEvaluationContext): AbilityDefinition[] {
        const defensives = this.book.getDefensiveAbilities();
        const defUlts = defensives.filter(a => a.type === 'ultimate');
        const defEnhanced = defensives.filter(a => a.type === 'enhanced');
        const basics = this.book.getBasics(ctx.combatStyle);

        return [...defUlts, ...defEnhanced, ...basics];
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
        const channels = all.filter(a => a.isChanneled && a.type === 'enhanced');
        const enhanced = all.filter(a => a.type === 'enhanced' && !a.isChanneled && !a.flags.includes('stun'));
        const basics = all.filter(a => a.type === 'basic' && !a.flags.includes('stun'));

        return [...stuns, ...channels, ...enhanced, ...basics];
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

        // 5. Stack-aware routing (March 2026 Paradigm)
        if (ability.flags.includes('bloodlust-consumer')) {
            const stacks = ctx.state.bloodlustStacks || 0;
            // Enhanced abilities require a minimum of 4 stacks for optimal throughput
            if (stacks < 4) return false;
        }

        if (ability.flags.includes('anima-consumer')) {
            if (!ctx.state.animaCharged) return false;
        }

        // 6. Searing Winds: Only allow searing-winds-extender abilities during active Searing Winds
        if (ability.flags.includes('searing-winds-extender')) {
            if ((ctx.state.searingWindsTicksRemaining || 0) <= 0) {
                // Not forbidden, but deprioritized — handled in priority builders
            }
        }

        return true;
    }

    // ═══════════════════════════════════════════════════════
    // Buff Window Awareness (March 2026)
    // ═══════════════════════════════════════════════════════

    /**
     * Returns abilities from the candidate list that consume an active buff.
     * These should be promoted to the front of the priority queue to maximize
     * damage within limited buff windows.
     */
    private getActiveBuffConsumers(ctx: CombatEvaluationContext, candidates: AbilityDefinition[]): AbilityDefinition[] {
        const promoted: AbilityDefinition[] = [];

        const hasBloodlust = (ctx.state.bloodlustStacks || 0) >= 4;
        const hasAnima = !!ctx.state.animaCharged;
        const hasSearingWinds = (ctx.state.searingWindsTicksRemaining || 0) > 0;
        const hasShadowImbued = (ctx.state.shadowImbuedTicksRemaining || 0) > 0;

        for (const ability of candidates) {
            // Melee: Bloodlust consumers promoted when stacks are high
            if (hasBloodlust && ability.flags.includes('bloodlust-consumer')) {
                promoted.push(ability);
                continue;
            }
            // Magic: Anima consumers promoted when charged
            if (hasAnima && ability.flags.includes('anima-consumer')) {
                promoted.push(ability);
                continue;
            }
            // Ranged: Searing Winds extenders promoted during active window
            if (hasSearingWinds && ability.flags.includes('searing-winds-extender')) {
                promoted.push(ability);
                continue;
            }
            // Ranged: Shadow Imbued makes adrenaline-spending abilities more efficient
            if (hasShadowImbued && ability.adrenalineCost > 0 && ctx.combatStyle === 'ranged') {
                promoted.push(ability);
                continue;
            }
        }

        return promoted;
    }

    // ═══════════════════════════════════════════════════════
    // Public Utilities
    // ═══════════════════════════════════════════════════════

    /**
     * Calculate base damage at a given combat level.
     * March 2026: Logarithmic scaling replaces linear (2.5 × level).
     * Formula: 145 × weaponTier × ln(1 + 0.6 × level / 145) / ln(1.6)
     * 
     * @param level       Combat skill level (1–120)
     * @param weaponTier  Weapon tier (1–95+)
     * @returns Base damage value before ability % modifiers
     */
    public static logarithmicBaseDamage(level: number, weaponTier: number): number {
        return Math.floor(
            145 * weaponTier * Math.log(1 + 0.6 * level / 145) / Math.log(1.6)
        );
    }

    /**
     * Calculate damage for an ability hit.
     * March 2026: Uses logarithmic base damage instead of linear.
     * 
     * @param ability      The ability being fired
     * @param level        Attacker's combat skill level (1–120)
     * @param weaponTier   Weapon tier (1–95+)
     * @param buffState    Optional active buff multipliers
     */
    public calculateDamage(
        ability: AbilityDefinition,
        level: number,
        weaponTier: number,
        buffState?: { bloodlustStacks?: number; animaCharged?: boolean; shadowImbued?: boolean }
    ): number {
        const [minPct, maxPct] = ability.damageRange;
        if (minPct === 0 && maxPct === 0) return 0; // Buff/defensive, no damage

        const baseDamage = CombatRotationEngine.logarithmicBaseDamage(level, weaponTier);
        const rng = CanonicalClock.getInstance().rng();
        const pct = minPct + rng.next() * (maxPct - minPct);
        let damage = Math.floor(baseDamage * (pct / 100));

        // Buff multipliers (March 2026)
        if (buffState) {
            // Bloodlust: Each stack adds 2.5% damage, consumed on enhanced ability use
            if (buffState.bloodlustStacks && ability.flags.includes('bloodlust-consumer')) {
                damage = Math.floor(damage * (1 + buffState.bloodlustStacks * 0.025));
            }
            // Anima Charged: 10% bonus on next magic ability
            if (buffState.animaCharged && ability.style === 'magic') {
                damage = Math.floor(damage * 1.10);
            }
            // Shadow Imbued: 5% bonus to ranged abilities during active window
            if (buffState.shadowImbued && ability.style === 'ranged') {
                damage = Math.floor(damage * 1.05);
            }
        }

        return damage;
    }

    /**
     * @deprecated Use calculateDamage(ability, level, weaponTier) instead.
     * Legacy linear damage for backward compatibility during transition.
     */
    public calculateDamageLinear(ability: AbilityDefinition, weaponDamage: number): number {
        const [minPct, maxPct] = ability.damageRange;
        if (minPct === 0 && maxPct === 0) return 0;
        const rng = CanonicalClock.getInstance().rng();
        const pct = minPct + rng.next() * (maxPct - minPct);
        return Math.floor(weaponDamage * (pct / 100));
    }

    public healthCheck(): { online: boolean; details: string } {
        const bookHealth = this.book.healthCheck();
        return {
            online: bookHealth.online,
            details: `CombatRotationEngine [March2026]: ${bookHealth.loaded} abilities, logarithmic damage, buff-window routing.`
        };
    }
}
