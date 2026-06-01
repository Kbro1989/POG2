import fs from 'fs';
import path from 'path';
import { CORE_SIZE } from '../limbs/spatial/SpatialSovereigntyLimb.js';

const TRANSFORM_DIR = 'D:/sovereign/atlas/spatial/unified_extract/';
const OUTPUT_FILE = 'D:/sovereign/atlas/spatial/collision_radar.bin';

// RS3 NXT Map Constants
const WORLD_SIZE = 16384; 
const GRID_SIZE = CORE_SIZE; // NXT: 64-tile playable core per mapsquare axis

async function synthesize() {
    console.log("Initializing Global Collision Radar (16384x16384)...");
    
    // 256MB Buffer (1 byte per tile)
    const collisionRadar = Buffer.alloc(WORLD_SIZE * WORLD_SIZE, 0);
    
    const files = fs.readdirSync(TRANSFORM_DIR);
    let processed = 0;

    for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        const m = file.match(/ms_(\d+)_(\d+)\.json/);
        if (!m) continue;
        
        const msX = parseInt(m[1]);
        const msZ = parseInt(m[2]);
        
        const content = JSON.parse(fs.readFileSync(path.join(TRANSFORM_DIR, file), 'utf8'));
        
        if (content.tiles) {
            content.tiles.forEach((tile: any) => {
                // We only care about Plane 0 for the base "Radar"
                if (tile.plane !== 0) return;
                
                const absX = (msX * GRID_SIZE) + tile.x;
                const absZ = (msZ * GRID_SIZE) + tile.z;
                
                if (absX >= 0 && absX < WORLD_SIZE && absZ >= 0 && absZ < WORLD_SIZE) {
                    const index = (absX * WORLD_SIZE) + absZ;
                    // Bitwise OR to accumulate collision flags (e.g. wall + object)
                    collisionRadar[index] |= tile.collision;
                }
            });
        }
        
        processed++;
        if (processed % 50 === 0) console.log(`Processed ${processed}/${files.length} mapsquares...`);
    }

    console.log(`Writing binary radar to ${OUTPUT_FILE}...`);
    fs.writeFileSync(OUTPUT_FILE, collisionRadar);
    console.log("Synthesis Complete.");
}

synthesize().catch(console.error);

