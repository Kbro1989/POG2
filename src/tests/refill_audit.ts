import { DumpRefiller } from '../utils/DumpRefiller.js';
import { createLogger } from '../utils/logger.js';
import { NodeRegistry } from '../core/NodeRegistry.js';
import * as fs from 'fs';
import * as path from 'path';

const logger = createLogger('RefillAudit');

/**
 * RefillAudit - Phase E: Global Node Re-hydration.
 * 
 * Objective: 
 * 1. Batch-refill ALL unidentified modules (77 files) using the DumpRefiller.
 * 2. Categorize them into the NodeRegistry where possible.
 * 3. Ensure the D:\sovereign\refilled substrate is fully populated for Havenhythe.
 */
async function runRefillAudit() {
    logger.info('Starting Global Node Refill Audit (Phase E)...');

    const refiller = new DumpRefiller();
    const sourceDir = 'D:\\sovereign\\resources\\webviewer-deconstructed\\unidentified';
    
    // List all module files
    const files = fs.readdirSync(sourceDir).filter(f => f.startsWith('module-') && f.endsWith('.js'));
    logger.info({ count: files.length }, 'Found unidentified modules for batch refill.');

    let successCount = 0;
    for (const file of files) {
        // Extract ID: module-0041.js -> 41
        const moduleId = parseInt(file.match(/\d+/)![0]);
        
        // Ensure registry has a placeholder if not already defined
        const registry = NodeRegistry.getInstance();
        if (!registry.getNode(moduleId)) {
            // Add as 'unknown' category for initial pass
            (registry as any).addNode(moduleId, `Module_${moduleId}`, 'unknown', `D:\\sovereign\\refilled\\logic_${moduleId}.ts`, 'Auto-refilled logic placeholder');
        }

        const success = await refiller.refillNode(moduleId);
        if (success) successCount++;
    }

    logger.info({ successCount }, 'Global Refill Audit COMPLETE.');
    console.log(`\n[PHASE E] Batch Refill: ${successCount}/77 Modules Re-hydrated.\n`);
}

runRefillAudit().catch(err => {
    logger.error({ err }, 'Refill Audit crashed.');
    process.exit(1);
});
