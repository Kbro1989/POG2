import { DirectionalPathfinder } from '../limbs/spatial/DirectionalPathfinder.js';
import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { GameState } from '../core/models.js';

async function testBarrowsPathfinding() {
  console.log('🧪 PATHFINDING TEST: Barrows Entrance → Dharok Sarcophagus\n');

  // 1. Initialize limbs
  const spatial = new SpatialSovereigntyLimb();
  await spatial.initialize();
  
  // Directly load the barrows-specific logic artifact if it exists
  // For the purpose of this test, we assume the artifact 'barrows_logic.json' is in the atlas/spatial dir.
  // In the real system, SpatialSovereigntyLimb.loadLogic() pulls this.
  await spatial.loadLogic('barrows'); 

  const pathfinder = new DirectionalPathfinder(spatial);

  // 2. Create mock game state
  const gameState: GameState = {
    plane: 0,
    npcSpatialIndex: new Map(),
    npcMap: new Map(),
    objectMap: new Map(),
    players: []
  } as any;

  // 3. Test Parameters: Barrows Entrance (approx) to Dharok Sarcophagus
  // Using the coordinates from the user request: [3564, 3288, 0] -> [3556, 3289, 0]
  const start = { x: 3564, y: 3288, plane: 0 };
  const goal = { x: 3556, y: 3289, plane: 0 };

  console.log(`📍 Start: (${start.x}, ${start.y})`);
  console.log(`📍 Goal:  (${goal.x}, ${goal.y})\n`);

  // 4. Run Pathfinding
  console.log('--- ALPHA TILE AUDIT ---');
  const targetTiles = [
    { x: 3564, y: 3288 }, { x: 3563, y: 3288 }, { x: 3562, y: 3288 },
    { x: 3561, y: 3288 }, { x: 3560, y: 3288 }, { x: 3559, y: 3288 },
    { x: 3558, y: 3288 }, { x: 3557, y: 3288 }, { x: 3556, y: 3288 },
    { x: 3556, y: 3289 }
  ];

  for (const tile of targetTiles) {
      const audit = spatial.auditTile(0, tile.x, tile.y);
      console.log(`  Tile (${tile.x}, ${tile.y}): Walkable=${audit.walkable}, Type=${audit.collisionType}`);
  }
  console.log('------------------------\n');

  const startTime = Date.now();
  const path = await pathfinder.findPath(start, goal, gameState, true);
  const elapsed = Date.now() - startTime;

  console.log(`\n⏱️  Elapsed: ${elapsed}ms`);
  console.log(`📏 Path Length: ${path.length} nodes\n`);

  // 5. Verify Success Criteria
  const pathFound = path.length > 0;
  const reachedGoal = pathFound && path[path.length - 1].x === goal.x && path[path.length - 1].y === goal.y;
  const reasonableTime = elapsed < 100;

  console.log('✅ SUCCESS CRITERIA:');
  console.log(`  Path found: ${pathFound ? '✓' : '✗'}`);
  console.log(`  Reached goal: ${reachedGoal ? '✓' : '✗'}`);
  console.log(`  Performant (<100ms): ${reasonableTime ? '✓' : '✗'}`);

  if (pathFound && reachedGoal && reasonableTime) {
    console.log('\n🚀 PHASE A CHECKPOINT: PASSED\n');
    console.log('Sample Path Segments:');
    path.slice(0, 5).forEach((p, i) => console.log(`  ${i}: (${p.x}, ${p.y})`));
    console.log('  ...');
    console.log(`  ${path.length-1}: (${path[path.length-1].x}, ${path[path.length-1].y})`);
  } else {
    console.log('\n❌ PHASE A CHECKPOINT: FAILED\n');
    if (!pathFound) console.log('  Reason: No path found by A* engine.');
    if (pathFound && !reachedGoal) console.log('  Reason: Path found but goal was not reached.');
    if (pathFound && !reasonableTime) console.log('  Reason: Pathfinding took too long (>100ms).');
    process.exit(1);
  }
}

testBarrowsPathfinding().catch(err => {
    console.error('Test Execution Failed:', err);
    process.exit(1);
});
