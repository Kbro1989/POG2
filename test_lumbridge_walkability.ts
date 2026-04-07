import { SpatialSovereigntyLimb } from './src/limbs/spatial/SpatialSovereigntyLimb.js';
import * as path from 'path';
import * as fs from 'fs';

async function test() {
    console.log('--- Lumbridge Spatial Verification ---');
    const spatial = SpatialSovereigntyLimb.getInstance();
    
    // 1. Manually ensure mapsquare 50, 50 is loaded
    // Lumbridge is around 3222, 3222 -> 3222 >> 6 = 50.
    const x = 3222;
    const y = 3222;
    const plane = 0;
    
    console.log(`Checking coord (${x}, ${y}, plane ${plane})...`);
    await spatial.ensureMapsquare(x, y);
    
    const audit = spatial.auditTile(plane, x, y);
    console.log('Audit Result:', JSON.stringify(audit, null, 2));
    
    const walkable = spatial.isWalkable(plane, x, y);
    console.log(`Is Walkable: ${walkable}`);
    
    if (audit.collisionType === 'mapsquare_fragment') {
        console.log('SUCCESS: Grounded in real mapsquare fragment.');
    } else {
        console.log('FAILURE: Not grounded in fragment.');
    }
}

test().catch(console.error);
