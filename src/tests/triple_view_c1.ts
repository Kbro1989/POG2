import { ExplorationEngine } from '../engines/spatial/ExplorationEngine.js';
import { DiscoveryLimb } from '../limbs/spatial/DiscoveryLimb.js';
import { DirectionalPathfinder } from '../limbs/spatial/DirectionalPathfinder.js';
import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { WorldForensicsLimb } from '../limbs/spatial/WorldForensicsLimb.js';
import { LessonLearner } from '../limbs/spatial/LessonLearner.js';
import { GameState, Coord } from '../core/models.js';
import * as fs from 'fs';
import * as path from 'path';
import { getSovereignRoot } from '../utils/SovereignPathResolver.js';

async function testTripleViewC1() {
    console.log('ðŸ§ª PHASE C1 TEST: Triple View & Fragment Orchestration\n');

    const DB_PATH = 'D:\\sovereign\\vibe-learning-test.db';
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

    // 0. Mock a neighboring region to test orchestration
    // Avatar starts at (3564, 3288), which is in (55, 51) mapsquare
    // Neighbors would be (54,50) through (56,52)
    const atlasDir = path.join(getSovereignRoot(), 'atlas', 'spatial');
    const neighborPath = path.join(atlasDir, 'm_55_50_logic.json'); // Direct neighbor
    
    // Create a dummy neighbor if it doesn't exist
    if (!fs.existsSync(neighborPath)) {
        const dummyMatrix = {
            city: "m_55_50",
            meta: { bounds: { wx_min: 3520, wx_max: 3583, wy_min: 3200, wy_max: 3263 } },
            collision_matrix: {}
        };
        fs.writeFileSync(neighborPath, JSON.stringify(dummyMatrix));
        console.log(`ðŸ“ Created mock neighbor fragment: ${neighborPath}`);
    }

    // 1. Initialize limbs
    const spatial = SpatialSovereigntyLimb.getInstance();
    await spatial.initialize();
    // Only preload Barrows; neighbor should be proactively loaded by Orchestrator
    await spatial.loadLogic('barrows');
    
    const worldForensics = new WorldForensicsLimb();
    await worldForensics.initialize();
    
    const lessonLearner = new LessonLearner(worldForensics, DB_PATH);
    const discovery = new DiscoveryLimb();
    const pathfinder = new DirectionalPathfinder(spatial);
    
    // Avatar at the BOTTOM edge of Barrows mapsquare (Y=3288)
    // Decreasing Y will move us into the (55, 51) -> (55, 50) boundary
    const avatar: Coord = { x: 3564, y: 3288, plane: 0 };
    const engine = new ExplorationEngine(avatar, discovery, pathfinder, spatial, lessonLearner);

    const gameState: GameState = {
        plane: 0,
        npcSpatialIndex: new Map(),
        npcMap: new Map(),
        objectMap: new Map(),
        players: []
    } as any;

    console.log(`ðŸ“ Starting Triple-View exploration at (${avatar.x}, ${avatar.y})...\n`);

    // 2. Run first tick - This should trigger Orchestrator to load neighbors
    console.log('--- Tick 1: Triggering Orchestration ---');
    await engine.tick(gameState);

    // 3. Verify neighbor was loaded
    const isNeighborLoaded = spatial.hasRegion('m_55_50');
    console.log(`\nðŸ” Regional Audit:`);
    console.log(`   Neighbor (m_55_50) loaded: ${isNeighborLoaded ? 'âœ… YES' : 'âŒ NO'}`);

    // 4. Run more ticks to confirm stability
    for (let i = 0; i < 4; i++) {
        await engine.tick(gameState);
    }

    const SUCCESS_CRITERIA = {
        orchestrationTriggered: isNeighborLoaded,
        noCrashes: true,
        movesCompleted: engine.getStats().moves >= 5
    };

    console.log(`\nâœ… SUCCESS CRITERIA:`);
    console.log(`  Proactive Loading working: ${SUCCESS_CRITERIA.orchestrationTriggered ? 'âœ“' : 'âœ—'}`);
    console.log(`  Stability (Moves >5): ${SUCCESS_CRITERIA.movesCompleted ? 'âœ“' : 'âœ—'}`);

    if (SUCCESS_CRITERIA.orchestrationTriggered && SUCCESS_CRITERIA.movesCompleted) {
        console.log('\nðŸš€ PHASE C1 CHECKPOINT: PASSED\n');
        lessonLearner.close();
        worldForensics.close();
    } else {
        console.log('\nâŒ PHASE C1 CHECKPOINT: FAILED\n');
        lessonLearner.close();
        worldForensics.close();
        process.exit(1);
    }
}

testTripleViewC1().catch(console.error);
