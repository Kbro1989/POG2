import { GameState, Coord, NPC } from '../core/models.js';
import { SovereignAvatarEntity } from '../core/SovereignAvatar.js';
import { EntityGhost } from '../core/EntityGhost.js';
import { PlayerAgent } from '../engines/gameplay/PlayerAgent.js';
import { PADDED_SIZE, SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { createLogger } from '../utils/logger.js';
import { performance } from 'perf_hooks';

const logger = createLogger('GhostSplatEngine');

export interface GhostSplatField {
    tickDepth: number; // e.g. 1, 2, 3 ticks ahead
    heatmap: Uint8Array; // flattened PADDED_SIZE * PADDED_SIZE grid for rapid O(1) sampling (Combined)
    entityHeat?: Uint8Array; // NPCs heat only
    avatarHeat?: Uint8Array; // Players heat only
    projections: Map<string, EntityGhost>;
    safespots: Coord[];
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
            this.calculateThreatHeatmap(field);
            this.identifySafespots(playerAgent, field);

            const duration = performance.now() - start;
            if (duration > this.MAX_COMPUTE_MS) {
                logger.warn({ duration, limit: this.MAX_COMPUTE_MS }, 
                    'Ghost Splat Engine threshold exceeded - Predictive logic too heavy'
                );
            }

            this.latestField = field;
            return field;
        } catch (err) {
            logger.error({ err }, 'Failed to compute predictive Ghost Splat Field');
            return null;
        }
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

    private calculateThreatHeatmap(field: GhostSplatField): void {
        const tempHeatmap = new Uint8Array(PADDED_SIZE * PADDED_SIZE);
        
        field.projections.forEach((ghost, entityId) => {
            // Player ghosts don't emit threat radiating heat in the same way, 
            // but we might want them to affect the map differently. 
            // For now, only NPCs project threat zones.
            if (entityId.startsWith('player_')) return;

            const localX = ghost.projectedCoord.x % PADDED_SIZE;
            const localY = ghost.projectedCoord.y % PADDED_SIZE;
            
            const aggroRange = 2; // In reality, fetch from NPC metadata

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
}
