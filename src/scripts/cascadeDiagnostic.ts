import { createLogger } from '../utils/logger.js';
import { ModelRolodex } from '../api/ai/ModelRolodex.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { ModelClient } from '../clients/ModelClient.js';
import { loadConfig, getDefaultSovereignConfig } from '../config/SovereignConfig.js';
import { join } from 'path';
import { homedir } from 'os';

const logger = createLogger('CascadeDiagnostic');

import { extractCodeBlock } from '../utils/CodeExtractor.js';
import { VectorDB } from '../utils/VectorDB.js';

/**
 * Stage 0/1 Clinical Audit: Deterministic & Contextual
 */
async function auditStage0_1(prompt: string, vectorDb: VectorDB) {
    logger.info({ stage: 0, type: 'Deterministic' }, 'Metabolic Audit: Checking Stage 0 Heuristics...');
    
    // Real Stage 0: Actual extraction logic
    const codeBlock = extractCodeBlock(prompt);
    const hasJson = prompt.includes('{') && prompt.includes('}');
    
    if (codeBlock || hasJson) {
        logger.info({ stage: 0, hit: true, codeDetected: !!codeBlock }, 'Stage 0 HIT: Deterministic substrate ready.');
    } else {
        logger.info({ stage: 0, hit: false }, 'Stage 0 MISS: Non-deterministic input.');
    }

    logger.info({ stage: 1, type: 'Contextual' }, 'Metabolic Audit: Querying Stage 1 Contextual Memory...');
    
    // Real Stage 1: Actual health check of the memory substrate
    const dbHealth = vectorDb.healthCheck();
    if (dbHealth.online) {
        logger.info({ stage: 1, hit: true, details: dbHealth.details }, 'Stage 1 HIT: Memory substrate nominal.');
    } else {
        logger.warn({ stage: 1, hit: false, details: dbHealth.details }, 'Stage 1 DEGRADED: Memory substrate unreachable.');
    }
}

async function runCascadeDiagnostic() {
    logger.info('ðŸš€ CNS Metabolic Probe: Capability Cascade Verification');

    let config: any;
    try {
        const configPath = join(homedir(), '.POG2-cli', 'config.json');
        config = loadConfig(configPath);
    } catch (err) {
        logger.warn('Failed to load standard config, using defaults');
        config = getDefaultSovereignConfig();
    }
    
    const hexagramManager = new HexagramManager(null, 'cascade-diagnostic');
    await hexagramManager.initialize();

    const rolodex = new ModelRolodex(config);
    const router = new TernaryRouter(config);
    const client = new ModelClient(config, router);
    const vectorDb = new VectorDB({ client });
    
    // Initializations usually happen inside classes or via setters if not strictly bound in constructor
    router.setRolodex(rolodex);
    client.setRolodex(rolodex);

    await rolodex.refreshAll();
    await vectorDb.initialize();

    const testTasks = [
        { name: 'Simple Greeting', prompt: 'Hello, how are you?', expectedStage: 2 },
        { name: 'Code Logic', prompt: 'Write a typescript interface for a Sovereign Limb.', expectedStage: 3 },
        { name: 'Complex Architecture', prompt: 'Design a trauma-informed neurological bypass for a distributed AI substrate with vector-based ethical constraints.', expectedStage: 4 }
    ];

    for (const task of testTasks) {
        logger.info(`ðŸŽ¯ Testing [${task.name}]`);
        
        // Stage 0/1 Heuristics (Real substrate audit)
        await auditStage0_1(task.prompt, vectorDb);

        // Ternary Routing (Stage 2-4)
        const start = Date.now();
        const complexity = await router.classify(task.prompt);
        const decision = await router.route(complexity, 'text', task.prompt);
        const latency = Date.now() - start;

        logger.info({
            task: task.name,
            complexity: decision.complexity,
            model: decision.model,
            reasoning: decision.reasoning,
            metabolicLatencyMs: latency
        }, 'Cascade Path Result');

        // Check nomenclature
        if (decision.reasoning.includes('Stage')) {
            logger.info({ task: task.name }, 'âœ… Clinical Audit: Stage-based nomenclature present');
        } else {
            logger.warn({ task: task.name }, 'âŒ Clinical Audit: Stage-based nomenclature missing!');
        }
        
        console.log('---');
    }

    logger.info('ðŸ Cascade Diagnostic Complete.');
}

runCascadeDiagnostic().catch(console.error);
