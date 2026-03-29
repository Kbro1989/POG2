import { DiscoveryLimb } from '../limbs/spatial/DiscoveryLimb.js';
import { SpatialSovereigntyLimb } from '../limbs/spatial/SpatialSovereigntyLimb.js';

async function testDiscoveryLimb() {
    console.log('🧪 PHASE B1 TEST: DiscoveryLimb (Scan Only)\n');

    // 1. Initialize limbs
    const spatial = new SpatialSovereigntyLimb();
    await spatial.initialize();
    
    // Use the Barrows artifact we created in Phase A
    await spatial.loadLogic('barrows');
    
    const discovery = new DiscoveryLimb();

    // 2. Initial state
    const mx = 3564 >> 6;
    const my = 3288 >> 6;
    const plane = 0;

    let coverage = discovery.getCoverage(plane, mx, my);
    console.log(`📍 Step 0: Initial State`);
    console.log(`   Coverage: ${coverage.visited}/${coverage.total} (${coverage.percentage}%)`);

    // 3. Mark visit and check increment
    console.log(`\n📍 Step 1: Visiting Barrows Entrance [3564, 3288]`);
    discovery.markVisited(plane, 3564, 3288);
    
    coverage = discovery.getCoverage(plane, mx, my);
    console.log(`   Coverage: ${coverage.visited}/${coverage.total} (${coverage.percentage}%)`);

    // 4. Scan for unvisited walkable tiles
    console.log(`\n📍 Step 2: Scanning Mapsquare [${mx}, ${my}] for Frontier Tiles...`);
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

    console.log('\n✅ SUCCESS CRITERIA:');
    console.log(`  Marked visit correctly: ${visitedOne ? '✓' : '✗'}`);
    console.log(`  Found unvisited tiles: ${foundUnvisited ? '✓' : '✗'}`);
    console.log(`  Performant (<10ms): ${performant ? '✓' : '✗'}`);
    console.log(`  Visited tile excluded from frontier: ${firstTileExcluded ? '✓' : '✗'}`);

    if (visitedOne && foundUnvisited && performant && firstTileExcluded) {
        console.log('\n🚀 PHASE B1 CHECKPOINT: PASSED\n');
    } else {
        console.log('\n❌ PHASE B1 CHECKPOINT: FAILED\n');
        process.exit(1);
    }
}

testDiscoveryLimb().catch(console.error);
