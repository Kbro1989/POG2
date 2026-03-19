import { loadConfig } from './src/config/SovereignConfig.js';
import { ModelClient } from './src/clients/ModelClient.js';
import { PedagogyLimb } from './src/limbs/technical/PedagogyLimb.js';
import { createLogger } from './src/utils/logger.js';
import { VectorPedagogyLimb } from './src/limbs/technical/VectorPedagogyLimb.js';

const logger = createLogger('TestKinematics');

async function main() {
    const config = loadConfig('./src/config/SovereignConfig.json'); // Direct path to default mockup or active config
    const modelClient = new ModelClient(config);
    const pedagogy = new PedagogyLimb();
    const vectorPedagogy = new VectorPedagogyLimb(modelClient);

    // Test a few sequences:
    // 1: Humanoid Idle (likely)
    // 603: Something common
    // Test extraction for a few animation sequences
    const sequenceIds = [1, 10, 20]; // Verified IDs from get_kinematics_ids.ts

    logger.info('Starting Kinematic Learning Test');

    for (const sequenceId of sequenceIds) {
        logger.info({ sequenceId }, 'Processing Sequence');
        try {
            const res = await pedagogy.analyzeKinematics(sequenceId);
            if (res.ok) {
                logger.info({ id: sequenceId, profile: res.value }, 'Kinematic Profile Generated');
                
                // Vectorize it
                const vRes = await vectorPedagogy.ingestProfile(res.value);
                if (vRes.ok) {
                    logger.info({ id: sequenceId }, 'Kinematic Ingestion Complete');
                }
            } else {
                logger.error({ id: sequenceId, error: res.error.message }, 'Kinematic Analysis Failed');
            }
        } catch (e) {
            logger.error({ id: sequenceId, error: (e as Error).message }, 'Kinematic Extraction Crash');
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
