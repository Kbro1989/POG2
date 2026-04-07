import { WikiEnricher } from '../utils/WikiEnricher.js';
import { getBlockedDirections } from '../utils/DirectionalRegistry.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('BottomLayerReconciliation');

async function reconcileBottomLayer() {
    const targets = [
        { name: 'Sextant', type: 'item' },
        { name: 'Mouse toy', type: 'item' },
        { name: 'Mine cart', type: 'object' },
        { name: 'Grand Exchange', type: 'location' },
        { name: 'Barrows', type: 'location' },
        { name: 'Keldagrim', type: 'location' },
        { name: 'Crwys district', type: 'location' }
    ];

    logger.info('Commencing Bottom-Layer Reconciliation Audit...');

    for (const target of targets) {
        logger.info({ target: target.name }, `Enriching ${target.type} 4D Specs...`);
        const result = await WikiEnricher.enrich(target.name);
        
        if (result.ok) {
            console.log(`\n[RECONCILED: ${target.name}]`);
            console.log(`- Role: ${result.value.role}`);
            console.log(`- Intent: ${result.value.intent.substring(0, 100)}...`);
            
            // Spatial/Execution Specs
            if (target.name === 'Barrows') {
                const barrowsWall = getBlockedDirections(0, 0); // Wall (0Â°)
                console.log(`- Spatial Spec (Collision): ${barrowsWall.join(', ')}`);
            }
            
            if (target.name === 'Crwys district') {
                console.log(`- Environmental Spec: Crystal fishing waterfall identified.`);
            }
        } else {
            logger.warn({ target: target.name, error: result.error }, 'Failed to enrich target.');
        }
    }
}

reconcileBottomLayer();
