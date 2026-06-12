import { KinematicProbeLimb } from '../limbs/spatial/KinematicProbeLimb.js';
import { SovereignInteractionLimb } from '../limbs/spatial/SovereignInteractionLimb.js';
import * as fs from 'fs';

async function runBumperTest() {
    console.log("== Sovereign Forensic Probe: Lumbridge Bumper Test ==");
    
    // 1. Initialize Limbs
    const interactionLimb = new SovereignInteractionLimb();
    const kinematicLimb = new KinematicProbeLimb();
    kinematicLimb.setInteractionLimb(interactionLimb);

    // 2. Load Local 10/10 Floor (ms_50_50)
    const mapData = JSON.parse(fs.readFileSync('public/ms_50_50.json', 'utf8'));
    kinematicLimb.setCollisionMap(mapData);
    
    // Modern Matrix Lookup (replacing legacy .tiles.find)
    let wallTile: any = null;
    if (mapData.collision_matrix) {
        // Find a tile with some specific blocking
        const keys = Object.keys(mapData.collision_matrix);
        // Look for 3221_3219 (near Hans) as a target
        if (mapData.collision_matrix["3221_3219_0"]) {
            wallTile = { x: 3221, z: 3219, plane: 0, ...mapData.collision_matrix["3221_3219_0"] };
        } else {
            // Fallback: search for first blocked tile
            for (const key of keys) {
                const t = mapData.collision_matrix[key];
                if (t.walkable === false || (t.edges && (t.edges.northBlocked || t.edges.southBlocked))) {
                    const coords = key.split('_').map(Number);
                    wallTile = { x: coords[0], z: coords[1], plane: coords[2] || 0, ...t };
                    break;
                }
            }
        }
    } else if (mapData.tiles) {
        wallTile = mapData.tiles.find((t: any) => (t.collision & 128) || t.walkable === false);
    }
    
    if (!wallTile) {
        console.error("No suitable collision wall found in ms_50_50. Aborting.");
        return;
    }

    console.log(`Target Bumper Tile Found: ${JSON.stringify(wallTile)}`);

    // 3. Spawn Probe at Adjacent Tile
    const startX = wallTile.x - 1; // 1 tile West
    const startZ = wallTile.z;
    kinematicLimb.spawnProbe(1, 'MOUSE', { x: startX, z: startZ, plane: wallTile.plane });
    interactionLimb.registerProbe(1, 3597, { x: startX, z: startZ, plane: wallTile.plane });

    // 4. Run Simulation Ticks
    console.log("Starting Simulation Pass...");
    for (let tick = 0; tick < 5; tick++) {
        console.log(`\n--- Tick ${tick} ---`);
        kinematicLimb.update(0.6); // 1 RS Tick (approx)
        interactionLimb.onTick();
        
        // Manual verification check for the test
        // In a real run, kinematicLimb would call interactionLimb.notifyBump()
    }

    console.log("\n✅ Bumper Pass Complete.");
}

runBumperTest();

