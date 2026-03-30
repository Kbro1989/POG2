import { DumpRefiller } from '../utils/DumpRefiller.js';
import { createLogger } from '../utils/logger.js';
import * as fs from 'fs';
import * as path from 'path';

const logger = createLogger('RefillValidation');

/**
 * RefillValidation - Phase D: Master Node Verification.
 * 
 * Objective: 
 * 1. Load the DumpRefiller.
 * 2. Execute a multi-node refill for module-7244 (Spatial) and module-1447 (Decompression).
 * 3. Confirm the 'Refilled' nodes are correctly written to D:\sovereign\refilled.
 * 4. Verify the semantic mapping integrity.
 */
async function runValidation() {
    logger.info('Starting Refilled Node Validation (Phase D)...');

    const refiller = new DumpRefiller();
    const targetDir = 'D:\\sovereign\\refilled';

    // 1. Refill Spatial Node (7244)
    logger.info('Refilling Spatial Master Node (7244)...');
    const spatialSuccess = await refiller.refillNode(7244);
    
    // 2. Refill Decompression Node (1447)
    logger.info('Refilling Decompression Node (1447)...');
    const decompSuccess = await refiller.refillNode(1447);

    // 3. Verification of Persistent Files
    const spatialPath = path.join(targetDir, 'spatial_7244.ts');
    const decompPath = path.join(targetDir, 'inflate_1447.ts');

    const spatialExits = fs.existsSync(spatialPath);
    const decompExits = fs.existsSync(decompPath);

    if (spatialSuccess && decompSuccess && spatialExits && decompExits) {
        logger.info('✅ REFILL VALIDATION PASSED: Multi-node re-hydration successful.');
        
        // 4. Sample check for semantic mapping
        const spatialContent = fs.readFileSync(spatialPath, 'utf8');
        if (spatialContent.includes('export const UnpackRGBAToIntegerFloat')) {
            logger.info('✅ Semantic Mapping Verified for module-7244.');
        } else {
            logger.error('❌ Semantic Mapping mismatch in module-7244.');
        }

        const decompContent = fs.readFileSync(decompPath, 'utf8');
        if (decompContent.includes('export const decompressCacheBlock')) {
            logger.info('✅ Semantic Mapping Verified for module-1447.');
        } else {
            logger.error('❌ Semantic Mapping mismatch in module-1447.');
        }

        console.log(`\n[PHASE D CHECKPOINT] Master Node Refill: COMPLETE\n`);
    } else {
        logger.error('❌ REFILL VALIDATION FAILED: Node persistence or re-hydration error.');
        process.exit(1);
    }
}

runValidation().catch(err => {
    logger.error({ err }, 'Validation process crashed.');
    process.exit(1);
});
