import { BinaryHeap, Comparable } from '../../utils/BinaryHeap.js';
import { Coord, Direction, DirectionalCollision, GameState } from '../../core/models.js';
import { createLogger } from '../../utils/logger.js';
import { SpatialSovereigntyLimb } from './SpatialSovereigntyLimb.js';
import { SpaceRegistry } from '../../core/SpaceRegistry.js';

const logger = createLogger('DirectionalPathfinder');

class PathNode implements Comparable<PathNode> {
    public x: number;
    public y: number;
    public plane: number;
    public gScore: number;
    public fScore: number;
    public parent?: PathNode;

    constructor(coord: Coord, gScore: number, fScore: number, parent?: PathNode) {
        this.x = coord.x;
        this.y = coord.y;
        this.plane = coord.plane;
        this.gScore = gScore;
        this.fScore = fScore;
        this.parent = parent;
    }

    compare(other: PathNode): number {
        // Min-heap: lower fScore = higher priority
        return this.fScore - other.fScore;
    }

    toCoord(): Coord {
        return { x: this.x, y: this.y, plane: this.plane };
    }

    get key(): string {
        return `${this.plane}_${this.x}_${this.y}`;
    }
}

/**
 * DirectionalPathfinder - The "Motor" of the Sovereign Organism.
 * Implements Quaternary A* incorporating Directional Collision.
 */
export class DirectionalPathfinder {
    private registry: SpaceRegistry;

    constructor(private spatial: SpatialSovereigntyLimb) {
        this.registry = SpaceRegistry.getInstance();
    }

    /**
     * findPath - Quaternary A* for worker environments.
     */
    public async findPath(
        start: Coord,
        end: Coord,
        gameState: GameState,
        debug = false
    ): Promise<Coord[]> {
        const openSet = new BinaryHeap<PathNode>();
        const closedSet = new Set<string>();
        const gScores = new Map<string, number>();

        const startNode = new PathNode(
            start,
            0,
            this.heuristic(start, end)
        );

        openSet.insert(startNode);
        gScores.set(startNode.key, 0);

        let iterations = 0;
        const MAX_ITERATIONS = 5000;

        while (!openSet.isEmpty() && iterations < MAX_ITERATIONS) {
            iterations++;
            const current = openSet.pop()!;

            if (current.x === end.x && current.y === end.y) {
                if (debug) logger.info(`Path found in ${iterations} iterations.`);
                return this.reconstructPath(current);
            }

            closedSet.add(currentKey(current));

            // Expand Neighbors
            const neighbors = this.getNeighbors(current);
            for (const { coord: next, direction } of neighbors) {
                const nKey = `${next.plane}_${next.x}_${next.y}`;

                if (closedSet.has(nKey)) continue;

                // THE SOVEREIGN RULE: Verify Directional Collision
                const canMove = await this.canMove(current.toCoord(), next, direction, gameState);
                if (!canMove) continue;

                const tentativeG = current.gScore + 1;
                const existingG = gScores.get(nKey) ?? Infinity;

                if (tentativeG < existingG) {
                    const nextNode = new PathNode(
                        next,
                        tentativeG,
                        tentativeG + this.heuristic(next, end),
                        current
                    );
                    gScores.set(nKey, tentativeG);
                    openSet.insert(nextNode);
                }
            }
        }

        if (debug) logger.warn(`No path found after ${iterations} iterations.`);
        return [];
    }

    /**
     * canMove - THE SOVEREIGN NAVIGATION RULE:
     * A move from (from) to (to) is valid ONLY if:
     * 1. (from) does not block exit in DIRECTION.
     * 2. (to) does not block entry in REVERSE_DIRECTION.
     */
    public async canMove(
        from: Coord,
        to: Coord,
        direction: Direction,
        gameState: GameState
    ): Promise<boolean> {
        // Phase C3: If 'to' is not walkable (e.g. out of logic), handled by isWalkable
        if (!this.isWalkable(to.plane, to.x, to.y)) {
            return false;
        }

        const reverseDir = this.getReverseDirection(direction);

        // 1. Check Static Collision from SpatialSovereignty
        const fromLogic = this.spatial.getLogicAt(from.plane, from.x, from.y);
        const toLogic = this.spatial.getLogicAt(to.plane, to.x, to.y);

        // Exit check (from tile)
        if (typeof fromLogic === 'object' && fromLogic[direction] === false) {
            return false;
        }

        // Entry check (to tile)
        if (typeof toLogic === 'object' && toLogic[reverseDir] === false) {
            return false;
        }

        // Legacy bitmask check (0x100 = Blocked)
        if (typeof toLogic === 'number' && (toLogic & 0x100)) {
            return false;
        }

        return true;
    }

    /**
     * isWalkable - Phase C3: Deterministic Cross-Region Check.
     * Handles loaded logic fragments and the "No-Man's-Land" between them.
     */
    private isWalkable(p: number, x: number, z: number): boolean {
        // 1. Check if we have a spatial logic fragment for this region
        const mx = x >> 6;
        const my = z >> 6;
        const regionName = this.registry.getRegionName(mx, my);

        if (this.spatial.hasRegion(regionName)) {
            // Use precise collision matrix if loaded
            return this.spatial.isWalkable(p, x, z);
        }

        // 2. No-Man's-Land Protocol: If no logic fragment is present, 
        // we assume the tile is walkable to allow the agent to cross boundaries
        // until a new fragment is proactively loaded by the Orchestrator.
        return true; 
    }

    private heuristic(a: Coord, b: Coord): number {
        // Manhattan with a slight multiplier (admissible)
        return (Math.abs(a.x - b.x) + Math.abs(a.y - b.y)) * 1.01;
    }

    private getNeighbors(node: PathNode): { coord: Coord; direction: Direction }[] {
        return [
            { coord: { x: node.x, y: node.y + 1, plane: node.plane }, direction: 'north' },
            { coord: { x: node.x, y: node.y - 1, plane: node.plane }, direction: 'south' },
            { coord: { x: node.x + 1, y: node.y, plane: node.plane }, direction: 'east' },
            { coord: { x: node.x - 1, y: node.y, plane: node.plane }, direction: 'west' }
        ];
    }

    private getReverseDirection(dir: Direction): Direction {
        const map: Record<Direction, Direction> = {
            north: 'south',
            south: 'north',
            east: 'west',
            west: 'east'
        };
        return map[dir];
    }

    private reconstructPath(node: PathNode): Coord[] {
        const path: Coord[] = [];
        let curr: PathNode | undefined = node;
        while (curr) {
            path.unshift(curr.toCoord());
            curr = curr.parent;
        }
        return path;
    }
}

function currentKey(node: PathNode): string {
    return `${node.plane}_${node.x}_${node.y}`;
}
