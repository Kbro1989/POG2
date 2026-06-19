import { ExplorationEngine } from '../engines/spatial/ExplorationEngine.js';
import { DiscoveryLimb } from '../limbs/spatial/DiscoveryLimb.js';
import { DirectionalPathfinder } from '../limbs/spatial/DirectionalPathfinder.js';
import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { WorldForensicsLimb } from '../limbs/spatial/WorldForensicsLimb.js';
import { LessonLearner } from '../limbs/spatial/LessonLearner.js';
import { GameState, Coord } from '../core/models.js';
import { SpaceRegistry } from '../core/SpaceRegistry.js';
import * as fs from 'fs';
import * as path from 'path';
import { getSovereignRoot } from '../utils/SovereignPathResolver.js';

async function testGlobalDiscoveryC2() {
    console.log('ðŸ§ª PHASE C2 TEST: Global Frontier Discovery (3x3 View)\n');

    const DB_PATH = getVectorDbPath();
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

    const atlasDir = path.join(getSovereignRoot(), 'atlas', 'spatial');

    // 1. Setup TWO neighboring regions
    // Region A: Barrows (55, 51)
    // Region B: Barrows South (55, 50) - We'll add a walkable point here
    const barrowsSouthPath = path.join(atlasDir, 'm_55_50_logic.json');
    const barrowsSouthMatrix = {
        city: "m_55_50",
        meta: { bounds: { wx_min: 3520, wx_max: 3583, wy_min: 3200, wy_max: 3263 } },
        collision_matrix: {
            "0_3550_3250": 0 // A single walkable tile deep in the neighbor region
        }
    };
    fs.writeFileSync(barrowsSouthPath, JSON.stringify(barrowsSouthMatrix));

    // 2. Initialize
    const spatial = SpatialSovereigntyLimb.getInstance();
    await spatial.initialize();
    await spatial.loadLogic('barrows'); // Preload Barrows

    const worldForensics = WorldForensicsLimb.getInstance();
    await worldForensics.initialize();

    const lessonLearner = new LessonLearner(worldForensics, DB_PATH);
    const discovery = new DiscoveryLimb();
    const pathfinder = new DirectionalPathfinder(spatial);

    const avatar: Coord = { x: 3564, y: 3288, plane: 0 };
    const engine = new ExplorationEngine(avatar, discovery, pathfinder, spatial, lessonLearner);

    const gameState = { plane: 0, npcSpatialIndex: new Map(), npcMap: new Map(), objectMap: new Map(), players: [] } as any;

    console.log(`ðŸ“ Avatar at (${avatar.x}, ${avatar.y}) in Barrows.`);

    // 3. Mark Barrows corridor as visited to force scanning the neighbor
    console.log('ðŸ“Œ Simulating full exploration of current mapsquare...');
    for (let x = 3550; x < 3580; x++) {
        for (let y = 3280; y < 3300; y++) {
            discovery.markVisited(0, x, y);
        }
    }

    // 4. Trigger Global Discovery
    console.log('\n--- Triggering Global Discovery (3x3 Scan) ---');
    // Tick 0 will trigger FragmentOrchestrator to load Barrows South
    await engine.tick(gameState);

    const frontier = await discovery.getGlobalFrontier(0, avatar.x, avatar.y, spatial);
    const distantTarget = frontier.find(t => t.y < 3280); // Target in Barrows South (55, 50)

    console.log(`\nðŸ” Global Frontier Audit:`);
    console.log(`   Total unvisited tiles identified: ${frontier.length}`);
    console.log(`   Target found in neighboring region (Y < 3280): ${distantTarget ? 'âœ… YES' : 'âŒ NO'}`);
    if (distantTarget) {
        console.log(`   Distant Target: (${distantTarget.x}, ${distantTarget.y})`);
    }

    const SUCCESS_CRITERIA = {
        scanTripled: frontier.length > 0,
        detectedNeighbor: distantTarget !== undefined,
        orchestratorIntegrated: spatial.hasRegion('m_55_50')
    };

    console.log(`\nâœ… SUCCESS CRITERIA:`);
    console.log(`  Identified tiles across mapsquares: ${SUCCESS_CRITERIA.scanTripled ? 'âœ“' : 'âœ—'}`);
    console.log(`  Targeted neighbor region: ${SUCCESS_CRITERIA.detectedNeighbor ? 'âœ“' : 'âœ—'}`);
    console.log(`  Proactive loading integration: ${SUCCESS_CRITERIA.orchestratorIntegrated ? 'âœ“' : 'âœ—'}`);

    if (Object.values(SUCCESS_CRITERIA).every(v => v)) {
        console.log('\nðŸš€ PHASE C2 CHECKPOINT: PASSED\n');
    } else {
        console.log('\nâŒ PHASE C2 CHECKPOINT: FAILED\n');
        process.exit(1);
    }

    lessonLearner.close();
    worldForensics.close();
}

testGlobalDiscoveryC2().catch(console.error);

