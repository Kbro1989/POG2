import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { VisionActuationHarness } from '../engines/VisionActuationHarness.js';
import { ChromanumberEngine } from '../engines/ChromanumberEngine.js';
import { SpatialVisionEngine } from '../engines/SpatialVisionEngine.js';
import { Renderer } from '../ui/Renderer.js';
import { ModelClient } from '../clients/ModelClient.js';
import { SovereignConfig } from '../config/SovereignConfig.js';
import { createLogger } from '../utils/logger.js';
import path from 'path';
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';

import { HexagramManager } from '../routing/HexagramManager.js';

const logger = createLogger('LiveVisionLoop');

async function runLiveCycle() {
    logger.info('Commencing Phase 15 Live Operational Cycle');

    // Initialize CNS singletons
    const hexagram = new HexagramManager(null, 'test-project');
    (globalThis as any).hexagram = hexagram;

    const config: SovereignConfig = {
        visionModel: 'ollama:llava',
        codingHeavyModel: 'kimi-k2.5:cloud',
        codingFastModel: 'ollama:qwen2.5-coder:1.5b',
        ollamaBaseUrl: 'http://localhost:11434',
    } as any;

    const client = new ModelClient(config);
    const renderer = new Renderer();
    const spatialVision = SpatialVisionEngine.getInstance(config, renderer);
    const engine = new ChromanumberEngine();
    const harness = new VisionActuationHarness(engine, spatialVision);

    const { getRSMVSubstratePath } = await import('../utils/SovereignPathResolver.js');
    const targetFile = path.resolve(getRSMVSubstratePath(), 'src', '3d', 'test_substrate.ts');
    const backupFile = targetFile + '.bak';

    try {
        if (!existsSync(targetFile)) {
            logger.warn({ targetFile }, 'Target substrate not found. Skipping physical mutation.');
            return;
        }

        // 1. Create backup
        logger.info({ targetFile }, 'Creating substrate backup');
        copyFileSync(targetFile, backupFile);

        // 2. Run Cycle
        const testUrl = 'https://example.com';
        const prompt = 'Mutate the shader in test_substrate to use a crimson (#DC143C) aesthetic for the primary color.';

        logger.info('Triggering perception-action loop...');
        const result = await harness.runCycle(testUrl, prompt);

        if (result.ok && result.value.success) {
            logger.info({ details: result.value.details }, 'CYCLE SUCCESSFUL');

            // 3. Verify Mutation
            const content = readFileSync(targetFile, 'utf-8');
            if (content.includes('#DC143C')) {
                logger.info('VERIFICATION PASSED: AST Mutation reflected in substrate.');
            } else {
                logger.error('VERIFICATION FAILED: Mutation not found in file content.');
            }
        } else {
            logger.error({
                error: result.ok ? 'Actuation reported failure' : result.error?.message,
                details: result.ok ? result.value.details : undefined
            }, 'CYCLE FAILED');
        }

    } catch (err) {
        logger.error({ err }, 'Operational cycle crashed');
    } finally {
        // 4. Restore and Cleanup
        if (existsSync(backupFile)) {
            logger.info('Restoring substrate integrity');
            copyFileSync(backupFile, targetFile);
        }
        await harness.shutdown();
        logger.info('Live Vision Loop terminated.');
    }
}

runLiveCycle().catch(console.error);
