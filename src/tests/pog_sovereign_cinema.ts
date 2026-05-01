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

const logger = createLogger('POG-Sovereign-Test');

async function testPOGSovereign() {
    process.stdout.write("--- METABOLIC START ---\n");
    logger.info('🚀 INITIALIZING POG SOVEREIGN CINEMATIC VALIDATION...');

    const configPath = join(process.cwd(), 'sovereign-config.json');
    const baseConfig = loadConfig(configPath);
    const config: SovereignConfig = {
        ...baseConfig,
        orchestratorModel: 'gpt-4o', 
        masterLocalModel: 'qwen2.5-coder:14b',
        visionModel: 'gpt-4o'
    };

    console.log("--- POG SOVEREIGN TEST CONFIG AUDIT ---");
    console.log("Embedding Model:", config.embeddingModel);
    console.log("Ollama Base URL:", config.ollamaBaseUrl);
    console.log("-----------------------------");

    const renderer = new Renderer();
    
    // Phase 0: Initialize Hexagram singleton (Heartbeat)
    const hexagram = new HexagramManager(null, process.cwd());
    await hexagram.initialize();
    process.stdout.write("--- HEXAGRAM AWAKE ---\n");

    const router = new TernaryRouter(config);
    const engine = new OrchestrateEngine(config, router, renderer);

    await engine.initialize();

    const request = {
        bookId: 1513, 
        sceneCount: 1,
        dimension: '3D' as const,
        personality: 'Sovereign Director'
    };

    logger.info('🎬 TRIGGERING FORENSIC CASTING FOR POG SOVEREIGN CORE SCENE...');
    
    // We override the storyboard to force a POG Sovereign scene for this test
    const customScene: StoryboardScene = {
        index: 0,
        description: 'The Sovereign Avatar (POG2) manifests in the center of the neurological map, glowing with cyan energy.',
        visualPrompts: ['A cinematic 3D render of a futuristic AI avatar manifesting in a digital void, cyan glow, volumetric lighting, hyper-detailed'],
        speaker: 'POG2',
        styleInfluence: 'High-fidelity cinematic drama',
        prosody: { chaos: 0.2, whimsy: 0, darkTone: 0.1, coherence: 0.9 },
        spotAnimId: 0,
        callSignals: undefined,
        audioId: 0,
        boneCount: undefined,
        isSkeletal: undefined,
        dataType: ''
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
    
    // REDIRECT TO GLOBE PUBLIC ASSETS
    const pipelinePath = join(process.cwd(), 'multiplayer-globe-template', 'public', 'assets', 'cinema', 'pog_sovereign');
    
    const renderRes = await blender.render(customScene, pipelinePath);

    if (renderRes.ok) {
        logger.info({ clip: renderRes.value }, '🏆 POG SOVEREIGN CINEMATIC FINALIZED.');
        console.log('\n--- VERIFICATION PROOF ---');
        console.log(`CLIP PATH: ${renderRes.value.path}`);
        console.log(`METABOLIC STATUS: ${renderRes.value.type}`);
        console.log('--------------------------\n');
    } else {
        logger.error({ error: renderRes.error.message }, 'POG SOVEREIGN RENDER FAILED.');
    }
}

testPOGSovereign().catch(e => {
    logger.error({ err: e }, 'POG Sovereign Test crashed.');
    process.exit(1);
});
