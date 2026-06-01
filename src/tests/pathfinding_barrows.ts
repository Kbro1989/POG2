import { DirectionalPathfinder } from '../limbs/spatial/DirectionalPathfinder.js';
import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import { GameState } from '../core/models.js';

async function testBarrowsPathfinding() {
  console.log('ðŸ§ª PATHFINDING TEST: Barrows Entrance â†’ Dharok Sarcophagus\n');

  // 1. Initialize limbs
  const spatial = SpatialSovereigntyLimb.getInstance();
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

  console.log(`ðŸ“ Start: (${start.x}, ${start.y})`);
  console.log(`ðŸ“ Goal:  (${goal.x}, ${goal.y})\n`);

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

  const mockState: any = { npcSpatialIndex: new Map(), plane: 0 };
  const startTime = Date.now();
  const path = pathfinder.findPath(start, goal, mockState, true);
  const elapsed = Date.now() - startTime;

  console.log(`\nâ±ï¸  Elapsed: ${elapsed}ms`);
  console.log(`ðŸ“ Path Length: ${path.length} nodes\n`);

  // 5. Verify Success Criteria
  const pathFound = path.length > 0;
  const reachedGoal = pathFound && path[path.length - 1].x === goal.x && path[path.length - 1].y === goal.y;
  const reasonableTime = elapsed < 100;

  console.log('âœ… SUCCESS CRITERIA:');
  console.log(`  Path found: ${pathFound ? 'âœ“' : 'âœ—'}`);
  console.log(`  Reached goal: ${reachedGoal ? 'âœ“' : 'âœ—'}`);
  console.log(`  Performant (<100ms): ${reasonableTime ? 'âœ“' : 'âœ—'}`);

  if (pathFound && reachedGoal && reasonableTime) {
    console.log('\nðŸš€ PHASE A CHECKPOINT: PASSED\n');
    console.log('Sample Path Segments:');
    path.slice(0, 5).forEach((p, i) => console.log(`  ${i}: (${p.x}, ${p.y})`));
    console.log('  ...');
    console.log(`  ${path.length-1}: (${path[path.length-1].x}, ${path[path.length-1].y})`);
  } else {
    console.log('\nâŒ PHASE A CHECKPOINT: FAILED\n');
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

