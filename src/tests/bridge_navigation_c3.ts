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

async function testBridgeNavigationC3() {
    console.log('ðŸ§ª PHASE C3 TEST: Bridge Navigation (Inter-Regional Crossing)\n');

    const DB_PATH = 'D:\\sovereign\\vibe-learning-test.db';
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

    const atlasDir = path.join(getSovereignRoot(), 'atlas', 'spatial');

    // 1. Setup TWO regions with a 1-tile "No-Man's-Land" gap
    // Region A: Barrows (55, 51) - Bounds end at Y=3264
    // Region B: Barrows South (55, 50) - Bounds start at Y=3262
    // We will place a target in Region B and see if the pathfinder can bridge the gap.
    
    const barrowsPath = path.join(atlasDir, 'barrows_logic.json');
    const barrowsMatrix = JSON.parse(fs.readFileSync(barrowsPath, 'utf8'));
    // Ensure Barrows has a clear path to its southern exit
    barrowsMatrix.collision_matrix["0_3564_3264"] = { north: true, south: true, east: true, west: true };
    fs.writeFileSync(barrowsPath, JSON.stringify(barrowsMatrix));

    const barrowsSouthPath = path.join(atlasDir, 'm_55_50_logic.json');
    const barrowsSouthMatrix = {
        city: "m_55_50",
        meta: { bounds: { wx_min: 3520, wx_max: 3583, wy_min: 3200, wy_max: 3262 } },
        collision_matrix: {
            "0_3564_3262": { north: true, south: true, east: true, west: true },
            "0_3564_3260": { north: true, south: true, east: true, west: true }
        }
    };
    fs.writeFileSync(barrowsSouthPath, JSON.stringify(barrowsSouthMatrix));

    // 2. Initialize
    const spatial = SpatialSovereigntyLimb.getInstance();
    await spatial.initialize();
    await spatial.loadLogic('barrows');
    
    const worldForensics = new WorldForensicsLimb();
    await worldForensics.initialize();
    
    const lessonLearner = new LessonLearner(worldForensics, DB_PATH);
    const discovery = new DiscoveryLimb();
    const pathfinder = new DirectionalPathfinder(spatial);
    
    // Start at the southern edge of Barrows
    const avatar: Coord = { x: 3564, y: 3266, plane: 0 };
    const engine = new ExplorationEngine(avatar, discovery, pathfinder, spatial, lessonLearner);

    const gameState = { plane: 0, npcSpatialIndex: new Map(), npcMap: new Map(), objectMap: new Map(), players: [] } as any;

    console.log(`ðŸ“ Avatar at (${avatar.x}, ${avatar.y}) in Barrows.`);
    console.log(`ðŸŽ¯ Target is at (3564, 3260) in Barrows South.`);

    // 3. Mark everything as visited except the target to force a specific path
    for (let x = 3560; x < 3570; x++) {
        for (let y = 3261; y < 3300; y++) {
            discovery.markVisited(0, x, y);
        }
    }

    // 4. Trigger Movement Crossing
    console.log('\n--- Attempting Inter-Regional Crossing ---');
    
    // First tick: Orchestrator should load Barrows South
    await engine.tick(gameState);
    
    // Pathfinding happens in tick. Check if avatar moved SOUTH toward target.
    const finalPos = engine.getStats().lastPos;
    console.log(`   Final Position: (${finalPos.x}, ${finalPos.y})`);
    
    const movedSouth = finalPos.y < avatar.y;
    const bridgeSuccess = finalPos.y <= 3263; // Successfully crossed the 3264 boundary

    console.log(`\nðŸ” Bridge Audit:`);
    console.log(`   Moved South: ${movedSouth ? 'âœ… YES' : 'âŒ NO'}`);
    console.log(`   Crossed Boundary (Y=3264): ${bridgeSuccess ? 'âœ… YES' : 'âŒ NO'}`);
    console.log(`   Barrows South Logic Active: ${spatial.hasRegion('m_55_50') ? 'âœ… YES' : 'âŒ NO'}`);

    const SUCCESS_CRITERIA = {
        crossedBoundary: bridgeSuccess,
        orchestratorWorked: spatial.hasRegion('m_55_50'),
        noStuckStates: engine.getStats().moves > 0
    };

    console.log(`\nâœ… SUCCESS CRITERIA:`);
    console.log(`  Bridge Crossing successful: ${SUCCESS_CRITERIA.crossedBoundary ? 'âœ“' : 'âœ—'}`);
    console.log(`  Proactive Loading working: ${SUCCESS_CRITERIA.orchestratorWorked ? 'âœ“' : 'âœ—'}`);

    if (Object.values(SUCCESS_CRITERIA).every(v => v)) {
        console.log('\nðŸš€ PHASE C3 CHECKPOINT: PASSED\n');
    } else {
        console.log('\nâŒ PHASE C3 CHECKPOINT: FAILED\n');
        process.exit(1);
    }

    lessonLearner.close();
    worldForensics.close();
}

testBridgeNavigationC3().catch(console.error);
