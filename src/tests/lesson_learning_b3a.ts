import { ExplorationEngine } from '../engines/spatial/ExplorationEngine.js';
import { DiscoveryLimb } from '../limbs/spatial/DiscoveryLimb.js';
import { DirectionalPathfinder } from '../limbs/spatial/DirectionalPathfinder.js';
import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { WorldForensicsLimb } from '../limbs/spatial/WorldForensicsLimb.js';
import { LessonLearner } from '../limbs/spatial/LessonLearner.js';
import { GameState, Coord } from '../core/models.js';

async function testLessonLearningB3a() {
    console.log('ðŸ§ª PHASE B3a TEST: Lesson Learning (Extraction Only)\n');

    // 1. Initialize limbs
    const spatial = SpatialSovereigntyLimb.getInstance();
    await spatial.initialize();
    await spatial.loadLogic('barrows');
    
    // Initialize WorldForensics for extraction
    const worldForensics = new WorldForensicsLimb();
    await worldForensics.initialize();
    
    const lessonLearner = new LessonLearner(worldForensics);
    const discovery = new DiscoveryLimb();
    const pathfinder = new DirectionalPathfinder(spatial);
    
    // Starting coordinate: Barrows Entrance [3564, 3288, 0]
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

    console.log(`ðŸ“ Starting at (${avatar.x}, ${avatar.y})\n`);

    // 3. Mark initial visit and run 5 ticks
    discovery.markVisited(avatar.plane, avatar.x, avatar.y);

    for (let i = 0; i < 5; i++) {
        await engine.tick(gameState);
    }

    // 4. Wait a moment for async extraction to complete (since it's non-blocking)
    await new Promise(resolve => setTimeout(resolve, 200));

    // 5. Verification
    const summary = lessonLearner.getSummary();
    const learned: any[] = (lessonLearner as any).learnedTiles ? Array.from((lessonLearner as any).learnedTiles.values()) : [];

    console.log(`\nâœ… LEARNING RESULTS:`);
    console.log(`  Tiles learned: ${summary.tilesLearned}`);
    console.log(`  Total objects found: ${summary.totalObjects}`);

    console.log(`\nðŸ“š SAMPLE LEARNED TILES:`);
    learned.forEach((tile: any, i) => {
        console.log(`  Step ${i+1}: (${tile.x}, ${tile.y}) -> ${tile.objects.length} objects, flags=0x${tile.terrainFlags.toString(16)}`);
        tile.objects.forEach((obj: unknown) => console.log(`    - [${(obj as any).id}] ${(obj as any).name} (type ${(obj as any).type})`));
    });

    const SUCCESS_CRITERIA = {
        learnedCount: summary.tilesLearned >= 5,
        foundObjects: summary.totalObjects > 0,
        validCoordinates: learned.every(t => t.x >= 3550 && t.y >= 3280)
    };

    console.log(`\nâœ… SUCCESS CRITERIA:`);
    console.log(`  Learned â‰¥5 tiles: ${SUCCESS_CRITERIA.learnedCount ? 'âœ“' : 'âœ—'}`);
    console.log(`  Found objects: ${SUCCESS_CRITERIA.foundObjects ? 'âœ“' : 'âœ—'}`);
    console.log(`  Valid coordinates: ${SUCCESS_CRITERIA.validCoordinates ? 'âœ“' : 'âœ—'}`);

    if (SUCCESS_CRITERIA.learnedCount && SUCCESS_CRITERIA.foundObjects) {
        console.log('\nðŸš€ PHASE B3a CHECKPOINT: PASSED\n');
        worldForensics.close();
    } else {
        console.log('\nâŒ PHASE B3a CHECKPOINT: FAILED\n');
        worldForensics.close();
        process.exit(1);
    }
}

testLessonLearningB3a().catch(console.error);
