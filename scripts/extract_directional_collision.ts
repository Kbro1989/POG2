import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

// Resolve paths to rsmv substrate (Sovereign Inspector)
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rsmv_ROOT = 'D:\\sovereign\\cache_pedagogy\\rsmv_inspector';
const POG_ROOT = path.resolve(__dirname, '..');

// Import rsmv logic from the Sovereign substrate
const { GameCacheLoader } = require(path.join(rsmv_ROOT, 'dist/cache/sqlite.js'));
const { parse } = require(path.join(rsmv_ROOT, 'dist/opdecoder.js'));

async function extractDirectionalCollision(regionId: number) {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape";
    const loader = new GameCacheLoader(cachePath);

    // 1. Resolve coordinates from region ID
    const x = (regionId >> 8) & 0xFF;
    const y = regionId & 0xFF;
    const mapIndex = 5; // Maps index

    // 2. Locate map files (js5-5)
    // In RS3, Map squares are sub-files in Index 5
    // Format: m[x]_[y] for terrain, l[x]_[y] for locations
    const terrainFileId = await loader.getFileId(mapIndex, `m${x}_${y}`);
    const locationFileId = await loader.getFileId(mapIndex, `l${x}_${y}`);

    if (!terrainFileId || !locationFileId) {
        console.error(`Could not find map files for region ${regionId}`);
        return;
    }

    const terrainData = await loader.getFile(mapIndex, terrainFileId);
    const locationData = await loader.getFile(mapIndex, locationFileId);

    const terrain = parse.mapsquareTiles.read(terrainData, loader);
    const locations = parse.mapsquareLocations.read(locationData, loader);

    // 3. Synthesis Matrix
    const matrix: any = {};

    // Process Terrain first (Level 0)
    for (let i = 0; i < terrain.tiles.length; i++) {
        const tile = terrain.tiles[i];
        const tx = i % 64;
        const ty = Math.floor(i / 64) % 64;
        const plane = Math.floor(i / 4096);

        const key = `${plane}_${tx}_${ty}`;
        matrix[key] = {
            north: true, south: true, east: true, west: true,
            npc_only: []
        };

        // Bit 0x1: Blocked
        if (tile.settings & 0x1) {
            matrix[key] = { north: false, south: false, east: false, west: false, npc_only: [] };
        }
    }

    // Process Locations (Walls & Objects)
    for (const locGroup of locations.locations) {
        const objId = locGroup.id;
        const objDef = await getObjectDef(loader, objId);

        if (!objDef.maybe_blocks_movement) continue;

        for (const use of locGroup.uses) {
            const key = `${use.plane}_${use.x}_${use.y}`;
            if (!matrix[key]) continue;

            const rotation = use.rotation;
            const type = use.type;

            // Type 0-3: Wall logic
            if (type >= 0 && type <= 3) {
                if (rotation === 0) matrix[key].west = false;
                if (rotation === 1) matrix[key].north = false;
                if (rotation === 2) matrix[key].east = false;
                if (rotation === 3) matrix[key].south = false;
            }
            // Type 10: Standard Object (Full Block)
            else if (type === 10) {
                matrix[key].north = matrix[key].south = matrix[key].east = matrix[key].west = false;
            }
        }
    }

    // 4. Export Artifact
    const outPath = path.join(POG_ROOT, 'atlas', 'spatial', `directional_${regionId}.json`);
    fs.writeFileSync(outPath, JSON.stringify(matrix, null, 2));
    console.log(`Exported Directional Sovereignty for ${regionId} to ${outPath}`);
}

async function getObjectDef(loader: any, id: number) {
    const data = await loader.getFile(2, id); // Index 2 = Configs
    return parse.object.read(data, loader);
}

// Example: Prifddinas (8755)
extractDirectionalCollision(8755).catch(console.error);
