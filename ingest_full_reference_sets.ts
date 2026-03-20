import { readFileSync, existsSync } from 'fs';
import { loadConfig } from './src/config/SovereignConfig.js';
import { ModelClient } from './src/clients/ModelClient.js';
import { PedagogyLimb } from './src/limbs/technical/PedagogyLimb.js';
import { VectorPedagogyLimb } from './src/limbs/technical/VectorPedagogyLimb.js';
import { createLogger } from './src/utils/logger.js';

import { TernaryRouter } from './src/routing/TernaryRouter.js';
import { VectorDB } from './src/utils/VectorDB.js';

const logger = createLogger('ReferenceIngest');

async function main() {
    // Point to the local project-level config if it exists, otherwise fallback
    const configPath = existsSync('.pog2-config.json') ? '.pog2-config.json' : 'config.json';
    const config = loadConfig(configPath);
    
    const router = new TernaryRouter(config);
    const client = new ModelClient(config, router);
    const vectorDb = new VectorDB({ client });
    
    // Explicitly initialize VectorDB substrate
    const dbInitRes = vectorDb.initialize();
    if (!dbInitRes.ok) {
        logger.error({ error: dbInitRes.error.message }, 'Failed to initialize VectorDB.');
        process.exit(1);
    }
    
    const pedagogy = new PedagogyLimb(router, vectorDb, client);

    const referenceFiles = [
        'equipment_by_slot.json',
        'npcs.json',
        'objects.json',
        'pedagogy_profile.json'
    ];

    logger.info('Starting Full Reference Dataset Ingestion');

    for (const file of referenceFiles) {
        if (!existsSync(file)) {
            logger.warn({ file }, 'Reference file not found. Skipping.');
            continue;
        }

        try {
            logger.info({ file }, 'Processing Reference File');
            const rawData = JSON.parse(readFileSync(file, 'utf8'));
            
            // 1. Generate Reference Profile (This automatically triggers vector ingestion via PedagogyLimb)
            const profileRes = await pedagogy.analyzeReferenceDataset(file, rawData);
            
            if (profileRes.ok) {
                logger.info({ file }, 'Successfully analyzed and anchored reference dataset.');
            } else {
                logger.error({ file, error: profileRes.error.message }, 'Analysis failed for reference.');
            }
        } catch (e) {
            logger.error({ file, error: (e as Error).message }, 'Critical error in reference ingest.');
        }
    }

    pedagogy.close();
    logger.info('Reference Ingestion Complete.');
}

main().catch(err => {
    logger.error({ err }, 'Reference ingest main failure');
    process.exit(1);
});
