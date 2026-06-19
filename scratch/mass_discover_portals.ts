import { CacheForensicsLimb } from '../src/limbs/spatial/CacheForensicsLimb.js';
import { WorldForensicsLimb, GameObjectInstance } from '../src/limbs/spatial/WorldForensicsLimb.js';
import { RS3ObjectDecoder } from '../src/convergence/RS3ObjectDecoder.js';
import { RSCDataLoader } from '../src/convergence/RSCDataLoader.js';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Parse CLI args (very basic parsing for this script)
const args = process.argv.slice(2);
const regionArgIndex = args.indexOf('--regions');
if (regionArgIndex === -1 || !args[regionArgIndex + 1]) {
    console.error('Usage: npx tsx scratch/mass_discover_portals.ts --regions <region1,region2...>');
    process.exit(1);
}

const regionsToScan = args[regionArgIndex + 1].split(',').map(r => r.trim().toLowerCase());

// Region chunk definitions
const REGION_CHUNKS: Record<string, { x: number, z: number }[]> = {
    varrock: [
        { x: 50, z: 53 }, { x: 51, z: 53 }, { x: 52, z: 53 },
        { x: 50, z: 54 }, { x: 51, z: 54 }, { x: 52, z: 54 },
        { x: 50, z: 55 }, { x: 51, z: 55 }, { x: 52, z: 55 }
    ], // Note: I'm expanding the chunk range to catch the whole city/sewers
    falador: [
        { x: 46, z: 52 }, { x: 47, z: 52 }, { x: 48, z: 52 },
        { x: 46, z: 53 }, { x: 47, z: 53 }, { x: 48, z: 53 }
    ],
    edgeville: [
        { x: 48, z: 54 }, { x: 48, z: 55 }
    ],
    alkharid: [
        { x: 51, z: 49 }, { x: 52, z: 49 },
        { x: 51, z: 50 }, { x: 52, z: 50 }
    ],
    draynor: [
        { x: 48, z: 50 }, { x: 49, z: 50 },
        { x: 48, z: 51 }, { x: 49, z: 51 }
    ]
};

export interface StagedPortal {
    objectId: number;
    name: string;
    actions: string[];
    varbitId?: number;
    varpId?: number;
    spawns?: Array<{ x: number; y: number; plane: number; chunkX: number; chunkZ: number }>;
    source: 'heuristic' | 'canonical' | 'map_parser';
    confidence: number;
}

async function run() {
    console.log('--- Sovereign Mass Portal Discovery ---');
    
    const worldForensics = new WorldForensicsLimb();
    const initRes = await worldForensics.initialize();
    if (!initRes.ok) {
        console.error('Failed to initialize WorldForensicsLimb:', initRes.error);
        process.exit(1);
    }

    const rscLoader = new RSCDataLoader();
    await rscLoader.initialize();

    // We need CacheForensicsLimb for the decoder
    const cacheForensics = new CacheForensicsLimb();
    await cacheForensics.initialize();

    // Mock registry for the decoder since we are just extracting, not registering
    const dummyRegistry: any = { register: () => {} };
    const decoder = new RS3ObjectDecoder(cacheForensics, dummyRegistry);

    const stagingDir = join(process.cwd(), 'scratch', 'staging');
    if (!existsSync(stagingDir)) {
        mkdirSync(stagingDir, { recursive: true });
    }

    for (const region of regionsToScan) {
        console.log(`\n>> Scanning Region: ${region.toUpperCase()}`);
        const chunks = REGION_CHUNKS[region];
        if (!chunks) {
            console.warn(`No chunk definitions for region: ${region}`);
            continue;
        }

        const uniqueObjectIds = new Set<number>();
        const spawnsByObjId = new Map<number, Array<{ x: number; y: number; plane: number; chunkX: number; chunkZ: number }>>();

        // 1. Scan chunks for spawns
        let mapParserAvailable = true;
        for (const chunk of chunks) {
            for (let plane = 0; plane < 4; plane++) {
                const locsRes = await worldForensics.senseLocations(chunk.x, chunk.z, plane);
                if (locsRes.ok && Array.isArray(locsRes.value)) {
                    for (const loc of locsRes.value) {
                        uniqueObjectIds.add(loc.id);
                        if (!spawnsByObjId.has(loc.id)) {
                            spawnsByObjId.set(loc.id, []);
                        }
                        spawnsByObjId.get(loc.id)!.push({
                            x: loc.worldX,
                            y: loc.worldZ,
                            plane,
                            chunkX: chunk.x,
                            chunkZ: chunk.z
                        });
                    }
                } else {
                    mapParserAvailable = false;
                }
            }
        }

        if (uniqueObjectIds.size === 0) {
            console.warn(`Map parser returned 0 objects for ${region}. SQLite binding likely unavailable.`);
            // Fallback: discoverCandidateIds
            // But since CacheForensicsLimb is likely also broken, we must gracefully yield empty.
            console.warn(`Degrading gracefully to definition-only... but CacheForensicsLimb may also be degraded.`);
        }

        console.log(`Found ${uniqueObjectIds.size} unique objects in ${region}. Running heuristic decoder...`);

        // 2. Discover portals via heuristics
        const stagedPortals: StagedPortal[] = [];
        let discoveredCount = 0;

        for (const id of uniqueObjectIds) {
            const probeRes = await decoder.probeObject(id);
            if (probeRes.ok) {
                const heuristic = probeRes.data;
                discoveredCount++;
                const def = await worldForensics.getObjectDefinition(id).catch(() => ({ name: 'Unknown' }));
                
                stagedPortals.push({
                    objectId: id,
                    name: def.name,
                    actions: def.name !== 'null' ? ['Enter'] : [], 
                    varbitId: heuristic.triggerType === 'VARBIT' ? heuristic.validationScript : undefined,
                    varpId: heuristic.triggerType === 'VARP' ? heuristic.validationScript : undefined,
                    spawns: spawnsByObjId.get(id),
                    source: 'map_parser',
                    confidence: 0.9
                });
            }
        }

        console.log(`Discovered ${discoveredCount} portals in ${region}!`);

        const outPath = join(stagingDir, `${region}.json`);
        writeFileSync(outPath, JSON.stringify(stagedPortals, null, 2));
        console.log(`[SUCCESS] Staged ${stagedPortals.length} portals to ${outPath}`);
    }

    worldForensics.close();
    cacheForensics.close();
    console.log('\n--- Mass Discovery Complete ---');
}

run().catch(console.error);
