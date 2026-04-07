import { DiscoveryLimb } from '../limbs/spatial/DiscoveryLimb.js';
import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';

async function testDiscoveryLimb() {
    console.log('ðŸ§ª PHASE B1 TEST: DiscoveryLimb (Scan Only)\n');

    // 1. Initialize limbs
    const spatial = SpatialSovereigntyLimb.getInstance();
    await spatial.initialize();
    
    // Use the Barrows artifact we created in Phase A
    await spatial.loadLogic('barrows');
    
    const discovery = new DiscoveryLimb();

    // 2. Initial state
    const mx = 3564 >> 6;
    const my = 3288 >> 6;
    const plane = 0;

    let coverage = discovery.getCoverage(plane, mx, my);
    console.log(`ðŸ“ Step 0: Initial State`);
    console.log(`   Coverage: ${coverage.visited}/${coverage.total} (${coverage.percentage}%)`);

    // 3. Mark visit and check increment
    console.log(`\nðŸ“ Step 1: Visiting Barrows Entrance [3564, 3288]`);
    discovery.markVisited(plane, 3564, 3288);
    
    coverage = discovery.getCoverage(plane, mx, my);
    console.log(`   Coverage: ${coverage.visited}/${coverage.total} (${coverage.percentage}%)`);

    // 4. Scan for unvisited walkable tiles
    console.log(`\nðŸ“ Step 2: Scanning Mapsquare [${mx}, ${my}] for Frontier Tiles...`);
    const startTime = Date.now();
    const unvisited = await discovery.getUnvisitedWalkableTiles(plane, mx, my, spatial);
    const elapsed = Date.now() - startTime;

    console.log(`   Scan Time: ${elapsed}ms`);
    console.log(`   Unvisited Walkable Tiles Found: ${unvisited.length}`);

    // 5. Success Criteria
    const visitedOne = coverage.visited === 1;
    const foundUnvisited = unvisited.length > 0;
    const performant = elapsed < 10;
    const firstTileExcluded = !unvisited.some(t => t.x === 3564 && t.y === 3288);

    console.log('\nâœ… SUCCESS CRITERIA:');
    console.log(`  Marked visit correctly: ${visitedOne ? 'âœ“' : 'âœ—'}`);
    console.log(`  Found unvisited tiles: ${foundUnvisited ? 'âœ“' : 'âœ—'}`);
    console.log(`  Performant (<10ms): ${performant ? 'âœ“' : 'âœ—'}`);
    console.log(`  Visited tile excluded from frontier: ${firstTileExcluded ? 'âœ“' : 'âœ—'}`);

    if (visitedOne && foundUnvisited && performant && firstTileExcluded) {
        console.log('\nðŸš€ PHASE B1 CHECKPOINT: PASSED\n');
    } else {
        console.log('\nâŒ PHASE B1 CHECKPOINT: FAILED\n');
        process.exit(1);
    }
}

testDiscoveryLimb().catch(console.error);
