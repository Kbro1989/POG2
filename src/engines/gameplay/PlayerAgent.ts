// src/engines/gameplay/PlayerAgent.ts

import { SovereignAvatarEntity } from '../../core/SovereignAvatar.js';
import { EntityGhost } from '../../core/EntityGhost.js';
import { Coord, GameState } from '../../core/models.js';
import { GhostSplatField } from '../../substrates/GhostSplatEngine.js';
import { SpatialSovereigntyLimb, PADDED_SIZE } from '../../limbs/spatial/SpatialSovereigntyLimb.js';
import { DirectionalPathfinder } from '../../limbs/spatial/DirectionalPathfinder.js';
import { CombatRotationEngine, CombatEvaluationContext, TargetContext, CombatIntent, TacticalArchetype } from './CombatRotationEngine.js';
import { CombatStyle } from './AbilityBook.js';
import { HexagramManager } from '../../routing/HexagramManager.js';

/**
 * PlayerAgent
 * 
 * Symmetry to NpcAgent. Wraps the SovereignAvatarEntity with cognitive
 * self-awareness, allowing it to project its own ghost into the GhostSplat field
 * and manage its own temporal combat rhythms.
 */
export class PlayerAgent {
    private pathfinder: DirectionalPathfinder = new DirectionalPathfinder(SpatialSovereigntyLimb.getInstance());
    private leaderId: string | null = null;

    constructor(private avatar: SovereignAvatarEntity) {}

    public setLeader(id: string | null): void {
        this.leaderId = id;
    }

    /**
     * projectSelf - Forward-project position + combat state.
     * Maps the player's current pathing queue and intent into the GhostSplat field.
     */
    public projectSelf(ticks: number): EntityGhost[] {
        const ghosts: EntityGhost[] = [];
        
        let pathCoord = this.avatar.coord;
        let source: EntityGhost['source'] = 'extrapolation';
        
        if (this.avatar.metadata?.currentPath && this.avatar.metadata.currentPath.length > 0) {
            const pathIndex = Math.min(ticks - 1, this.avatar.metadata.currentPath.length - 1);
            if (pathIndex >= 0) {
                const candidateCoord = this.avatar.metadata.currentPath[pathIndex];

                // ── Stale Path Guard (per Kimi-k2 audit) ────────────────────────────
                // Validate the path coord is still walkable. A stale path (from before
                // a door closed or an NPC moved) would project the player into a blocked
                // tile with confidence 1.0 — a false certainty that bypasses hysteresis.
                const spatial = SpatialSovereigntyLimb.getInstance();
                const isStillWalkable = spatial.isWalkable(
                    candidateCoord.plane ?? this.avatar.coord.plane,
                    candidateCoord.x,
                    candidateCoord.y
                );

                if (isStillWalkable) {
                    pathCoord = candidateCoord;
                    source = 'path_queue';
                } else {
                    // Downgrade: blocked tile — fallback to current position, lower confidence
                    pathCoord = this.avatar.coord;
                    source = 'extrapolation';
                }
            }
        } else if (this.avatar.intent?.coord) {
            pathCoord = this.avatar.intent.coord;
            source = 'intent';
        }

        ghosts.push({
            entityId: 'player_sovereign',
            projectedCoord: pathCoord,
            ticksAhead: ticks,
            confidence: source === 'path_queue' ? 1.0 : (source === 'intent' ? 0.8 : 0.5),
            combatState: {
                hp: this.avatar.currentHp || 0,
                adrenaline: this.avatar.adrenaline || 0,
                prayerActive: false // Simplified for now
            },
            source
        });

        return ghosts;
    }

    /**
     * projectOffline - Fallback state for GhostLimb if the player drops connection.
     */
    public projectOffline(): EntityGhost {
        return {
            entityId: 'player_sovereign',
            projectedCoord: this.avatar.coord,
            ticksAhead: 0,
            confidence: 1.0,
            combatState: {
                hp: this.avatar.currentHp || 0,
                adrenaline: this.avatar.adrenaline || 0,
                prayerActive: false
            },
            source: 'offline_fallback'
        };
    }

    /**
     * advanceTick - Synchronized with the 600ms CNSGodheadPulseVolley.
     * Decays adrenaline, processes cooldowns, drains prayer.
     */
    public advanceTick(deltaMs: number): void {
        const ticksPassed = Math.round(deltaMs / 600);
        
        for (let i = 0; i < ticksPassed; i++) {
            // Process player-specific mechanics
            // Cooldowns are already managed via interaction intent, but we can manage adrenaline here
            if (!this.avatar.metadata.inCombat) {
                // Decay adrenaline by 500 (5%) every tick if not in combat (simplified)
                if (this.avatar.adrenaline && this.avatar.adrenaline > 0) {
                    const decay = Math.min(500, this.avatar.adrenaline);
                    this.avatar.consumeAdrenaline(decay);
                }
            }
        }
    }

    /**
     * evaluateCombatRotation
     * 
     * Uses CombatRotationEngine to select the optimal ability based on:
     * - Current adrenaline and cooldowns
     * - GhostSplat heat-based target acquisition
     * - GCD and channel lock constraints
     * - Tactical archetype priority chain
     * 
     * Only called when NOT retreating (evaluateTacticalPosition returns no evasion).
     * Returns a CombatIntent or null if no valid ability/target exists.
     */
    public evaluateCombatRotation(
        field: GhostSplatField,
        currentTick: number
    ): CombatIntent | null {
        // Gate: Do not fight while evading
        if (this.avatar.metadata.tacticalState === 'evading') {
            return null;
        }

        // Gate: Avatar busy (locked by animation/channel)
        if (this.avatar.isBusy()) {
            return null;
        }

        const engine = CombatRotationEngine.getInstance();

        // Combat metadata initialization
        if (this.avatar.metadata.gcdEndTick === undefined) {
            this.avatar.metadata.gcdEndTick = 0;
        }
        if (this.avatar.metadata.channelEndTick === undefined) {
            this.avatar.metadata.channelEndTick = 0;
        }
        if (this.avatar.metadata.weaponDamage === undefined) {
            this.avatar.metadata.weaponDamage = 1000; // Default weapon damage scalar
        }

        // Determine combat style from equipped weapon (default melee)
        const combatStyle: CombatStyle = this.avatar.metadata.combatStyle || 'melee';
        const archetype: TacticalArchetype = this.avatar.metadata.combatArchetype || 'aggressive';

        // Resolve target via GhostSplat heat
        const maxRange = combatStyle === 'melee' ? 1 : 7;
        const target = engine.resolveTargetFromHeat(field, this.avatar.coord, maxRange, true);

        if (!target) {
            return null; // No hostile entity in range
        }

        // Enrich target HP from live NPC state if available
        if (this.avatar.state?.npcMap) {
            for (const [, npc] of this.avatar.state.npcMap) {
                if (String(npc.id) === target.entityId || String(npc.npcId ?? npc.id) === target.entityId) {
                    target.currentHp = npc.currentHp ?? npc.combatStats?.currentHp ?? 1000;
                    break;
                }
            }
        }

        // Build evaluation context
        const combatantState: import('../../core/models.js').CombatantState = {
            adrenaline: this.avatar.adrenaline || 0,
            bloodlustStacks: this.avatar.metadata.bloodlustStacks || 0,
            animaCharged: this.avatar.metadata.animaCharged || false,
            searingWindsTicksRemaining: this.avatar.metadata.searingWindsTicksRemaining || 0,
            shadowImbuedTicksRemaining: this.avatar.metadata.shadowImbuedTicksRemaining || 0,
            stunCharges: this.avatar.metadata.stunCharges || {},
            hp: this.avatar.currentHp || 0,
            maxHp: this.avatar.maxHp || 10000,
            lastCombatTick: this.avatar.metadata.lastCombatTick || 0,
            cooldowns: this.avatar.cooldowns || {},
        };

        const ctx: CombatEvaluationContext = {
            adrenaline: this.avatar.adrenaline || 0,
            cooldowns: this.avatar.cooldowns || {},
            coord: this.avatar.coord,
            currentTick,
            gcdEndTick: this.avatar.metadata.gcdEndTick,
            channelEndTick: this.avatar.metadata.channelEndTick,
            combatStyle,
            archetype,
            state: combatantState,
        };

        return engine.evaluateRotation(ctx, target);
    }

    private getDynamicHeatThreshold(): number {
        try {
            const hexagram = HexagramManager.getInstance().getInterpretation();
            const variance = hexagram.aesthetics.thermalVariance || 0.5;
            // variance 0.0-1.0 maps to threshold 0.7-0.49
            return 0.7 - (variance * 0.21);
        } catch (e) {
            return 0.7; // Fallback
        }
    }

    /**
     * evaluateTacticalPosition
     * Subscribes to the safespots telemetry to autonomously override pathing and dodge threats.
     */
    public evaluateTacticalPosition(field: GhostSplatField): void {
        // Hysteresis Initialization
        if (!this.avatar.metadata.tacticalState) {
            this.avatar.metadata.tacticalState = 'idle';
            this.avatar.metadata.ticksInRetreat = 0;
        }

        // 1. Sample current tile heat
        const centerOffset = Math.floor(PADDED_SIZE / 2);
        const idx = centerOffset * PADDED_SIZE + centerOffset;
        
        // Player evaluates NPC threats via entityHeat
        const currentHeat = field.entityHeat ? field.entityHeat[idx] : field.heatmap[idx];

        const heatThreshold = this.getDynamicHeatThreshold();
        const isHeatCritical = currentHeat >= heatThreshold;

        // Composure Gate (Adrenaline vs HP)
        const adrenaline = (this.avatar.adrenaline || 0) / 100; // Convert to percentage
        const currentHp = this.avatar.currentHp || 0;
        const maxHp = this.avatar.maxHp;
        const hpPercent = (currentHp / maxHp) * 100;
        const composureBroken = adrenaline < 50 || hpPercent < 50;

        // 1.5 Follower Proximity Logic (Phase 46)
        if (this.leaderId && this.avatar.metadata.tacticalState === 'idle') {
            const leaderGhost = field.projections.get(this.leaderId);
            if (leaderGhost) {
                const dist = Math.max(
                    Math.abs(this.avatar.x - leaderGhost.projectedCoord.x),
                    Math.abs(this.avatar.y - leaderGhost.projectedCoord.y)
                );
                
                // Stay within 2-3 tiles of leader, but not ON them (Negative Space)
                if (dist > 3 || dist === 0) {
                    const safespots = field.safespots;
                    if (safespots.length > 0) {
                        // Find a safespot near the leader
                        const bestSpot = safespots
                            .filter(s => s.plane === leaderGhost.projectedCoord.plane)
                            .sort((a, b) => {
                                const distA = Math.abs(a.x - leaderGhost.projectedCoord.x) + Math.abs(a.y - leaderGhost.projectedCoord.y);
                                const distB = Math.abs(b.x - leaderGhost.projectedCoord.x) + Math.abs(b.y - leaderGhost.projectedCoord.y);
                                return distA - distB;
                            })[0];

                        if (bestSpot) {
                            const success = this.avatar.plotPath(bestSpot.x, bestSpot.y, this.pathfinder, this.avatar.state);
                            if (success) {
                                this.avatar.intent = {
                                    action: 'follow_leader',
                                    targetId: this.leaderId!,
                                    tickStarted: this.avatar.state?.tickNumber || 0,
                                    contextHash: 'follow_logic'
                                };
                                return;
                            }
                        }
                    }
                }
            }
        }

        // --- HYSTERESIS EXIT CONDITION ---
        if (this.avatar.metadata.tacticalState === 'evading') {
            this.avatar.metadata.ticksInRetreat++;
            
            // Allow exit if heat drops to 0 and we've retreated for at least 3 ticks
            // Or if composure is fully restored.
            if ((currentHeat === 0 && this.avatar.metadata.ticksInRetreat >= 3) || !composureBroken) {
                this.avatar.metadata.tacticalState = 'idle';
                this.avatar.metadata.ticksInRetreat = 0;
                return; // Safe to stop evading
            }
            
            // Continue evading if we haven't met the exit condition
            // Wait, if we are currently evading, do we need to replot a path? 
            // If we are already walking towards a safespot, let pathfinding continue.
            if (this.avatar.intent?.action === 'run_tactical_evade' && this.avatar.currentPath && this.avatar.currentPath.length > 0) {
                return; // Keep running along the established safe route
            }
        }

        // --- HYSTERESIS ENTRY CONDITION ---
        if (this.avatar.metadata.tacticalState === 'idle') {
            if (!isHeatCritical || !composureBroken) {
                return; // Safe, no evasion needed
            }
            // Trigger evasion
            this.avatar.metadata.tacticalState = 'evading';
            this.avatar.metadata.ticksInRetreat = 0;
        }

        // 3. Evasion necessary. Rank safespots.
        if (!field.safespots || field.safespots.length === 0) return;

        type ScoredSafespot = { coord: Coord, score: number };
        const scored: ScoredSafespot[] = [];

        for (const spot of field.safespots) {
            // Distance (Manhattan is fine for heuristic scoring)
            const dist = Math.abs(spot.x - this.avatar.coord.x) + Math.abs(spot.y - this.avatar.coord.y);
            
            // Try to align away from central threat mass. Wait, GhostSplatField heatmap can't easily give a threat vector without sampling.
            // For now, prioritize closest safespot.
            // In the future: incorporate directional vector from NPC ghosts to favor safespots behind cover.
            scored.push({ coord: spot, score: dist });
        }

        // Sort by lowest score (closest)
        scored.sort((a, b) => a.score - b.score);

        // 4. Validate Path
        const spatial = SpatialSovereigntyLimb.getInstance();
        const pathfinder = new DirectionalPathfinder(spatial);

        for (const candidate of scored) {
            try {
                // Leverage the avatar's native plotPath which mutates currentPath automatically
                const isReachable = this.avatar.plotPath(candidate.coord.x, candidate.coord.y, pathfinder, this.avatar.state);
                
                if (isReachable) {
                    // Valid route to safespot found!
                    // Emit a retreat intent bridging the tactical evaluator to the actuation loop
                    this.avatar.intent = {
                        action: 'run_tactical_evade',
                        targetId: -1, // No entity target
                        tickStarted: this.avatar.state.tickNumber || 0,
                        contextHash: 'evade',
                        coord: candidate.coord
                    };
                    return; 
                }
            } catch (err) {
                // Path failed, evaluate next best
            }
        }
    }
}
