import { Coord, Direction, DirectionalCollision, NPC, GameObject, GameState } from '../../core/models.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('DirectionalPathfinder');

export class DirectionalPathfinder {
    /**
     * canMove
     * 
     * THE SOVEREIGN NAVIGATION RULE:
     * A move from (x1, y1) to (x2, y2) is valid ONLY if:
     * 1. (x1, y1) does not block exit in DIRECTION.
     * 2. (x2, y2) does not block entry in REVERSE_DIRECTION.
     * 3. (x2, y2) is not blocked for the specific entity type (NPC/Player).
     */
    public static async canMove(
        from: Coord, 
        to: Coord, 
        entityType: 'player' | 'npc',
        context: GameState,
        collisionMatrix: Map<string, DirectionalCollision>
    ): Promise<boolean> {
        const direction = this.getDirection(from, to);
        const reverseDir = this.getReverseDirection(direction);

        const fromKey = `${from.plane}_${from.x}_${from.y}`;
        const toKey = `${to.plane}_${to.x}_${to.y}`;

        const fromCollision = collisionMatrix.get(fromKey);
        const toCollision = collisionMatrix.get(toKey);

        // 1. Check Exit Block (Static + Dynamic)
        if (fromCollision && !this.checkDirection(fromCollision, direction)) {
            logger.debug({ from, direction }, 'Movement blocked: Exit direction is restricted');
            return false;
        }

        // 2. Check Entry Block (Static + Dynamic)
        if (toCollision && !this.checkDirection(toCollision, reverseDir)) {
            logger.debug({ to, reverseDir }, 'Movement blocked: Entry direction is restricted');
            return false;
        }

        // 3. Check Entity Guard (NPC Only)
        if (entityType === 'npc' && toCollision?.npc_only_blocks?.includes(direction)) {
            logger.debug({ to, direction }, 'Movement blocked: NPC-only barrier detected');
            return false;
        }

        return true;
    }

    private static checkDirection(collision: DirectionalCollision, dir: Direction): boolean {
        return (collision as any)[dir] !== false;
    }

    private static getDirection(from: Coord, to: Coord): Direction {
        if (to.y > from.y) return 'north';
        if (to.y < from.y) return 'south';
        if (to.x > from.x) return 'east';
        if (to.x < from.x) return 'west';
        return 'north'; // Default
    }

    private static getReverseDirection(dir: Direction): Direction {
        const map: Record<Direction, Direction> = {
            north: 'south',
            south: 'north',
            east: 'west',
            west: 'east'
        };
        return map[dir];
    }

    /**
     * findPath (A*)
     * Simplified quaternary A* for worker environments.
     */
    public async findPath(
        start: Coord,
        end: Coord,
        entityType: 'player' | 'npc',
        context: GameState,
        collisionMatrix: Map<string, DirectionalCollision>
    ): Promise<Coord[]> {
        // ... A* logic implementation ...
        // This would use the canMove checks above for every neighbor expansion.
        return [start, end]; // TODO: Full implementation
    }
}
