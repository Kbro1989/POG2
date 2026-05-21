import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { ModelClient } from '../clients/ModelClient.js';
import { VectorDB } from '../utils/VectorDB.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { GutenbergLimb } from '../limbs/creative/GutenbergLimb.js';
import { StoryboardLimbV2 } from '../limbs/creative/StoryboardLimbV2.js';
import { BioIntelligenceLimb } from '../limbs/spatial/BioIntelligenceLimb.js';

import { QuestSynthesisLimb } from '../limbs/technical/QuestSynthesisLimb.js';
import { CacheForensicsLimb } from '../limbs/spatial/CacheForensicsLimb.js';
import { PedagogyLimb } from '../limbs/technical/PedagogyLimb.js';
import { KinematicsLimb } from '../limbs/technical/KinematicsLimb.js';
import { loadConfig } from '../config/SovereignConfig.js';
import { BlenderRenderer } from '../engines/BlenderRenderer.js';
import { ShellEngine } from '../engines/ShellEngine.js';
import { PulseMonitor } from '../monitor/PulseMonitor.js';
import { Renderer } from '../ui/Renderer.js';
import { ok } from '../core/models.js';
import { join } from 'path';
import { mkdirSync, existsSync, writeFileSync } from 'fs';

async function main() {
    console.log("ðŸš€ PHASE 25: Sovereign Narrative Orchestration (Romeo & Juliet [1513])");
    const CONFIG_PATH = join(process.cwd(), 'sovereign-config.json');
    const config = await loadConfig(CONFIG_PATH);
    const client = new ModelClient(config);
    const vectorDB = new VectorDB({ client });
    await vectorDB.initialize();

    const hexagram = new HexagramManager(vectorDB, 'romeo_juliet');
    await hexagram.initialize();
    const router = new TernaryRouter(config);

    router.setModelClient(client);

    const gutenberg = new GutenbergLimb(client as any, vectorDB as any);
    const bioIntel = new BioIntelligenceLimb();


    const rsmvCachePath = process.env['POG_rsmv_CACHE_DIR'] || join(process.env.ProgramData || 'C:\\\\ProgramData', 'jagex', 'runescape');
    const taxonomiesDir = join('D:\\', 'sovereign', 'memory', 'pedagogy');

    const kinematics = new KinematicsLimb(router as any, vectorDB as any, client as any);
    const pedagogy = new PedagogyLimb(router as any, vectorDB as any, client as any);
    const forensics = CacheForensicsLimb.getInstance();

    const storyboard = new StoryboardLimbV2(client as any, gutenberg, hexagram, vectorDB as any, bioIntel, pedagogy as any, kinematics as any, forensics, config.orchestratorModel);
    const questLimb = new QuestSynthesisLimb(client as any, forensics, pedagogy as any);

    const outDir = join(process.cwd(), 'audit_output', 'romeo_juliet');
    if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

    // 1. Gutenberg API Ingestion
    console.log("ðŸ“š 1. Ingesting Book 1513 from Project Gutenberg...");
    const ingestRes = await gutenberg.ingestBook(1513, "Romeo and Juliet", "William Shakespeare", "drama");
    if (!ingestRes.ok) console.warn("     Ingest Notice:", ingestRes.error.message); // May already exist in cache

    // 2. Blueprint & Scene Generation
    console.log("ðŸŽ¬ 2. Generating Storyboard Scenes from literary substrate...");
    const blueprintRes = await storyboard.analyzeGlobalContext(1513);
    const blueprint = blueprintRes.ok ? blueprintRes.value.blueprint : undefined;

    const scenesRes = await storyboard.generateScenes(1513, 3, blueprint);
    if (!scenesRes.ok) throw scenesRes.error;
    let scenes = scenesRes.value;

    // 3. Autonomous Casting (Mapping RS3 native Romeo and Juliet!)
    console.log("ðŸŽ­ 3. Autonomous Casting (Querying Pedagogy for native assets)...");
    const castRes = await storyboard.performForensicCasting(scenes);
    if (castRes.ok) scenes = castRes.value;

    // 4. Quest Synthesis
    console.log("ðŸ“œ 4. Synthesizing Playable Quest Logic...");
    const questRes = await questLimb.synthesizeFromScenes("Romeo and Juliet", scenes, "Intermediate");
    if (questRes.ok) {
        console.log(`     âœ… Generated Quest: ${questRes.value.name} (${questRes.value.stages.length} stages)`);
        writeFileSync(join(outDir, 'Romeo_and_Juliet_quest.json'), JSON.stringify(questRes.value, null, 2));
    }

    // 5. Visual Render Witness (MP4 for vision pipeline scoring)
    console.log("ðŸŽ¥ 5. Generating MP4 Witness Render via Heavy-Lifter BlenderRenderer...");
    const uiRenderer = new Renderer();
    const shell = new ShellEngine(uiRenderer);
    const pulse = new PulseMonitor(process.cwd(), hexagram);
    const blender = new BlenderRenderer(shell, pulse, async (scene) => ok({ path: 'fallback.mp4', duration: 1, type: '2D_GHOST' as const }));

    for (const scene of scenes) {
        console.log(`     Rendering Scene ${scene.index}: ${scene.speaker || 'Narrator'}...`);
        const renderRes = await blender.render(scene, outDir);
        if (renderRes.ok) {
            console.log(`     âœ… Witness generated: ${renderRes.value.path}`);
        } else {
            console.error(`     âŒ Witness failed: ${renderRes.error.message}`);
        }
    }

    // 6. Persist storyboard to D:\sovereign\pipelines
    const pipelineDir = join('D:\\', 'sovereign', 'pipelines', 'classics_of_literature', '1513_romeo_and_juliet');
    if (!existsSync(pipelineDir)) mkdirSync(pipelineDir, { recursive: true });
    writeFileSync(join(pipelineDir, `storyboard_Romeo_and_Juliet_${Date.now()}.json`), JSON.stringify(scenes, null, 2));
    console.log(`     ðŸ“ Storyboard persisted to: ${pipelineDir}`);

    console.log("ðŸ† Phase 25 Pipeline Complete!");
}

main().catch(console.error);
