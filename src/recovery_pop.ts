/**
 * POG2 Recovery Script: Surgical Vertical Pop & Splat Purge
 * 
 * Objective: Resolve Clipping Desync (Entombment) in the 2026 Beta substrate.
 */

import { GlobalOffsetRegistry } from './utils/GlobalOffsetRegistry.js';
import { GhostSplatEngine } from './substrates/GhostSplatEngine.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger('RecoveryScript');

async function runRecovery() {
    logger.info('--- INITIATING SOVEREIGN RECOVERY SEQUENCE ---');

    // 1. Get Authorities
    const registry = GlobalOffsetRegistry.getInstance();
    const splatEngine = GhostSplatEngine.getInstance();

    // 2. Execute Vertical Pop
    // This clears the $Z_{current}$ mesh collision floor.
    logger.info('Action 1: Triggering Vertical Z-Pop (Substrate-Aware)...');
    // Using current stuck coordinates: Region 49_50
    await registry.pop(3138, 3202, 0);

    // 3. Purge Ghost Memory
    // This prevents the 'Ghost Wall' (Red Splat) feedback loop from pinning us back down.
    logger.info('Action 2: Purging Persistent Splat Heat (Red Splats)...');
    splatEngine.purgePersistentHeat();

    // 4. Stabilize Neural Link (Throttle Splat Compute)
    // Alleviating GPU pressure to prevent MCP Neural Link timeouts (-32001).
    logger.info('Action 3: Setting Splat Throttle to 250ms (Thermal Safety)...');
    splatEngine.setThrottle(250);

    // 5. Final State Report
    const offset = registry.getCurrentOffset();
    logger.info({ 
        finalOffset: offset,
        groundingTimestamp: offset.timestamp,
        substrateStatus: 'GROUNDING_RESET_COMPLETE'
    }, '--- RECOVERY COMPLETE: POG2 IS CLEAR OF GEOMETRY ---');

    process.exit(0);
}

runRecovery().catch(err => {
    logger.error({ err }, 'Recovery failed.');
    process.exit(1);
});
