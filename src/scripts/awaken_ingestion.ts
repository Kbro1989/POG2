import { SovereignIngestionEngine } from '../engines/SovereignIngestionEngine.js';
import { VectorDB } from '../utils/VectorDB.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { SovereignConfig } from '../config/SovereignConfig.js';
import { ModelClient } from '../clients/ModelClient.js';
import { createLogger } from '../utils/logger.js';
import path from 'path';

const logger = createLogger('AwakenIngestion');

async function main() {
    logger.info('Initializing Sovereign Ingestion Pipeline...');

    // 1. Initialize Substrate Dependencies
    const config: SovereignConfig = {
        masterLocalModel: 'deepseek-r1:8b', // Typical local thinker
        fastPathModel: 'kimi-k2.5:cloud',
        midPathModel: 'kimi-k2.5:cloud',
        deepPathModel: 'kimi-k2.5:cloud'
    } as any;

    const client = new ModelClient(config);
    
    // Initialize VectorDB
    const vectorDB = new VectorDB({ client });
    logger.info('Waking up VectorDB Memory Substrate...');
    const result = vectorDB.initialize();
    
    if (!result.ok) {
        logger.error({ error: result.error?.message }, 'Failed to initialize VectorDB.');
        process.exit(1);
    }
    
    // Wake up Hexagram Manager (Required for event triggering, though here we manually invoke)
    logger.info('Aligning I Ching routing via HexagramManager...');
    const hexManager = new HexagramManager(vectorDB, 'sovereign_ingestion');
    await hexManager.initialize();
    
    // 2. Instantiate SovereignIngestionEngine
    logger.info('Binding SovereignIngestionEngine...');
    const engine = SovereignIngestionEngine.getInstance(vectorDB);

    // 3. Define the physical ingestion targets based on the Sovereign Architect
    const targets = [
        'cache_pedagogy/json_dumps',
        'atlas/spatial',
        'apos-bridge/logs'
    ];

    logger.info({ targets }, 'Commencing Deep Ingestion Loop...');

    // 4. Begin the recursive Feedback Loop
    try {
        await engine.beginIngestionLoop(targets);
        logger.info('Sovereign Ingestion Loop Completed Successfully.');
    } catch (e) {
        logger.error({ error: (e as Error).message }, 'Catastrophic failure in Ingestion Loop.');
    } finally {
         vectorDB.close();
         logger.info('Halting execution. Memory Substrate decoupled.');
    }
}

main().catch((e) => {
    logger.error({ error: e.message || String(e) }, 'Unhandled process rejection');
    process.exit(1);
});
