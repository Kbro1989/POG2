/**
 * POG2 Verification Script: Post-Recovery Grounding Audit
 */

import { GlobalOffsetRegistry } from './utils/GlobalOffsetRegistry.js';
import { GameplaySovereigntyLimb } from './limbs/spatial/GameplaySovereigntyLimb.js';
import { SpatialSovereigntyLimb } from './limbs/spatial/SpatialSovereigntyLimb.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('GroundingAudit');

async function verify() {
    logger.info('--- COMMENCING POST-RECOVERY GROUNDING AUDIT ---');

    const registry = GlobalOffsetRegistry.getInstance();
    const gameplay = GameplaySovereigntyLimb.getInstance();
    const spatial = SpatialSovereigntyLimb.getInstance();

    await spatial.initialize();
    
    // Authoritatively load the current region for the audit
    const rx = 3138 >> 6;
    const ry = 3202 >> 6;
    await spatial.loadMapsquare(rx, ry);

    const offset = registry.getCurrentOffset();
    const rawPos = gameplay.avatar.coord;
    const groundedPos = registry.applyOffset(rawPos.x, rawPos.y, rawPos.plane);

    logger.info({
        raw: rawPos,
        offset: offset,
        grounded: groundedPos
    }, 'Current Spatial Anchors');

    // Check walkability at grounded position
    const isWalkable = spatial.isWalkable(groundedPos.plane, groundedPos.x, groundedPos.y);
    const altitude = spatial.getAltitude(groundedPos.plane, groundedPos.x, groundedPos.y);

    if (isWalkable) {
        logger.info({ altitude, isWalkable }, 'âœ… GROUNDING VERIFIED: Agent is in a navigable coordinate.');
    } else {
        const mask = spatial.getLegacyMask(groundedPos.plane, groundedPos.x, groundedPos.y);
        logger.warn({ altitude, isWalkable, mask: mask.toString(16) }, 'âš ï¸  STILL BLOCKED: Agent might be hovering or the pop was insufficient.');
        
        // Audit neighbors to see if we can move out
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                if (dx === 0 && dy === 0) continue;
                const nx = groundedPos.x + dx;
                const ny = groundedPos.y + dy;
                const nw = spatial.isWalkable(groundedPos.plane, nx, ny);
                if (nw) {
                    logger.info({ x: nx, y: ny }, 'Escape path found at neighbor tile.');
                }
            }
        }
    }

    process.exit(0);
}

verify().catch(err => {
    logger.error({ err }, 'Audit failed.');
    process.exit(1);
});

