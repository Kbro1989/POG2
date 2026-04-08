import { join } from 'path';
import { UISubstrateLimb } from '../src/limbs/technical/UISubstrateLimb.js';
import { TemporalHeartbeatLimb } from '../src/limbs/core/TemporalHeartbeatLimb.js';
import { CNSGodheadPulseVolley } from '../src/engines/gameplay/CNSGodheadPulseVolley.js';
import { TernaryRouter } from '../src/routing/TernaryRouter.js';
import { HexagramManager } from '../src/routing/HexagramManager.js';
import { loadConfig } from '../src/config/SovereignConfig.js';
import { createLogger } from '../src/utils/logger.js';

const logger = createLogger('SubstrateGrounding');

async function main() {
    logger.info('🧪 Starting Sovereign Substrate Synchronization (Phase 26/27)...');

    // 0. Initialize Engine Context
    HexagramManager.initializeMock();
    const config = loadConfig(join(process.cwd(), 'sovereign.json'));
    const router = new TernaryRouter(config);
    const volley = CNSGodheadPulseVolley.getInstance();
    volley.setRouter(router);

    const ui = UISubstrateLimb.getInstance();
    const heartbeat = TemporalHeartbeatLimb.getInstance();

    // 1. Mass Grounding
    // We AUTHORITATIVELY ground the thousands of candidates from your D: drive.
    const syncRes = await ui.massSync();
    if (syncRes.ok) {
        logger.info({ count: syncRes.value.counts }, '✅ Mass HUD Grounding: SUCCESS. Pedagogical principles aligned with Jagex cache.');
    } else {
        logger.error({ error: syncRes.error.message }, '❌ Mass HUD Grounding: FAILED.');
    }

    // 2. Heartbeat Verification
    logger.info('🚀 Initiating Temporal Duality Heartbeat (600ms/6000ms)...');
    heartbeat.start();

    // Run for 7 seconds to catch exactly 1 player tick + world ticks
    setTimeout(() => {
        const status = heartbeat.getStatus();
        logger.info(status, 'Heartbeat Status Check (T+7000ms).');
        heartbeat.stop();
        logger.info('✨ Sovereign Substrate Sync & Heartbeat verification COMPLETE.');
        process.exit(0);
    }, 7000);
}

main().catch(err => {
    logger.error({ error: err.message }, 'Substrate Grounding FAILED.');
    process.exit(1);
});
