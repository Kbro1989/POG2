import { readFileSync, existsSync } from 'fs';
import { loadConfig } from './src/config/SovereignConfig.js';
import { ModelClient } from './src/clients/ModelClient.js';
import { PedagogyLimb } from './src/limbs/technical/PedagogyLimb.js';
import { VectorPedagogyLimb } from './src/limbs/technical/VectorPedagogyLimb.js';
import { createLogger } from './src/utils/logger.js';

const logger = createLogger('ReferenceIngest');

async function main() {
    const config = loadConfig('config.json');
    const client = new ModelClient(config);
    const pedagogy = new PedagogyLimb();
    const vectorPedagogy = new VectorPedagogyLimb(client);

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
            
            // 1. Generate Reference Profile
            const profileRes = await pedagogy.analyzeReferenceDataset(file, rawData);
            
            if (profileRes.ok) {
                // 2. Ingest into VectorDB
                const ingestRes = await vectorPedagogy.ingestProfile(profileRes.value);
                if (ingestRes.ok) {
                    logger.info({ file }, 'Successfully vectorized reference dataset.');
                } else {
                    logger.error({ file, error: ingestRes.error.message }, 'Ingestion failed for reference.');
                }
            } else {
                logger.error({ file, error: profileRes.error.message }, 'Analysis failed for reference.');
            }
        } catch (e) {
            logger.error({ file, error: (e as Error).message }, 'Critical error in reference ingest.');
        }
    }

    pedagogy.close();
    vectorPedagogy.close();
    logger.info('Reference Ingestion Complete.');
}

main().catch(err => {
    logger.error({ err }, 'Reference ingest main failure');
    process.exit(1);
});
