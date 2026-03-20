import { OrchestrateEngine } from '../engines/OrchestrateEngine.js';
import { StoryboardScene, StoryboardLimbV2 } from '../limbs/creative/StoryboardLimbV2.js';
import { SovereignConfig } from '../config/SovereignConfig.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { Renderer } from '../ui/Renderer.js';
import { createLogger } from '../utils/logger.js';
import { ok, err } from '../core/models.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { VectorDB } from '../utils/VectorDB.js';
import { ModelClient } from '../clients/ModelClient.js';
import { join } from 'path';
import { loadConfig } from '../config/SovereignConfig.js';

const logger = createLogger('KBD-Roar-Test');

async function testKBDRoar() {
    process.stdout.write("--- METABOLIC START ---\n");
    logger.info('🐉 INITIALIZING KBD ROAR CINEMATIC VALIDATION...');

    const configPath = join(process.cwd(), 'sovereign-config.json');
    const baseConfig = loadConfig(configPath);
    const config: SovereignConfig = {
        ...baseConfig,
        orchestratorModel: 'gpt-4o', // Using high-fidelity model for casting
        masterLocalModel: 'qwen2.5-coder:14b',
        visionModel: 'gpt-4o'
    };

    console.log("--- KBD TEST CONFIG AUDIT ---");
    console.log("Embedding Model:", config.embeddingModel);
    console.log("Ollama Base URL:", config.ollamaBaseUrl);
    console.log("ComSpec:", process.env.ComSpec);
    console.log("Path:", process.env.Path?.substring(0, 500) + "...");
    console.log("-----------------------------");

    const renderer = new Renderer();
    
    // Phase 0: Initialize Hexagram singleton (Heartbeat)
    const hexagram = new HexagramManager(null, process.cwd());
    await hexagram.initialize();
    process.stdout.write("--- HEXAGRAM AWAKE ---\n");

    const router = new TernaryRouter(config);
    const engine = new OrchestrateEngine(config, router, renderer);

    console.log("--- SHELL SUBSTRATE TEST ---");
    const shell = (engine as any).shell; 
    const testResult = await shell.execute({ command: 'dir', cwd: process.cwd() });
    console.log("Shell Test (dir) Result:", testResult.ok ? "OK" : "FAILED", testResult.error?.message);
    const blenderProbe = await shell.execute({ command: 'where blender', cwd: process.cwd() });
    console.log("Blender Probe Result:", blenderProbe.ok ? "OK" : "FAILED", blenderProbe.value?.output);
    console.log("----------------------------");

    await engine.initialize();

    const request = {
        bookId: 1513, // Alice in Wonderland (Substrate context)
        sceneCount: 1,
        dimension: '3D' as const,
        personality: 'Sovereign Director'
    };

    logger.info('🎬 TRIGGERING FORENSIC CASTING FOR KBD SCENE...');
    
    // We override the storyboard to force a KBD scene for this test
    const customScene: StoryboardScene = {
        index: 0,
        description: 'The King Black Dragon (KBD) lets out a deafening roar, fire swirling around its THREE heads.',
        visualPrompts: ['A cinematic 3D render of the King Black Dragon roaring, 4k, volumetric lighting, dark dungeon atmosphere'],
        speaker: 'KBD',
        styleInfluence: 'High-fidelity cinematic drama',
        prosody: { chaos: 0.8, whimsy: 0, darkTone: 0.9, coherence: 0.7 }
    };

    // Accessing the pipeline directly for the test
    const pipeline = (engine as any).pipeline;
    
    // Step 1: Forensic Casting & Acting (StoryboardLimb)
    const storyboard = engine.getStoryboard() as StoryboardLimbV2;
    
    logger.info('🔍 Performing Forensic Casting on scene text...');
    const castRes = await storyboard.performForensicCasting([customScene]);
    
    if (!castRes.ok) {
        logger.error({ error: castRes.error }, 'Forensic Casting FAILED.');
        return;
    }

    const castScenes = castRes.value;
    logger.info({ 
        modelId: castScenes[0].modelId, 
        animationId: castScenes[0].animationId 
    }, '✅ Forensic Casting SUCCESSFUL.');

    // Step 2: Blender Rendering (Stage 2.5)
    logger.info('🎥 Shifting to Stage 2.5: Blender Renderer...');
    const blender = (engine as any).blender;
    const pipelinePath = 'D:\\sovereign\\test\\kbd_roar';
    
    const renderRes = await blender.render(customScene, pipelinePath);

    if (renderRes.ok) {
        logger.info({ clip: renderRes.value }, '🏆 KBD ROAR CINEMATIC FINALIZED.');
        console.log('\n--- VERIFICATION PROOF ---');
        console.log(`CLIP PATH: ${renderRes.value.path}`);
        console.log(`METABOLIC STATUS: ${renderRes.value.type}`);
        console.log('--------------------------\n');
    } else {
        logger.error({ error: renderRes.error.message }, 'KBD ROAR RENDER FAILED.');
        if (renderRes.error.message.includes('fallback')) {
            logger.warn('Preservation Protocol triggered: Falling back to Ghost 2D Substrate.');
        }
    }
}

testKBDRoar().catch(e => {
    logger.error({ err: e }, 'KBD Roar Test crashed.');
    process.exit(1);
});
