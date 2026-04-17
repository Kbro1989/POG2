import { ExplorationEngine } from '../engines/spatial/ExplorationEngine.js';
import { DiscoveryLimb } from '../limbs/spatial/DiscoveryLimb.js';
import { DirectionalPathfinder } from '../limbs/spatial/DirectionalPathfinder.js';
import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { WorldForensicsLimb } from '../limbs/spatial/WorldForensicsLimb.js';
import { LessonLearner } from '../limbs/spatial/LessonLearner.js';
import { GameState, Coord } from '../core/models.js';
import * as fs from 'fs';

async function testPersistenceB3b() {
    console.log('ðŸ§ª PHASE B3b TEST: Persistence to vibe-learning.db\n');

    const DB_PATH = 'D:\\sovereign\\vibe-learning-test.db';
    if (fs.existsSync(DB_PATH)) fs.unlinkSync(DB_PATH);

    // 1. Initialize limbs
    const spatial = SpatialSovereigntyLimb.getInstance();
    await spatial.initialize();
    await spatial.loadLogic('barrows');
    
    const worldForensics = WorldForensicsLimb.getInstance();
    await worldForensics.initialize();
    
    const lessonLearner = new LessonLearner(worldForensics, DB_PATH);
    const discovery = new DiscoveryLimb();
    const pathfinder = new DirectionalPathfinder(spatial);
    
    const avatar: Coord = { x: 3564, y: 3288, plane: 0 };
    const engine = new ExplorationEngine(avatar, discovery, pathfinder, spatial, lessonLearner);

    // 2. Mock game state
    const gameState: GameState = {
        plane: 0,
        npcSpatialIndex: new Map(),
        npcMap: new Map(),
        objectMap: new Map(),
        players: []
    } as any;

    console.log(`ðŸ“ Starting exploration at (${avatar.x}, ${avatar.y})...\n`);

    // 3. Mark initial visit and run 5 ticks
    discovery.markVisited(avatar.plane, avatar.x, avatar.y);

    for (let i = 0; i < 5; i++) {
        await engine.tick(gameState);
    }

    // 4. Wait for async extractions to land in the log
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log(`\nðŸ’¾ Persisting to database...`);
    const startPersist = Date.now();
    const persisted = await lessonLearner.persistSession();
    const persistTime = Date.now() - startPersist;

    console.log(`   Persisted: ${persisted} tiles in ${persistTime}ms\n`);

    // 5. Verification - Query from DB
    const learned = lessonLearner.queryLearned(0);
    const summary = lessonLearner.getSummary();

    console.log(`âœ… DATABASE RESULTS:`);
    console.log(`  Session extraction log: ${summary.tilesLearned} (should be 0 after persist)`);
    console.log(`  Database tile count: ${summary.databaseTiles}`);
    console.log(`  Persistence time: ${persistTime}ms (target: <20ms)`);

    console.log(`\nðŸ“š QUERIED TILES FROM DB:`);
    learned.forEach((tile, i) => {
        console.log(`  Tile ${i+1}: (${tile.x}, ${tile.y}) -> ${tile.objects.length} objects`);
    });

    const SUCCESS_CRITERIA = {
        persisted5: persisted === 5,
        fastPersist: persistTime < 20,
        queryWorks: learned.length === 5,
        logCleared: summary.tilesLearned === 0
    };

    console.log(`\nâœ… SUCCESS CRITERIA:`);
    console.log(`  Persisted 5 tiles: ${SUCCESS_CRITERIA.persisted5 ? 'âœ“' : 'âœ—'}`);
    console.log(`  Persistence <20ms: ${SUCCESS_CRITERIA.fastPersist ? 'âœ“' : 'âœ—'}`);
    console.log(`  Query returns 5 tiles: ${SUCCESS_CRITERIA.queryWorks ? 'âœ“' : 'âœ—'}`);
    console.log(`  Session log cleared: ${SUCCESS_CRITERIA.logCleared ? 'âœ“' : 'âœ—'}`);

    const allPass = Object.values(SUCCESS_CRITERIA).every(v => v);

    if (allPass) {
        console.log('\nðŸš€ PHASE B3b CHECKPOINT: PASSED\n');
        lessonLearner.close();
        worldForensics.close();
    } else {
        console.log('\nâŒ PHASE B3b CHECKPOINT: FAILED\n');
        lessonLearner.close();
        worldForensics.close();
        process.exit(1);
    }
}

testPersistenceB3b().catch(console.error);
