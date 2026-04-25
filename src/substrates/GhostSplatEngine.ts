import { GameState, Coord, NPC } from '../core/models.js';
import { SovereignAvatarEntity } from '../core/SovereignAvatar.js';
import { EntityGhost } from '../core/EntityGhost.js';
import { PlayerAgent } from '../engines/gameplay/PlayerAgent.js';
import { PADDED_SIZE, SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { createLogger } from '../utils/logger.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { performance } from 'perf_hooks';
import { SwitchboardLimb } from '../monitor/SwitchboardLimb.js';

const logger = createLogger('GhostSplatEngine');

export interface GhostSplatField {
    tickDepth: number;
    heatmap: Uint8Array;
    entityHeat?: Uint8Array;
    avatarHeat?: Uint8Array;
    projections: Map<string, EntityGhost>;
    safespots: Coord[];
    gaussians?: Float32Array; // Packed [N, 13]: pos(3), cov(6), color(3), opacity(1)
}

/**
 * GhostSplatEngine
 * 
 * Predictive spatial intelligence layer. Forecasts future world states (tick N+1 to N+3)
 * by layering temporal projections over the authoritative 66x66 NXT world model.
 */
export class GhostSplatEngine {
    private static instance: GhostSplatEngine;
    private readonly MAX_COMPUTE_MS = 50;
    private latestField: GhostSplatField | null = null;

    private constructor() {}

    public static getInstance(): GhostSplatEngine {
        if (!GhostSplatEngine.instance) {
            GhostSplatEngine.instance = new GhostSplatEngine();
        }
        return GhostSplatEngine.instance;
    }

    /**
     * project - Generates a GhostSplatField for a given number of ticks into the future.
     */
    public project(state: GameState, tickDepth: number = 2, playerAgent?: PlayerAgent): GhostSplatField | null {
        const start = performance.now();
        
        try {
            const field: GhostSplatField = {
                tickDepth,
                heatmap: new Uint8Array(PADDED_SIZE * PADDED_SIZE),
                entityHeat: new Uint8Array(PADDED_SIZE * PADDED_SIZE),
                avatarHeat: new Uint8Array(PADDED_SIZE * PADDED_SIZE),
                projections: new Map(),
                safespots: []
            };

            // Calculate entity projections
            this.projectNpcMovement(state, field);
            this.projectPlayer(playerAgent, field);
            this.calculateThreatHeatmap(field, state); // Pass state for cache-derived aggro ranges
            this.identifySafespots(playerAgent, field);
            this.generateGaussianTensor(field);

            const duration = performance.now() - start;
            if (duration > this.MAX_COMPUTE_MS) {
                logger.warn({ duration, limit: this.MAX_COMPUTE_MS }, 
                    'Ghost Splat Engine threshold exceeded - Predictive logic too heavy'
                );
            }

            this.latestField = field;

            // Broadcast to Switchboard if connected
            const switchboard = SwitchboardLimb.getInstance();
            if (switchboard && typeof (switchboard as any).broadcastGhostSplat === 'function') {
                switchboard.broadcastGhostSplat(this.serializeField(field, state));
            }

            return field;
        } catch (err) {
            logger.error({ err }, 'Failed to compute predictive Ghost Splat Field');
            return null;
        }
    }

    private serializeField(field: GhostSplatField, state?: GameState): any {
        return {
            tickDepth: field.tickDepth,
            heatmap: Array.from(field.heatmap),
            projections: Array.from(field.projections.entries()),
            safespots: field.safespots,
            center: (() => {
                if (!state) return { x: 0, y: 0, plane: 0 };
                const firstPlayer = state.players.values().next().value;
                return firstPlayer
                    ? { x: firstPlayer.x, y: firstPlayer.y, plane: firstPlayer.plane }
                    : { x: 0, y: 0, plane: 0 };
            })()
        };
    }

    public getLatestField(): GhostSplatField | null {
        return this.latestField;
    }

    public healthCheck(): { online: boolean; details: string; status: 'ONLINE' | 'DEGRADED' | 'OFFLINE' } {
        return {
            online: true,
            status: 'ONLINE',
            details: `GhostSplatEngine active. Max compute budget: ${this.MAX_COMPUTE_MS}ms.`
        };
    }

    private projectNpcMovement(state: GameState, field: GhostSplatField): void {
        // Iterate the authoritative npcMap registry (always populated by SimulationHarness).
        // npcSpatialIndex is a secondary index that isn't reliably maintained.
        for (const [npcId, npc] of state.npcMap) {
            const source = (npc.path && npc.path.length > 0) ? 'path_queue'
                : (npc.interactionState === 'MOVING' && npc.metadata?.targetCoord) ? 'extrapolation'
                : 'offline_fallback';
            const projectedCoord = this.extrapolate(npc, field.tickDepth);
            
            const ghost: EntityGhost = {
                entityId: `npc_${npc.id}`,
                projectedCoord,
                ticksAhead: field.tickDepth,
                confidence: source === 'path_queue' ? 1.0 : source === 'extrapolation' ? 0.8 : 0.5,
                source
            };
            
            field.projections.set(ghost.entityId, ghost);
            
            // Splat the projection onto the heatmap
            if (projectedCoord) {
                const localX = projectedCoord.x % PADDED_SIZE;
                const localY = projectedCoord.y % PADDED_SIZE;
                
                if (localX >= 0 && localX < PADDED_SIZE && localY >= 0 && localY < PADDED_SIZE) {
                    const idx = localY * PADDED_SIZE + localX;
                    field.heatmap[idx] += 1; // Increase combined threat weight
                    if (field.entityHeat) field.entityHeat[idx] += 1; // Factional weighting
                }
            }
        }
    }

    private projectPlayer(playerAgent: PlayerAgent | undefined, field: GhostSplatField): void {
        if (!playerAgent) return;
        
        const ghosts = playerAgent.projectSelf(field.tickDepth);
        for (const ghost of ghosts) {
            field.projections.set(ghost.entityId, ghost);

            // Splat player's ghost onto the heatmap as self-awareness
            const localX = ghost.projectedCoord.x % PADDED_SIZE;
            const localY = ghost.projectedCoord.y % PADDED_SIZE;
            
            if (localX >= 0 && localX < PADDED_SIZE && localY >= 0 && localY < PADDED_SIZE) {
                const idx = localY * PADDED_SIZE + localX;
                field.heatmap[idx] += 1;
                if (field.avatarHeat) field.avatarHeat[idx] += 1; // Factional weighting
            }
        }
    }

    private extrapolate(npc: NPC, ticksAhead: number): Coord {
        // High-Fidelity Projection: Consume actual A* path geometry if available
        if (npc.path && npc.path.length > 0) {
            const index = Math.min(ticksAhead - 1, npc.path.length - 1);
            if (index >= 0) {
                return npc.path[index];
            }
        }

        // Visceral Fallback: Linear Extrapolation for dummy/legacy endpoints
        if (npc.interactionState === 'MOVING' && npc.metadata?.targetCoord) {
            return {
                x: npc.metadata.targetCoord.x,
                y: npc.metadata.targetCoord.y,
                plane: npc.metadata.targetCoord.plane ?? npc.coord.plane
            };
        }
        return npc.coord;
    }

    private calculateThreatHeatmap(field: GhostSplatField, state?: GameState): void {
        const tempHeatmap = new Uint8Array(PADDED_SIZE * PADDED_SIZE);
        
        field.projections.forEach((ghost, entityId) => {
            if (entityId.startsWith('player_')) return;

            const localX = ghost.projectedCoord.x % PADDED_SIZE;
            const localY = ghost.projectedCoord.y % PADDED_SIZE;
            
            // ── Cache-Derived Attack Range ─────────────────────────────────────
            // Pull attack range from live NPC state (populated by CacheForensicsLimb
            // entity records). Falls back to 2 only when metadata is absent.
            let aggroRange = 2;
            if (state) {
                const npcIdStr = entityId.replace('npc_', '');
                const npcId = parseInt(npcIdStr, 10);
                if (!isNaN(npcId)) {
                    const npc = state.npcMap.get(npcId);
                    const cacheRange = (npc as any)?.combatStats?.attackRange;
                    if (typeof cacheRange === 'number' && cacheRange > 0) {
                        aggroRange = cacheRange;
                    } else {
                        logger.debug({ entityId }, '[GhostSplat] attackRange not in cache — using default 2');
                    }
                }
            }

            // --- COGNITIVE ADAPTATION (Phase 45) ---
            try {
                const hexagram = HexagramManager.getInstance().getInterpretation();
                const variance = hexagram.aesthetics.thermalVariance || 0.5;
                // Scale base range by variance: variance 0.0 (Quiet) -> 1.0x, variance 1.0 (Agitated) -> 1.5x
                aggroRange = Math.max(1, Math.round(aggroRange * (1 + variance * 0.5)));
            } catch (e) {
                // Fallback to base aggroRange
            }

            for (let dx = -aggroRange; dx <= aggroRange; dx++) {
                for (let dy = -aggroRange; dy <= aggroRange; dy++) {
                    const nx = localX + dx;
                    const ny = localY + dy;
                    if (nx >= 0 && nx < PADDED_SIZE && ny >= 0 && ny < PADDED_SIZE) {
                        tempHeatmap[ny * PADDED_SIZE + nx] += 1;
                    }
                }
            }
        });

        // Merge back into original heatmap.
        for (let i = 0; i < field.heatmap.length; i++) {
            field.heatmap[i] += tempHeatmap[i];
        }
    }

    private identifySafespots(playerAgent: PlayerAgent | undefined, field: GhostSplatField): void {
        const startX = Math.floor(PADDED_SIZE / 2) - 10;
        const startY = Math.floor(PADDED_SIZE / 2) - 10;

        for (let dx = 0; dx < 20; dx++) {
            for (let dy = 0; dy < 20; dy++) {
                const lx = startX + dx;
                const ly = startY + dy;
                if (lx >= 0 && lx < PADDED_SIZE && ly >= 0 && ly < PADDED_SIZE) {
                    const idx = ly * PADDED_SIZE + lx;
                    if (field.heatmap[idx] === 0 && playerAgent) {
                        // World translation:
                        // Find the rx, ry offset from player coord vs PADDED_SIZE origin
                        const playerGhost = playerAgent.projectOffline(); // Provides safe fallback
                        const worldX = playerGhost.projectedCoord.x + (lx - (Math.floor(PADDED_SIZE / 2)));
                        const worldY = playerGhost.projectedCoord.y + (ly - (Math.floor(PADDED_SIZE / 2)));
                        field.safespots.push({ x: worldX, y: worldY, plane: playerGhost.projectedCoord.plane });
                    }
                }
            }
        }
    }

    private generateGaussianTensor(field: GhostSplatField): void {
        const count = field.projections.size;
        const tensor = new Float32Array(count * 13);
        let offset = 0;

        field.projections.forEach((ghost, id) => {
            // 1. Position (Relative to local 66x66 center)
            const lx = (ghost.projectedCoord.x % PADDED_SIZE) - (PADDED_SIZE / 2);
            const ly = (ghost.projectedCoord.y % PADDED_SIZE) - (PADDED_SIZE / 2);
            const lz = (ghost.projectedCoord.plane || 0) * 2; // Vertical separation

            tensor[offset + 0] = lx;
            tensor[offset + 1] = lz; // Y-up convention for many renderers
            tensor[offset + 2] = ly;

            // 2. Covariance (Approximated as a sphere/ellipsoid)
            // [s11, s12, s13, s22, s23, s33]
            const isNpc = id.startsWith('npc_');
            const scale = isNpc ? 0.8 : 0.5;
            tensor[offset + 3] = scale; // s11
            tensor[offset + 4] = 0;     // s12
            tensor[offset + 5] = 0;     // s13
            tensor[offset + 6] = scale; // s22
            tensor[offset + 7] = 0;     // s23
            tensor[offset + 8] = scale; // s33

            // 3. Color (SH Level 0 - RGB)
            if (isNpc) {
                // Threat color: Orange to Red
                tensor[offset + 9] = 1.0;  // R
                tensor[offset + 10] = 0.4; // G
                tensor[offset + 11] = 0.0; // B
            } else {
                // Player color: Cyan
                tensor[offset + 9] = 0.0;  // R
                tensor[offset + 10] = 1.0; // G
                tensor[offset + 11] = 1.0; // B
            }

            // 4. Opacity
            tensor[offset + 12] = ghost.confidence;

            offset += 13;
        });

        field.gaussians = tensor;
    }
}
