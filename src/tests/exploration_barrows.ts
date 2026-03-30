import { ExplorationEngine } from '../engines/spatial/ExplorationEngine.js';
import { DiscoveryLimb } from '../limbs/spatial/DiscoveryLimb.js';
import { DirectionalPathfinder } from '../limbs/spatial/DirectionalPathfinder.js';
import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { GameState, Coord } from '../core/models.js';

async function testExplorationBarrows() {
    console.log('🧪 PHASE B2 TEST: Autonomous Exploration (5 Iterations)\n');

    // 1. Initialize limbs
    const spatial = new SpatialSovereigntyLimb();
    await spatial.initialize();
    await spatial.loadLogic('barrows');
    
    const discovery = new DiscoveryLimb();
    const pathfinder = new DirectionalPathfinder(spatial);
    
    // Starting coordinate: Barrows Entrance [3564, 3288, 0]
    const avatar: Coord = { x: 3564, y: 3288, plane: 0 };
    
    const engine = new ExplorationEngine(avatar, discovery, pathfinder, spatial, undefined as any);

    // 2. Mark initial position
    discovery.markVisited(avatar.plane, avatar.x, avatar.y);

    // 3. Mock game state
    const gameState: GameState = {
        plane: 0,
        npcSpatialIndex: new Map(),
        npcMap: new Map(),
        objectMap: new Map(),
        players: []
    } as any;

    console.log(`📍 Starting at (${avatar.x}, ${avatar.y})`);
    const initialCoverage = discovery.getCoverage(avatar.plane, avatar.x >> 6, avatar.y >> 6).visited;

    // 4. Run 5 ticks (each tick moves 1 step)
    let movesSuccessful = 0;
    for (let i = 0; i < 5; i++) {
        const canContinue = await engine.tick(gameState);
        if (!canContinue) {
            console.log(`\n❌ Exploration halted early at move ${i}`);
            break;
        }
        movesSuccessful++;
    }

    // 5. Success Criteria
    const stats = engine.getStats();
    const finalCoverage = discovery.getCoverage(avatar.plane, avatar.x >> 6, avatar.y >> 6).visited;
    
    const movedInCorridor = stats.moves === 5;
    const coverageIncremented = finalCoverage > initialCoverage;
    const withinBounds = avatar.x >= 3550 && avatar.x <= 3580 && avatar.y >= 3280 && avatar.y <= 3300;

    console.log('\n✅ SUCCESS CRITERIA:');
    console.log(`  Completed 5 moves: ${movedInCorridor ? '✓' : '✗'} (Actual: ${stats.moves})`);
    console.log(`  Coverage incremented: ${coverageIncremented ? '✓' : '✗'} (${initialCoverage} -> ${finalCoverage})`);
    console.log(`  Within Barrows corridor: ${withinBounds ? '✓' : '✗'} (${avatar.x}, ${avatar.y})`);

    if (movedInCorridor && coverageIncremented && withinBounds) {
        console.log('\n🚀 PHASE B2 CHECKPOINT: PASSED\n');
        console.log(`📊 FINAL POSITION: (${avatar.x}, ${avatar.y})`);
        console.log(`📊 TOTAL MOVES: ${stats.moves}`);
    } else {
        console.log('\n❌ PHASE B2 CHECKPOINT: FAILED\n');
        process.exit(1);
    }
}

testExplorationBarrows().catch(console.error);
