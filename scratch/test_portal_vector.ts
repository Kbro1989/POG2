import {
    SovereignPortalBridge,
    RSCDataLoader,
    RS3ObjectDecoder,
    UnifiedPortalRegistry,
    WorldAnchor
} from '../src/convergence/index.js';
import { InterfaceRuntimeLimb } from '../src/limbs/spatial/InterfaceRuntimeLimb.js';
import { createLogger } from '../src/utils/logger.js';
import * as fs from 'fs';
import { join } from 'path';

const logger = createLogger('PortalVectorTest');

async function verifyLumbridgeCastleVectors() {
    logger.info('🚀 Starting Portal Convergence Verification...');

    try {
        // 1. Initialize Components
        const rscLoader = new RSCDataLoader();
        await rscLoader.loadAll();

        const rs3Decoder = new RS3ObjectDecoder();
        const registry = new UnifiedPortalRegistry();

        // Seed registry from our verified data
        const dataPath = join('POG2', 'src', 'convergence', 'data', 'lumbridge_castle.json');
        if (fs.existsSync(dataPath)) {
            const raw = fs.readFileSync(dataPath, 'utf8');
            const { portals } = JSON.parse(raw);
            portals.forEach((p: any) => registry.register(p));
            logger.info(`Seeded registry with ${portals.length} portals from ${dataPath}`);
        }

        const bridge = new SovereignPortalBridge(rscLoader, rs3Decoder, registry);

        // Initialize Runtime for validation scripts
        const runtime = InterfaceRuntimeLimb.getInstance();
        await runtime.initialize().catch(() => logger.warn('Runtime init failed (expected in headless)'));

        // Vector 1: RSC Surface → RS3 Upper (The "Sovereign Leap")
        logger.info('Testing Vector 1: RSC Surface (50,50) → RS3 Upper...');
        const anchor1: WorldAnchor = {
            world: 'RSC',
            x: 50,
            y: 50,
            plane: 0,
            region: 'Lumbridge Castle'
        };

        const transition1 = await bridge.resolveTransition(anchor1, 'Climb up');

        if (transition1 && transition1.destination.world === 'RS3' && transition1.destination.plane === 1) {
            logger.info('✅ Vector 1 Verified: RSC Surface → RS3 Upper conversion successful.');
        } else {
            logger.error(`❌ Vector 1 Failed: ${JSON.stringify(transition1)}`);
        }

        // Vector 2: RS3 Surface → RS3 Upper (Native RS3 Transition)
        logger.info('Testing Vector 2: RS3 Surface (3229,3224) → RS3 Upper...');
        const anchor2: WorldAnchor = {
            world: 'RS3',
            x: 3229,
            y: 3224,
            plane: 0,
            region: 'Lumbridge Castle'
        };

        const transition2 = await bridge.resolveTransition(anchor2, 'Climb up');

        if (transition2 && transition2.destination.plane === 1) {
            logger.info('✅ Vector 2 Verified: Native RS3 transition successful.');
        } else {
            logger.error(`❌ Vector 2 Failed: ${JSON.stringify(transition2)}`);
        }

    } catch (error: any) {
        logger.error(`FATAL: Test failed: ${error.message}`);
        process.exit(1);
    }
}

verifyLumbridgeCastleVectors();
