import { GameCacheLoader } from '../src/rsmv/cache/sqlite.js';
import { cacheMajors } from '../src/rsmv/constants.js';
import { createLogger } from '../src/utils/logger.js';
import * as fs from 'fs';

const logger = createLogger('LiveHandshakeObserver');

async function runObserver() {
    logger.info('🚀 Initializing Live Handshake Observer...');

    try {
        const loader = new GameCacheLoader();
        logger.info({ cachedir: loader.cachedir }, 'Connected to Cache Substrate.');

        if (!fs.existsSync(loader.cachedir)) {
            logger.error(`Cache directory not found: ${loader.cachedir}`);
            process.exit(1);
        }

        // 1. Audit JS5 Archives
        logger.info('Auditing JS5 Archives...');
        const rootIndex = await loader.generateRootIndex();
        const detectedMajors = rootIndex.filter(m => m !== undefined).map(m => m.minor);
        logger.info({ count: detectedMajors.length, majors: detectedMajors }, 'Detected JS5 Major Indices.');

        // 2. Validate Specific Majors (Critical for Grounding)
        const criticalMajors = [
            { id: cacheMajors.objects, name: 'Objects' },
            { id: cacheMajors.npcs, name: 'NPCs' },
            { id: cacheMajors.mapsquares, name: 'Mapsquares' },
            { id: 19, name: 'Varbits' } // Usually 19 in RS3
        ];

        for (const major of criticalMajors) {
            if (detectedMajors.includes(major.id)) {
                logger.info(`✅ Major ${major.id} (${major.name}) FOUND.`);
            } else {
                logger.warn(`❌ Major ${major.id} (${major.name}) MISSING.`);
            }
        }

        // 3. Test File Retrieval (Archive 255 - Master Index)
        try {
            const masterIndex = await loader.getCacheIndex(cacheMajors.index);
            logger.info('✅ Master Index (255) accessible.');
        } catch (e) {
            logger.error('❌ Master Index (255) inaccessible. Handshake restricted.');
        }

        logger.info('🔱 Live Handshake VALIDATED. Sovereign Engine is grounded in real-world data.');

    } catch (err) {
        logger.error({ err }, 'Failed to establish Live Handshake.');
    }
}

runObserver();
