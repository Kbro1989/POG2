import { Coord, GameState, NPC } from '../../core/models.js';
import { DirectionalPathfinder } from '../../limbs/spatial/DirectionalPathfinder.js';
import { SpatialSovereigntyLimb } from '../../limbs/spatial/SpatialSovereigntyLimb.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('NpcAgent');

export type NpcBehavior = 'wander' | 'patrol' | 'stationary' | 'follow';

export interface NpcAgentConfig {
    behavior: NpcBehavior;
    wanderRadius?: number;       // Max tile distance from spawn to wander
    patrolPath?: Coord[];        // Explicit waypoints for patrol
    followTargetId?: string;     // Player username for 'follow' behavior
    ticksPerMove?: number;       // How many ticks to wait between moves (default 1 = RS standard)
}

/**
 * NpcAgent
 * Autonomous movement controller for a single NPC entity.
 * Integrates with SimulationHarness.processTick() — one agent per NPC.
 */
export class NpcAgent {
    private npc: NPC;
    private config: NpcAgentConfig;
    private spawnCoord: Coord;
    private pathfinder: DirectionalPathfinder;
    private spatial: SpatialSovereigntyLimb;

    private currentPath: Coord[] = [];
    private patrolIndex = 0;
    private ticksSinceLastMove = 0;
    private isPathfinding = false;

    // Per-agent blacklist: tiles we already tried and failed to reach
    private blacklist = new Set<string>();

    constructor(npc: NPC, config: NpcAgentConfig, pathfinder: DirectionalPathfinder, spatial: SpatialSovereigntyLimb) {
        this.npc = npc;
        this.config = config;
        this.pathfinder = pathfinder;
        this.spatial = spatial;
        this.spawnCoord = { x: npc.x, y: npc.y, plane: npc.plane };
    }

    /**
     * tick — Called every 600ms by SimulationHarness.
     * Returns true if the NPC moved this tick.
     */
    public async tick(state: GameState): Promise<boolean> {
        // Throttle: some NPCs are slow-movers (e.g., 1 move every 2 ticks)
        const rate = this.config.ticksPerMove ?? 1;
        this.ticksSinceLastMove++;
        if (this.ticksSinceLastMove < rate) return false;
        this.ticksSinceLastMove = 0;

        // Step along existing path if one is active
        if (this.currentPath.length > 0) {
            const next = this.currentPath.shift()!;
            this.npc.x = next.x;
            this.npc.y = next.y;
            this.npc.plane = next.plane;
            this.npc.path = [...this.currentPath]; // Keep NPC model in sync
            return true;
        }

        // No active path — compute a new goal
        if (this.isPathfinding) return false;

        const goal = this.selectGoal(state);
        if (!goal) return false;

        const goalKey = `${goal.plane}_${goal.x}_${goal.y}`;
        if (this.blacklist.has(goalKey)) return false;

        this.isPathfinding = true;
        try {
            const from: Coord = { x: this.npc.x, y: this.npc.y, plane: this.npc.plane };
            const path = await this.pathfinder.findPath(from, goal, state);

            if (path.length <= 1) {
                // Path[0] is current tile — unreachable or already there
                this.blacklist.add(goalKey);
                // Clear blacklist occasionally so NPCs don't get permanently stuck
                if (this.blacklist.size > 20) this.blacklist.clear();
                return false;
            }

            // Remove current tile from head
            this.currentPath = path.slice(1);
            this.npc.path = [...this.currentPath];
            logger.debug({ npcId: this.npc.id, from, goal, steps: this.currentPath.length }, '[NpcAgent] Path issued.');
        } catch (err) {
            logger.error({ err, npcId: this.npc.id }, '[NpcAgent] Pathfind threw.');
        } finally {
            this.isPathfinding = false;
        }

        return false; // Will start moving next tick
    }

    /**
     * selectGoal — Returns the next movement target based on behavior mode.
     */
    private selectGoal(state: GameState): Coord | null {
        switch (this.config.behavior) {
            case 'wander':
                return this.pickWanderTile();

            case 'patrol':
                return this.advancePatrol();

            case 'follow': {
                if (!this.config.followTargetId) return null;
                const target = state.players.get(this.config.followTargetId);
                if (!target) return null;
                return { x: target.x, y: target.y, plane: target.plane };
            }

            case 'stationary':
            default:
                return null;
        }
    }

    /**
     * pickWanderTile — Picks a random walkable tile within wanderRadius of spawn.
     */
    private pickWanderTile(): Coord | null {
        const radius = this.config.wanderRadius ?? 5;
        const maxAttempts = 12;

        for (let i = 0; i < maxAttempts; i++) {
            const dx = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
            const dy = Math.floor(Math.random() * (radius * 2 + 1)) - radius;
            const tx = this.spawnCoord.x + dx;
            const ty = this.spawnCoord.y + dy;
            const plane = this.spawnCoord.plane;

            // Must be walkable and not current position
            if (this.spatial.isWalkable(plane, tx, ty) &&
                !(tx === this.npc.x && ty === this.npc.y)) {
                return { x: tx, y: ty, plane };
            }
        }
        return null;
    }

    /**
     * advancePatrol — Steps through the configured patrol waypoints cyclically.
     */
    private advancePatrol(): Coord | null {
        const patrol = this.config.patrolPath;
        if (!patrol || patrol.length === 0) return null;

        const current = this.npc;
        const waypoint = patrol[this.patrolIndex];

        // Already at this waypoint — advance to next
        if (current.x === waypoint.x && current.y === waypoint.y) {
            this.patrolIndex = (this.patrolIndex + 1) % patrol.length;
            return patrol[this.patrolIndex];
        }

        return waypoint;
    }

    public getNpc(): NPC {
        return this.npc;
    }
}
