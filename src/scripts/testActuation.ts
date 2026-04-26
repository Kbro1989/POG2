import { ChromanumberEngine } from '../engines/ChromanumberEngine.js';
import { ModelClient } from '../clients/ModelClient.js';
import { SovereignConfig } from '../config/SovereignConfig.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('TestActuation');

async function testFlow() {
    logger.info('Starting Phase 15 Actuation Simulation');

    const config: SovereignConfig = {
        visionModel: 'ollama:llava',
        generationModel: 'kimi-k2.6:cloud',
        // ... rest of config stubs
    } as any;

    const client = new ModelClient(config);
    const engine = new ChromanumberEngine();

    // 1. Simulate a prompt that implies mutation
    const prompt = 'Mutate the shader to add a crimson glow effect';
    logger.info({ prompt }, 'Mocking forge request');

    const result = await engine.forgeComponent(prompt);
    
    if (result.ok) {
        logger.info('Forge successful');
        const actuation = result.value.actuation;
        
        if (actuation && actuation.action === 'mutate_shader') {
            logger.info({ actuation }, 'ACTUATION DETECTED');
            logger.info('Verification PASSED: Perception-Action link is hot.');
        } else {
            logger.error('Verification FAILED: No actuation intent emitted.');
        }
    } else {
        logger.error({ error: result.error }, 'Forge failed');
    }
}

testFlow().catch(console.error);
