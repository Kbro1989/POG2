import { readFileSync } from 'fs';
import { resolve } from 'path';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('KBDValidation');

// Correct RS3 World coordinate mapping constants
const AXIS_MAP = {
    WORLD_X: 'modelX', // East-West
    WORLD_Y: 'modelZ', // North-South
    WORLD_Z: 'modelY'  // Elevation
};

interface BoundingBox {
    minX: number; maxX: number;
    minY: number; maxY: number;
    minZ: number; maxZ: number;
}

// ─── CACHE EXTRACTION STUB ──────────────────────────────────────
// This simulates the rsmv/alt1cache extraction.
// Replace with actual cache.getKit(id).getModel().getAABB() when live.
async function extractKitAABBFromCache(kitId: number): Promise<BoundingBox> {
    logger.info(`Extracting kit_${kitId} AABB from cache...`);

    // Simulated known values based on table and typical Jagex fixed-point
    if (kitId === 0 || kitId === 3) {
        // Player base model (typically fits strictly inside 1x1 tile)
        // Assume Jagex uses 128 units per tile based on 1.0 collision padding
        return { minX: -64, maxX: 64, minY: 0, maxY: 180, minZ: -64, maxZ: 64 };
    }
    if (kitId === 420) {
        // KBD Body (large footprint)
        return { minX: -128, maxX: 128, minY: 0, maxY: 192, minZ: -143, maxZ: 143 };
    }
    if (kitId === 37641) {
        // KBD Head/Accessories
        return { minX: -68, maxX: 68, minY: 80, maxY: 172, minZ: -18, maxZ: 18 };
    }

    throw new Error(`Kit ${kitId} not mocked for extraction.`);
}

// ─── CORE CALIBRATION & VALIDATION LOGIC ────────────────────────

async function main() {
    logger.info('Starting KBD (Entity 239) Validation Sequence');

    // 1. Scale Calibration via Player Base Model (kit_0)
    const baseKitAabb = await extractKitAABBFromCache(0);
    const modelGroundWidth = baseKitAabb.maxX - baseKitAabb.minX;

    // Assuming the player base model strictly occupies a 1x1 tile footprint:
    const targetTileFootprint = 1.0;
    const scaleFactor = modelGroundWidth / targetTileFootprint;

    logger.info(`[Calibration] kit_0 ground width: ${modelGroundWidth} units`);
    logger.info(`[Calibration] Derived scale factor: ${scaleFactor} units/tile`);

    // 2. Extract KBD Kits & Composite AABB
    const kbdKits = [420, 37641];
    const compositeAABB: BoundingBox = {
        minX: Infinity, maxX: -Infinity,
        minY: Infinity, maxY: -Infinity,
        minZ: Infinity, maxZ: -Infinity
    };

    for (const kitId of kbdKits) {
        const aabb = await extractKitAABBFromCache(kitId);
        compositeAABB.minX = Math.min(compositeAABB.minX, aabb.minX);
        compositeAABB.maxX = Math.max(compositeAABB.maxX, aabb.maxX);
        compositeAABB.minY = Math.min(compositeAABB.minY, aabb.minY);
        compositeAABB.maxY = Math.max(compositeAABB.maxY, aabb.maxY);
        compositeAABB.minZ = Math.min(compositeAABB.minZ, aabb.minZ);
        compositeAABB.maxZ = Math.max(compositeAABB.maxZ, aabb.maxZ);
    }

    // 3. Map to World Tiles
    // Math.ceil is used to ensure partial tile overlaps are counted towards the footprint
    const tileFootprintX = Math.ceil((compositeAABB.maxX - compositeAABB.minX) / scaleFactor);
    const tileFootprintY = Math.ceil((compositeAABB.maxZ - compositeAABB.minZ) / scaleFactor); // Note: Model Z -> World Y
    const tileFootprintZ = Math.ceil((compositeAABB.maxY - compositeAABB.minY) / scaleFactor); // Note: Model Y -> World Z

    logger.info(`[Composite] KBD World Footprint: ${tileFootprintX}x${tileFootprintY} tiles (Height: ${tileFootprintZ})`);

    // 4. Validate against Havenhythe Bake
    const target = { x: 3712, y: 3328, plane: 0 };
    const matrixPath = resolveSovereignPath('atlas/spatial/havenhythe_collision_matrix.json');

    let matrixData;
    try {
        matrixData = JSON.parse(readFileSync(matrixPath, 'utf8')).matrices;
    } catch (e) {
        logger.error(`Could not load Havenhythe matrix at ${matrixPath}. Ensure bake is run first.`);
        return;
    }

    // Calculate footprint boundaries centered on target
    const halfWidth = Math.floor(tileFootprintX / 2);
    const halfDepth = Math.floor(tileFootprintY / 2);

    let isCollisionFree = true;
    const collisionPoints = [];

    logger.info(`[Validation] Scanning footprint [X: ${target.x - halfWidth} to ${target.x + halfWidth}] [Y: ${target.y - halfDepth} to ${target.y + halfDepth}]`);

    for (let dx = -halfWidth; dx <= halfWidth; dx++) {
        for (let dy = -halfDepth; dy <= halfDepth; dy++) {
            const checkX = target.x + dx;
            const checkY = target.y + dy;

            // Safe access into baked matrix
            const planeData = matrixData[target.plane.toString()];
            if (!planeData) continue;

            const rowData = planeData[checkY.toString()];
            const cellType = rowData ? rowData[checkX.toString()] : '?';

            // Based on CELL dictionary in collision bake
            if (cellType === 'X' || cellType === 'T' || cellType === '~' || cellType === '?') {
                isCollisionFree = false;
                collisionPoints.push({ x: checkX, y: checkY, type: cellType });
            }
        }
    }

    if (isCollisionFree) {
        logger.info(`✅ VALIDATION PASSED: KBD clears the Havenhythe collision bake at (${target.x}, ${target.y})`);
    } else {
        logger.info(`❌ VALIDATION FAILED: KBD footprint overlaps with solid geometry.`);
        logger.info(`Collisions detected at:`, collisionPoints);
    }
}

main().catch(console.error);

