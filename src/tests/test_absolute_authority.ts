import { SpatialSovereigntyLimb, FLAG_OVERLAY, FLAG_WATER, FLAG_BLOCKED } from '../limbs/spatial/SpatialSovereigntyLimb.js';
import * as fs from 'fs';
import * as path from 'path';
import { getSovereignRoot } from '../utils/SovereignPathResolver.js';

async function testAbsoluteAuthority() {
    console.log('🧪 PHASE 41 TEST: Absolute Spatial Authority Verification\n');

    const spatial = SpatialSovereigntyLimb.getInstance();
    const atlasDir = path.join(getSovereignRoot(), 'atlas', 'spatial', 'world_extract');

    if (!fs.existsSync(atlasDir)) {
        fs.mkdirSync(atlasDir, { recursive: true });
    }

    // --- CASE 1: Bitwise Ingestion Merging ---
    const msX = 50;
    const msZ = 50;
    const testFile = path.join(atlasDir, `ms_${msX}_${msZ}.json`);
    
    // Simulate cache fragments (partial data)
    const fragmentData = {
        tiles: [
            { x: 0, z: 0, plane: 0, collision: FLAG_WATER, height: 10 },  // Fragment 1: Water
            { x: 0, z: 0, plane: 0, collision: FLAG_OVERLAY, height: 10 }, // Fragment 2: Bridge Overlay
            { x: 1, z: 1, plane: 0, collision: FLAG_BLOCKED, height: 0 }, 
            { x: 1, z: 1, plane: 0, collision: 0x0, height: 0 }
        ]
    };

    fs.writeFileSync(testFile, JSON.stringify(fragmentData));
    console.log(`📝 Generated test mapsquare fragment: ms_${msX}_${msZ}.json`);

    await spatial.loadMapsquare(msX, msZ);

    // --- CASE 2: Absolute Priority Resolver (Overlay > Water > Terrain) ---
    const worldX = (msX << 6) + 0;
    const worldY = (msZ << 6) + 0;
    
    const stack = spatial.resolveSurfaceStack(worldX, worldY);
    const layer0 = stack.layers.find(l => l.plane === 0);

    console.log(`\n🛡️  Tile (0, 0, 0) Audit:`);
    console.log(`   Expected Type: bridge (Overlay Priority)`);
    console.log(`   Resolved Type: ${layer0?.type}`);
    console.log(`   Walkable:      ${layer0?.walkable}`);

    const SUCCESS_CRITERIA = {
        overlayPriority: layer0?.type === 'bridge',
        walkableBridge: layer0?.walkable === true,
        bitwiseMerge: (spatial.getLogicAt(0, worldX, worldY) as number) === (FLAG_WATER | FLAG_OVERLAY)
    };

    console.log(`\n✅ SUCCESS CRITERIA:`);
    console.log(`   Overlay > Water (Priority): ${SUCCESS_CRITERIA.overlayPriority ? '✔️' : '❌'}`);
    console.log(`   Bridge is Walkable:      ${SUCCESS_CRITERIA.walkableBridge ? '✔️' : '❌'}`);
    console.log(`   Bitwise OR Merge:        ${SUCCESS_CRITERIA.bitwiseMerge ? '✔️' : '❌'}`);

    if (Object.values(SUCCESS_CRITERIA).every(v => v)) {
        console.log('\n🚀 PHASE 41 CHECKPOINT: PASSED\n');
    } else {
        console.log('\n❌ PHASE 41 CHECKPOINT: FAILED\n');
        process.exit(1);
    }
}

testAbsoluteAuthority().catch(console.error);

