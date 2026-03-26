import { loadConfig } from './src/config/SovereignConfig.js';
import { ModelClient } from './src/clients/ModelClient.js';
import { PedagogyLimb } from './src/limbs/technical/PedagogyLimb.js';
import { VectorPedagogyLimb } from './src/limbs/technical/VectorPedagogyLimb.js';
import { YaoState } from './src/core/models.js';
import { createLogger } from './src/utils/logger.js';
import { TernaryRouter } from './src/routing/TernaryRouter.js';
import { VectorDB } from './src/utils/VectorDB.js';

const logger = createLogger('GeneralizationIngest');

async function main() {
    const config = loadConfig('config.json');
    const client = new ModelClient(config);
    const router = new TernaryRouter(config);
    const vectorDB = new VectorDB({ ...config, client } as any);
    const pedagogy = new PedagogyLimb(router, vectorDB, client);
    const vectorPedagogy = new VectorPedagogyLimb(client);

    const categories = [
        'NPC',
        'PLAYER',
        'LOC',
        'MODEL',
        'MAP',
        'MATERIAL',
        'SPOTANIM',
        'SCENARIO',
        'SCRIPTS',
        'PEDAGOGY'
    ];

    logger.info('Starting Generalized 3D Pedagogy Ingestion Loop');

    for (const cat of categories) {
        try {
            logger.info({ category: cat }, 'Processing Category Generalization');

            // 1. Generate the generalized profile for the category
            // analyzeGroupByType is currently a heuristic average/template
            const profileRes = await pedagogy.analyzeGroupByType(cat);

            if (profileRes.ok) {
                // 2. Ingest into VectorDB
                const ingestRes = await vectorPedagogy.ingestProfile(profileRes.value);
                if (ingestRes.ok) {
                    logger.info({ category: cat, rigLogic: profileRes.value.metrics.rigLogic }, 'Successfully generalized and vectorized category.');
                } else {
                    logger.error({ category: cat, error: ingestRes.error.message }, 'Ingestion failed for category.');
                }
            } else {
                logger.error({ category: cat, error: profileRes.error.message }, 'Analysis failed for category.');
            }
        } catch (e) {
            logger.error({ category: cat, error: (e as Error).message }, 'Critical error in category loop.');
        }
    }

    pedagogy.close();
    vectorPedagogy.close();
    logger.info('Generalization Ingest Complete. VectorDB on D:\\ updated.');
}

main().catch(err => {
    logger.error({ err }, 'Main ingest failure');
    process.exit(1);
});
