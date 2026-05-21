import { SpatialSovereigntyLimb } from '../src/limbs/spatial/SpatialSovereigntyLimb.js';
import { GameState } from '../src/core/models.js';
import { createLogger } from '../src/utils/logger.js';

const logger = createLogger('GroundingAudit');

async function auditGrounding() {
    logger.info('🧐 Performing Spatial Grounding Audit...');

    try {
        const spatial = SpatialSovereigntyLimb.getInstance();
        await spatial.initialize();

        // Mocking a state retrieval or connecting to a live session would go here.
        // For this audit, we'll try to find the latest player position from the engine.
        // In a live environment, we'd pull from the GameState.
        
        // Since I don't have the "Live" state in this script context, I'll check the
        // last known coordinate from the radar output or common start points.
        // The user's terminal showed the player at a specific spot.
        
        // We'll simulate the check for a range around the hub.
        const testCoords = [
            { x: 10048, y: 10048, plane: 0 }, // Common sandbox start
        ];

        for (const coord of testCoords) {
            await spatial.ensureMapsquare(coord.x, coord.y);
            const terrainZ = spatial.getAltitude(coord.plane, coord.x, coord.y);
            
            // In RS3, 'height' is often stored as 1/32 of world units or similar.
            // SpatialSovereigntyLimb.getAltitude returns raw world units (height * 32).
            
            logger.info({ 
                coord, 
                terrainAltitude: terrainZ,
                scaledHeight: terrainZ / 32
            }, 'Grounding Check Result');

            if (terrainZ === 0) {
                logger.warn('⚠️ Terrain altitude is 0. Mapsquare might be missing or tile is at sea level.');
            }
        }

        logger.info('🔱 Audit complete.');

    } catch (err) {
        logger.error({ err }, 'Failed to perform grounding audit.');
    }
}

auditGrounding();
