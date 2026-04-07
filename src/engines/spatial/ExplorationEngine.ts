import { Coord, GameState } from '../../core/models.js';
import { DiscoveryLimb } from '../../limbs/spatial/DiscoveryLimb.js';
import { DirectionalPathfinder } from '../../limbs/spatial/DirectionalPathfinder.js';
import { SpatialSovereigntyLimb } from '../../limbs/spatial/SpatialSovereigntyLimb.js';
import { LessonLearner } from '../../limbs/spatial/LessonLearner.js';
import { FragmentOrchestrator } from '../../limbs/spatial/FragmentOrchestrator.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('ExplorationEngine');

/**
 * ExplorationEngine - Phase B2: The "MIND" of the organism.
 * 
 * Responsibilities:
 * 1. Orchestrates the Move-Tick loop.
 * 2. Selects the nearest unvisited "Frontier" tile.
 * 3. Handles stuck detection and tile blacklisting.
 * 4. Enforces single-mapsquare constraints.
 */
export class ExplorationEngine {
    private avatar: Coord;
    private discovery: DiscoveryLimb;
    private pathfinder: DirectionalPathfinder;
    private spatial: SpatialSovereigntyLimb;
    private lessonLearner: LessonLearner;
    private orchestrator: FragmentOrchestrator;
    
    private blacklist: Set<string> = new Set();
    private stuckCount = 0;
    private readonly maxStuckAttempts = 3;
    private moveCount = 0;
    private readonly maxMoves = 3000; // Increased for longer-range autonomous sessions
    private readonly explorationRadius = 1; // 1 = 3x3 mapsquares (192x192 tiles)

    constructor(
        avatar: Coord,
        discovery: DiscoveryLimb,
        pathfinder: DirectionalPathfinder,
        spatial: SpatialSovereigntyLimb,
        lessonLearner: LessonLearner
    ) {
        this.avatar = avatar;
        this.discovery = discovery;
        this.pathfinder = pathfinder;
        this.spatial = spatial;
        this.lessonLearner = lessonLearner;
        this.orchestrator = new FragmentOrchestrator(spatial);
    }

    /**
     * tick - Single autonomous movement step.
     */
    public async tick(gameState: GameState): Promise<boolean> {
        if (this.moveCount >= this.maxMoves) {
            logger.warn(`Max moves (${this.maxMoves}) reached. Stalling.`);
            return false;
        }

        // 0. Proactive Regional Loading (Phase C1)
        // Triple view needs collision fragments loaded before we scan
        const prevLoaded = this.orchestrator.getLoadedCount();
        await this.orchestrator.update(this.avatar);
        
        if (this.orchestrator.getLoadedCount() > prevLoaded) {
            // Wait briefly for disk I/O to settle and matrices to populate
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // 1. Select nearest frontier target
        const target = await this.selectTarget();
        if (!target) {
            logger.info('No more frontier tiles in current mapsquare. Exploration complete.');
            return false;
        }

        // Defensive Guard: Ensure target has a valid coordinate structure (Phase 41)
        if (target.x === undefined || target.y === undefined) {
            logger.error({ target }, 'Resolved target is missing coordinates. C3 Boundary escape contained.');
            return false; // Safely stall instead of crashing
        }

        const targetKey = `${target.plane}_${target.x}_${target.y}`;

        
        // 2. Pathfind to target
        const path = await this.pathfinder.findPath(
            { x: this.avatar.x, y: this.avatar.y, plane: this.avatar.plane },
            target,
            gameState,
            false // No debug spam during autonomous loop
        );

        if (path.length === 0) {
            logger.warn({ target }, 'Target unreachable. Blacklisting.');
            this.blacklist.add(targetKey);
            this.stuckCount++;
            
            if (this.stuckCount >= this.maxStuckAttempts) {
                logger.error('Too many unreachable targets. Exploration stalled.');
                return false;
            }
            return true; // Try again next tick with a different target
        }

        // 3. Execute one step along the path
        // path[0] is current position, path[1] is the next step
        const nextStep = path[1] || path[0];
        
        // Boundary Check: Ensure we stay within our "Tripled" awareness radius
        if (!this.isWithinView(this.avatar, nextStep)) {
            logger.warn({ nextStep }, 'Movement would exit exploration radius. Boundaries enforced.');
            return false;
        }

        this.avatar.x = nextStep.x;
        this.avatar.y = nextStep.y;
        this.avatar.plane = nextStep.plane;

        // 4. Update Discovery
        this.discovery.markVisited(this.avatar.plane, this.avatar.x, this.avatar.y);
        
        // Phase B3a: Async Extraction (non-blocking)
        this.lessonLearner.learnTile(this.avatar.plane, this.avatar.x, this.avatar.y)
            .catch(err => logger.error({ err, x: this.avatar.x, y: this.avatar.y }, 'Extraction failed. Continuing exploration.'));

        this.moveCount++;

        // Reset stuck count on successful move
        this.stuckCount = 0;

        const coverage = this.discovery.getCoverage(this.avatar.plane, this.avatar.x >> 6, this.avatar.y >> 6);
        
        if (this.avatar.x === target.x && this.avatar.y === target.y) {
            logger.info(`Reached goal (${target.x}, ${target.y}). Coverage: ${coverage.percentage}%`);
        } else {
            logger.info(`Step ${this.moveCount}: Now at (${this.avatar.x}, ${this.avatar.y}). Target: (${target.x}, ${target.y})`);
        }

        return true;
    }

    /**
     * selectTarget - Phase C2: Picks the nearest unvisited walkable tile in the 3x3 view.
     */
    private async selectTarget(): Promise<Coord | null> {
        const frontier = await this.discovery.getGlobalFrontier(
            this.avatar.plane,
            this.avatar.x,
            this.avatar.y,
            this.spatial
        );

        // Filter out blacklisted tiles
        const validFrontier = frontier.filter(t => !this.blacklist.has(`${t.plane}_${t.x}_${t.y}`));
        
        if (validFrontier.length === 0) return null;

        // Nearest-Neighbor Selection
        let nearest = validFrontier[0];
        let minDistance = this.calculateManhattan(this.avatar, nearest);

        for (const tile of validFrontier) {
            const dist = this.calculateManhattan(this.avatar, tile);
            if (dist < minDistance) {
                minDistance = dist;
                nearest = tile;
            }
        }

        return nearest;
    }

    private calculateManhattan(a: Coord, b: Coord): number {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    }

    private isWithinView(a: Coord, b: Coord): boolean {
        const ax = a.x >> 6;
        const ay = a.y >> 6;
        const bx = b.x >> 6;
        const by = b.y >> 6;
        return Math.abs(ax - bx) <= this.explorationRadius && Math.abs(ay - by) <= this.explorationRadius;
    }

    public getStats(): any {
        return {
            moves: this.moveCount,
            avatar: { x: this.avatar.x, y: this.avatar.y, plane: this.avatar.plane },
            blacklistSize: this.blacklist.size
        };
    }
}
