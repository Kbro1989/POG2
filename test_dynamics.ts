import { loadConfig } from './src/config/SovereignConfig.js';
import { ModelClient } from './src/clients/ModelClient.js';
import { PedagogyLimb } from './src/limbs/technical/PedagogyLimb.js';
import { createLogger } from './src/utils/logger.js';
import { VectorPedagogyLimb } from './src/limbs/technical/VectorPedagogyLimb.js';

const logger = createLogger('TestDynamics');

async function main() {
    const config = loadConfig('./src/config/SovereignConfig.json'); 
    const modelClient = new ModelClient(config);
    const pedagogy = new PedagogyLimb();
    const vectorPedagogy = new VectorPedagogyLimb(modelClient);

    // Test a few SpotAnims:
    // 440: Arrow flight
    // 100: Something small
    // 2100: Something complex
    const testIds = [100, 440, 2100];

    // Test extraction for a few generic world effects
    const spotAnimIds = [0, 1, 10]; // Verified IDs from get_spotanim_ids.ts
    
    logger.info('Starting Dynamic Learning Test (SpotAnims)');

    for (const spotAnimId of spotAnimIds) {
        logger.info({ spotAnimId }, 'Processing SpotAnim');
        try {
            const res = await pedagogy.analyzeDynamics(spotAnimId); // Assuming pedagogy.analyzeDynamics is the correct method
            if (res.ok) {
                logger.info({ id: spotAnimId, profile: res.value }, 'Dynamic Profile Generated');
                
                // Vectorize it
                const vRes = await vectorPedagogy.ingestProfile(res.value);
                if (vRes.ok) {
                    logger.info({ id: spotAnimId }, 'Dynamic Ingestion Complete');
                }
            } else {
                logger.error({ id: spotAnimId, error: res.error.message }, 'Dynamic Analysis Failed');
            }
        } catch (e) {
            logger.error({ id: spotAnimId, error: (e as Error).message }, 'Dynamic Extraction Crash');
        }
    }

    pedagogy.close?.();
    vectorPedagogy.close();
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
