// src/scripts/pog_synthesize_sovereign.ts
// Generalized Sovereign Synthesis Orchestrator (Phase 11-13)

import { spawn } from './spawn_kbd_legion.js';
import { choreograph } from './choreograph_kbd_legion.js';
import { synthesizeAudio } from './choreograph_legion_audio.js';
import { injectVFX } from './inject_legion_vfx.js';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

async function synthesize(prompt: string) {
    console.log(`🌌 Initiating Sovereign Synthesis: "${prompt}"`);

    // Dynamic imports to break circular dependencies in the cognitive substrate
    const { ModelClient } = await import('../clients/ModelClient.js');
    const { VectorDB } = await import('../utils/VectorDB.js');
    const { HexagramManager } = await import('../routing/HexagramManager.js');
    const { TernaryRouter } = await import('../routing/TernaryRouter.js');
    const { GutenbergLimb } = await import('../limbs/creative/GutenbergLimb.js');
    const { StoryboardLimbV2 } = await import('../limbs/creative/StoryboardLimbV2.js');
    const { BioIntelligenceLimb } = await import('../limbs/spatial/BioIntelligenceLimb.js');
    const { PedagogyLimb } = await import('../limbs/technical/PedagogyLimb.js');
    const { KinematicsLimb } = await import('../limbs/technical/KinematicsLimb.js');
    const { loadConfig } = await import('../config/SovereignConfig.js');

    const BUNDLE_DIR = join(process.cwd(), 'dist', 'sovereign_bundle');
    const CONFIG_PATH = join(process.cwd(), 'sovereign-config.json');

    if (!existsSync(BUNDLE_DIR)) mkdirSync(BUNDLE_DIR, { recursive: true });

    // 1. Initialize Cognitive Substrate
    let config, client, vectorDB, hexagram, router;
    try {
        config = await loadConfig(CONFIG_PATH);
        console.log('  ⚙️ Config Loaded.');

        client = new ModelClient(config);
        console.log('  🧠 ModelClient Created.');

        vectorDB = new VectorDB({ client });
        await vectorDB.initialize();
        console.log('  📂 VectorDB Initialized.');

        hexagram = new HexagramManager(vectorDB, 'sovereign_wave_project');
        await hexagram.initialize();
        hexagram.pinSynthesis(`Sovereign Synthesis: ${prompt}`);
        console.log('  🔮 HexagramManager Initialized (Synthesis State: Ding/Cauldron).');

        router = new TernaryRouter(config);
        // Inject components back into client/router for full loop
        // The original code had a type check, but the new snippet implies direct assignment.
        (client as any).setRouter(router);
        router.setModelClient(client);
        console.log('  🎯 TernaryRouter Online.');
    } catch (err) {
        console.error('❌ Substrate Initialization Failed:', err);
        throw err;
    }

    let gutenberg, bioIntel, pedagogy, kinematics, storyboard;
    try {
        gutenberg = new GutenbergLimb(client as any, vectorDB as any);
        bioIntel = new BioIntelligenceLimb();
        pedagogy = new PedagogyLimb(router as any, vectorDB as any, client as any);
        kinematics = new KinematicsLimb(router as any, vectorDB as any, client as any);
        storyboard = new StoryboardLimbV2(
            client as any, gutenberg, hexagram, vectorDB as any, bioIntel, pedagogy, kinematics
        );

        const strategy = hexagram.getInterpretation().strategy;
        console.log(`  🦵 Specialized Limbs Attached. Strategy: ${strategy}`);
    } catch (err) {
        console.error('❌ Limb Attachment Failed:', err);
        throw err;
    }

    try {
        // Stage 0: Storyboarding & Forensic Casting
        console.log('  🧠 Stage 0: Generating Storyboard & Casting...');
        const scenesRes = await storyboard.generateFromPrompt(prompt, 1);
        if (!scenesRes.ok) throw scenesRes.error;

        let scenes = scenesRes.value;
        if (scenes.length === 0) throw new Error('No scenes generated for prompt.');

        // Perform v2 Casting (Cache-First)
        const castingRes = await storyboard.performForensicCasting(scenes);
        if (!castingRes.ok) throw castingRes.error;
        scenes = castingRes.value;
        const scene = scenes[0]; // Focus on primary entity for synthesis

        console.log(`  👤 Cast Found: ${scene.speaker || 'Unknown'} (Model: ${scene.modelId}, Anim: ${scene.animationId})`);
        console.log(`  🦴 Skeletal Integrity: ${scene.boneCount} bones | Skeletal: ${scene.isSkeletal}`);

        // Stage 1: Spatial Synthesis (High-Fidelity Meshes)
        const gltfBase = await spawn({ outputDir: BUNDLE_DIR, scenes: [scene] });
        writeFileSync(join(BUNDLE_DIR, 'sovereign_spatial.gltf'), gltfBase);
        console.log('  ✅ Stage 1: Spatial Substrate Generated.');

        // Stage 2: Temporal Choreography (Skeletal Timing)
        const gltfChoreo = await choreograph(gltfBase, {
            outputDir: BUNDLE_DIR,
            scene: scene
        });
        writeFileSync(join(BUNDLE_DIR, 'sovereign_temporal.gltf'), gltfChoreo);
        console.log(`  ✅ Stage 2: Temporal Choreography Applied (${scene.duration}s).`);

        // Stage 3: Auditory Synthesis (5.1ch Spatial Audio)
        const audioBuffer = await synthesizeAudio({
            durationMs: (scene.duration || 6) * 1000,
            channels: 6,
            scene: scene
        });
        writeFileSync(join(BUNDLE_DIR, 'sovereign_auditory.wav'), audioBuffer);
        console.log('  ✅ Stage 3: Auditory Synapse Synthesized.');

        // Stage 4: VFX Synapse (Metadata Emitters)
        const gltfSovereign = await injectVFX(gltfChoreo, {
            emitters: 4,
            anchorNodeName: `mesh_${scene.modelId}`,
            apexFrame: 47,
            gradient: ['#0000FF', '#00FFFF', '#FFFFFF']
        });
        writeFileSync(join(BUNDLE_DIR, 'sovereign_final.gltf'), gltfSovereign);
        console.log('  ✅ Stage 4: Sovereign Finality Achieved.');

        // Manifest
        const manifest = {
            entity: scene.speaker,
            modelId: scene.modelId,
            animationId: scene.animationId,
            duration: scene.duration,
            timestamp: new Date().toISOString(),
            assets: {
                gltf: 'sovereign_final.gltf',
                audio: 'sovereign_auditory.wav'
            }
        };
        writeFileSync(join(BUNDLE_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

        console.log(`\n🏆 GENERALIZED SYNTHESIS COMPLETE: ${BUNDLE_DIR}`);

    } catch (err) {
        console.error('❌ Synthesis Failed:', err);
    }
}

// CLI Execution
if (process.argv[1].includes('pog_synthesize_sovereign')) {
    const prompt = process.argv[2] || "A King Black Dragon roaring in the void";
    synthesize(prompt).catch(console.error);
}
