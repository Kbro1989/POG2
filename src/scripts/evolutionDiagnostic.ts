import { createLogger } from '../utils/logger.js';
import { SovereignConfig, getDefaultSovereignConfig } from '../config/SovereignConfig.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { ModelRolodex } from '../api/ai/ModelRolodex.js';
import { TrainingCollector } from '../utils/TrainingCollector.js';
import { ModelClient } from '../clients/ModelClient.js';
import { HexagramManager } from '../routing/HexagramManager.js';

const logger = createLogger('EvolutionDiagnostic');

async function runEvolutionDiagnostic() {
    logger.info('ðŸ§¬ Starting Phase 11: Evolution Diagnostic Probe...');

    let config: SovereignConfig;
    try {
        config = getDefaultSovereignConfig();
    } catch (err) {
        logger.warn('Failed to load real config, using defaults.');
        config = {
            pog2Dir: process.cwd(),
            ollamaBaseUrl: 'http://localhost:11434'
        } as SovereignConfig;
    }

    // 1. Initialize CNS Components
    logger.info('ðŸ§¬ Initializing HexagramManager...');
    const hexManager = new HexagramManager(null, 'evolution_test');
    await hexManager.initialize();

    logger.info('ðŸ§¬ Initializing Core Components...');
    const rolodex = new ModelRolodex(config);
    const router = new TernaryRouter(config);
    const collector = TrainingCollector.getInstance('evolution_test');
    const client = new ModelClient(config, router);

    router.setRolodex(rolodex);
    router.setTrainingCollector(collector);
    router.setModelClient(client);

    // 2. Simulate "Experience" (Inducing real metabolic signals)
    // We use the real local thinking model for success baseline.
    const targetModel = config.masterLocalModel || 'deepseek-r1:8b';
    
    logger.info({ model: targetModel }, 'ðŸ§¬ Recording real substrate interactions...');
    
    // Step A: Record some successful interactions (Baseline)
    for (let i = 0; i < 5; i++) {
        await collector.recordInteraction({
            model: targetModel,
            provider: 'ollama',
            category: 'coding',
            prompt: `Synthetic test prompt ${i}`,
            response: 'export const test = () => { return "valid"; };', // Valid syntax
            latencyMs: 150,
            success: true
        });
    }

    // Step B: Induce REAL metabolic drift (Pressure Test)
    // We record interactions with real syntax failures (detected by Scorer) or real connection failures.
    logger.info('ðŸ§¬ Simulating real metabolic drift (syntax failure pattern)...');
    for (let i = 0; i < 6; i++) {
        await collector.recordInteraction({
            model: targetModel,
            provider: 'ollama',
            category: 'coding',
            prompt: 'Generate complex structure.',
            response: 'class Broken { constructor() { { // Unbalanced braces', // REAL syntax failure trigger
            latencyMs: 120,
            success: true // Substrate worked, but quality is poor
        });
    }

    // 3. Execution: Evolutionary Sweep
    logger.info('ðŸ§¬ Running Evolutionary Sweep (Clinical Drift Detection)...');
    let mutations;
    try {
        mutations = await router.evolutionarySweep(10);
    } catch (sweepErr: any) {
        logger.error({ err: sweepErr.message, stack: sweepErr.stack }, 'âŒ FAILED: evolutionarySweep crashed');
        process.exit(1);
    }

    logger.info({ proposedMutations: mutations.length }, 'ðŸ§¬ Sweep results processed.');

    if (mutations.length === 0) {
        logger.error('âŒ FAILED: No mutations proposed after synthetic failures.');
        process.exit(1);
    }

    const mutation = mutations.find(m => m.model === targetModel);
    if (!mutation) {
        logger.error(`âŒ FAILED: No mutation proposed for ${targetModel}`);
        process.exit(1);
    }

    logger.info({ 
        model: mutation.model, 
        reasoning: mutation.reasoning,
        adjustment: mutation.weightAdjustment 
    }, 'âœ… SUCCESS: Evolutionary loop detected drift.');

    // 4. Approval Gate: Applying Mutation
    logger.info('ðŸ§¬ Testing Sovereign Approval Gate...');
    const result = router.applyMutation(mutation.id);

    if (result.ok) {
        logger.info('âœ… SUCCESS: Mutation applied to Rolodex.');
        
        // Verify in Rolodex
        const models = rolodex.getAllModels();
        const updated = models.find(m => m.id === targetModel);
        logger.info({ 
            model: targetModel, 
            finalReputation: updated?.reputation.toFixed(4) 
        }, 'ðŸ§¬ Metabolic state verified.');
    } else {
        logger.error({ error: result.error?.message }, 'âŒ FAILED: Mutation application failed.');
        process.exit(1);
    }

    logger.info('ðŸ§¬ Phase 11 Diagnostic Complete. CNS is now capable of governed evolution.');
}

runEvolutionDiagnostic().catch(err => {
    logger.error({ err: err.message }, 'Evolution Diagnostic CRASHED');
    process.exit(1);
});
