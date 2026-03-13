import pino from 'pino';
import { type Result, ok } from '../core/models.js';
import { StoryboardLimb, type StoryboardScene } from '../limbs/creative/StoryboardLimb.js';
import { ChromanumberEngine } from './ChromanumberEngine.js';
import { VoiceLimb } from '../limbs/creative/VoiceLimb.js';
import { SoundtrackLimb } from '../limbs/creative/SoundtrackLimb.js';
import { VideoAssemblerLimb } from '../limbs/creative/VideoAssemblerLimb.js';
import { ShellEngine } from './ShellEngine.js';
import { GutenbergLimb } from '../limbs/creative/GutenbergLimb.js';
import { YouTubeLimb } from '../limbs/creative/YouTubeLimb.js';
import { existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, statSync, readdirSync, renameSync } from 'fs';
import { join, basename } from 'path';
import { type PipelineCheckpoint } from '../types/pipeline.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { GenerativeAesthetics, EmotionalState } from '../core/models.js';
import { getPipelinePath, getPipelineRootPath } from '../utils/SovereignPathResolver.js';

const logger = pino({ name: 'PipelineController', base: { hostname: 'POG2' } });

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Pipeline Types
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export interface PipelineRequest {
    bookId: number;
    sceneCount?: number;
    personality?: string;
    voiceGeneration?: 'Execute' | 'Skip' | 'Auto';
    videoAssembly?: 'Execute' | 'Skip' | 'Auto';
    feedbackLoop?: 'Engage' | 'Skip' | 'Auto';
    youtubeUpload?: 'Upload' | 'Skip' | 'Auto';
}

export interface SceneArtifact {
    index: number;
    scene: StoryboardScene;
    imagePaths: string[]; // Changed from imagePath: string | null
    imageStatus: 'success' | 'failed' | 'skipped' | 'partial';
    voicePath: string | null;
    voiceStatus: 'success' | 'failed' | 'skipped' | 'pending';
    soundtrackPath?: string;
    soundtrackStatus?: 'success' | 'failed' | 'skipped' | 'pending';
    feedbackScore?: number;
    metadata?: Record<string, any>;
}

export interface PipelineManifest {
    bookId: number;
    bookTitle: string;
    createdAt: number;
    pipelinePath: string;
    totalScenes: number;
    successfulImages: number;
    successfulVoice: number;
    scenes: SceneArtifact[];
    status: 'complete' | 'partial' | 'failed';
    videoPath?: string;
    characterMap?: Record<string, string>; // name -> vocalTraits
}
export interface PipelineResult {
    manifest: PipelineManifest;
    output: string;
}

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PipelineController â€” The Director AI
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export class PipelineController {
    private readonly basePath = getPipelineRootPath();
    private readonly assembler: VideoAssemblerLimb;

    constructor(
        private readonly storyboard: StoryboardLimb,
        private readonly gutenberg: GutenbergLimb,
        private readonly chroma: ChromanumberEngine,
        private readonly voice: VoiceLimb,
        private readonly soundtrack: SoundtrackLimb,
        private readonly shell: ShellEngine,
        private readonly hexagram: HexagramManager,
        private readonly vectorDB?: any, // Made optional for backwards compatibility during refactor
        private readonly youtubeLimb?: YouTubeLimb // Injected for dependency handling
    ) {
        this.assembler = new VideoAssemblerLimb(this.shell, this.hexagram);
        if (!existsSync(this.basePath)) {
            mkdirSync(this.basePath, { recursive: true });
        }
    }

    /**
     * run - The main autonomous pipeline executor.
     * Takes a book ID, generates scenes, images, voice, and assembles everything.
     */
    public async run(request: PipelineRequest): Promise<Result<PipelineResult>> {
        const { bookId, sceneCount = 5, personality, voiceGeneration = 'Auto', videoAssembly = 'Auto', youtubeUpload = 'Auto' } = request;

        const skipVoice = voiceGeneration === 'Skip';
        const skipVideo = videoAssembly === 'Skip';
        const skipYoutube = youtubeUpload === 'Skip';

        const storageRes = this.gutenberg.getBookStorageInfo(bookId);
        if (!storageRes.ok) return storageRes as any;
        const { category, folderName, book } = storageRes.value;

        const pipelinePath = getPipelinePath(category, folderName);
        const stage1Path = join(pipelinePath, '1-storyboard');
        const stage2Path = join(pipelinePath, '2-images');
        const stage3Path = join(pipelinePath, 'voice');
        const stage4Path = join(pipelinePath, '4-assembly');
        const stage5Path = join(pipelinePath, '5-scene-clips');
        const stage6Path = join(pipelinePath, '6-final');

        const checkpointPath = join(stage1Path, `checkpoint.json`);

        logger.info({ bookId, category, folderName, sceneCount }, 'ðŸŽ¬ Pipeline initiated with Tiered Storage.');

        // Initialize directories
        [stage1Path, stage2Path, stage3Path, stage4Path, stage5Path, stage6Path].forEach(p => {
            if (!existsSync(p)) mkdirSync(p, { recursive: true });
        });

        // ─── BOOKMARKING: Load Checkpoint ───
        let manifest: PipelineManifest = {
            bookId,
            bookTitle: `Book ${bookId}`,
            createdAt: Date.now(),
            pipelinePath,
            totalScenes: 0,
            successfulImages: 0,
            successfulVoice: 0,
            scenes: [],
            status: 'partial'
        };
        let startStage: 'storyboard' | 'images' | 'voice' | 'assembly' = 'storyboard';
        let startSceneIndex = 0;
        let loadedFromCheckpoint = false;
        let bookFromStyle: any = null;

        const aesthetics = this.hexagram.getGenerativeAesthetics();
        logger.info({ hexagram: this.hexagram.getInterpretation().name, aesthetics }, 'Metabolic Aesthetics captured for pipeline run.');

        const manifestPath = join(stage1Path, 'manifest.json');

        if (existsSync(manifestPath)) {
            try {
                const storedManifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as PipelineManifest;
                if (storedManifest.status === 'complete' && existsSync(join(pipelinePath, '6-final', 'full_length_movie.mp4'))) {
                    logger.info({ bookId }, '🏁 Pipeline already completed. Idempotent skip.');
                    return ok({
                        output: `Pipeline already completed for Book ${bookId}.`,
                        manifest: storedManifest
                    });
                }
            } catch (err) {
                logger.warn('Failed to parse existing manifest.json. Continuing.');
            }
        }

        if (existsSync(checkpointPath)) {
            try {
                const cp = JSON.parse(readFileSync(checkpointPath, 'utf8')) as PipelineCheckpoint;
                logger.info({ lastStage: cp.lastCompletedStage }, '🔄 Resuming from checkpoint.');
                manifest = cp.manifest;
                startStage = cp.lastCompletedStage;
                startSceneIndex = cp.lastSceneIndex;
                loadedFromCheckpoint = true;
            } catch (err) {
                logger.warn('Failed to parse checkpoint. Starting fresh.');
            }
        } else if (existsSync(manifestPath)) {
            try {
                const storedManifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as PipelineManifest;
                logger.info('🔄 Reconstructing checkpoint from manifest.json.');
                manifest = storedManifest;
                loadedFromCheckpoint = true;

                // Reconstruct startStage and startSceneIndex
                if (manifest.scenes.length === 0) {
                    startStage = 'storyboard';
                } else if (manifest.scenes.some(s => s.imageStatus !== 'success' && s.imageStatus !== 'failed')) {
                    startStage = 'storyboard'; // Let image generation resume
                    startSceneIndex = manifest.scenes.findIndex(s => s.imageStatus !== 'success' && s.imageStatus !== 'failed');
                    if (startSceneIndex === -1) startSceneIndex = 0;
                } else if (manifest.scenes.some(s => s.voiceStatus !== 'success' && s.voiceStatus !== 'failed')) {
                    startStage = 'images';
                    startSceneIndex = Math.max(0, manifest.scenes.findIndex(s => s.voiceStatus !== 'success' && s.voiceStatus !== 'failed') - 1);
                } else {
                    startStage = 'voice';
                }
            } catch (err) {
                logger.warn('Failed to reconstruct from manifest.json. Starting fresh.');
            }
        }

        if (!loadedFromCheckpoint) {
            // Need bookTitle for manifest
            const styleRes = await this.gutenberg.analyzeStyle(bookId);
            if (styleRes.ok) {
                bookFromStyle = styleRes.value.book;
                manifest.bookTitle = bookFromStyle.title;
            }
        } else if (!bookFromStyle) {
            const styleRes = await this.gutenberg.analyzeStyle(bookId);
            if (styleRes.ok) bookFromStyle = styleRes.value.book;
        }

        // ─── STAGE 0.4: Soul Ingestion (Deep Reading) ───
        if (!loadedFromCheckpoint) {
            logger.info({ bookId }, 'Stage 0.4: Ingesting Author Soul (Reading the book)...');
            const readRes = await this.gutenberg.readBook(bookId, request.personality, this.hexagram.getEmotionalState());
            if (!readRes.ok) {
                logger.warn({ bookId, error: readRes.error }, 'Soul ingestion failed (Reading error). Proceeding with surface context.');
            } else {
                logger.info({ bookId }, 'Author Soul successfully ingested into VectorDB substrate.');
            }
        }

        // â”€â”€â”€ STAGE 0.5: Character Audit (Deep Sovereignty) â”€â”€â”€
        const blueprint = (manifest as any).narrativeBlueprint;
        if (!manifest.characterMap || !blueprint) {
            logger.info('Stage 0.5: Performing character audit and vocal trait assignment...');
            const auditRes = await this.storyboard.analyzeGlobalContext(bookId);
            if (auditRes.ok) {
                manifest.characterMap = auditRes.value.characterMap;
                (manifest as any).narrativeBlueprint = auditRes.value.blueprint;
            }
        }

        let scenes: StoryboardScene[] = [];
        let artifacts: SceneArtifact[] = manifest.scenes || [];
        if (startStage === 'storyboard') {
            logger.info('Stage 1/4: Generating storyboard scenes...');
            if (sceneCount === -1) {
                const segmentsRes = await this.gutenberg.getAllSegments(bookId);
                if (!segmentsRes.ok) return segmentsRes as any;
                const allSegments = segmentsRes.value;
                const styleRes = await this.gutenberg.analyzeStyle(bookId);
                if (!styleRes.ok) return styleRes as any;
                const { profile, book } = styleRes.value;
                bookFromStyle = book;

                const BATCH_SIZE = 5;
                for (let i = 0; i < allSegments.length; i += BATCH_SIZE) {
                    const batch = allSegments.slice(i, i + BATCH_SIZE);
                    const storyboardBatchPath = join(stage1Path, `storyboard_${bookId}_batch_${i}.json`);
                    const batchRes = await this.storyboard.generateFromSegments(book, profile, batch, batch.length, blueprint, storyboardBatchPath, personality);
                    if (batchRes.ok) {
                        const adjusted = batchRes.value; // Indices are already absolute from Segmenter
                        scenes.push(...adjusted);
                    }
                }
            } else {
                const storyboardLocalPath = join(stage1Path, `storyboard_${bookId}.json`);
                logger.info(`Step 3: Orchestrating Visual Composition (Storyboard)...`);
                const storyboardRes = await this.storyboard.generateScenes(bookId, sceneCount, blueprint, personality, storyboardLocalPath);
                if (!storyboardRes.ok) return { ok: false, error: storyboardRes.error };
                scenes = storyboardRes.value;
            }

            // Double check safety measure: If scene generation succeeded but we got 0 scenes, abort exactly here.
            if (scenes.length === 0) {
                return { ok: false, error: new Error('Pipeline aborted: 0 scenes generated for storyboard.') };
            }

            // Update existing manifest instead of overwriting all fields
            manifest.totalScenes = scenes.length;
            manifest.status = 'partial';

            // Create artifacts from scenes
            artifacts = scenes.map(s => ({
                index: s.index,
                scene: s,
                imagePaths: [],
                imageStatus: 'skipped',
                voiceStatus: 'pending',
                voicePath: null
            }));
            manifest.scenes = artifacts;

            this.saveCheckpoint(bookId, request, manifest, 'images', 0, stage1Path);
        } else {
            scenes = artifacts.map((s: any) => s.scene);
        }

        // â”€â”€â”€ STAGE 2: Image Generation â”€â”€â”€
        // Stage 2/4: Generating visual substrate sequence...
        // Phase 105: Ingest Anatomy Registry if VectorDB is available
        if (this.vectorDB) {
            const { AnatomyRegistry } = await import('../constants/AnatomyRegistry.js');
            await this.vectorDB.ingestAnatomyRegistry(AnatomyRegistry);
        }

        for (let i = startSceneIndex; i < scenes.length; i++) {
            const scene = scenes[i]!;
            const sceneDir = join(stage2Path, `scene_${scene.index}`);
            if (!existsSync(sceneDir)) mkdirSync(sceneDir, { recursive: true });

            logger.info({ index: scene.index }, 'Stage 2/4: Generating visual substrate sequence...');

            const sceneImagePaths: string[] = [];
            let allImagesSuccess = true;

            for (let pIdx = 0; pIdx < scene.visualPrompts.length; pIdx++) {
                const prompt = scene.visualPrompts[pIdx];
                const imageResult = await this.chroma.generateVisualSubstrate(prompt);
                if (imageResult.ok) {
                    // Move image from global captures to scene subfolder immediately if it's external
                    const fileName = basename(imageResult.value.path);
                    const localPath = join(sceneDir, fileName);
                    try {
                        renameSync(imageResult.value.path, localPath);
                        sceneImagePaths.push(localPath);
                    } catch (e) {
                        logger.warn({ err: e, path: imageResult.value.path }, 'Failed to localize image substrate. Using original path.');
                        sceneImagePaths.push(imageResult.value.path);
                    }
                } else {
                    logger.warn({ index: scene.index, prompt }, 'Stage 2/4: Image Substrate generation failed. Falling back to Visual Manifest.');
                    const manifestPath = join(sceneDir, `manifest_scene_${scene.index}_${pIdx}.png`);
                    const manifestRes = await this.chroma.generateVisualManifest(prompt, manifestPath);
                    if (manifestRes.ok) {
                        sceneImagePaths.push(manifestPath);
                    } else {
                        allImagesSuccess = false;
                    }
                }
            }

            const artifact: SceneArtifact = {
                index: scene.index,
                scene,
                imagePaths: sceneImagePaths,
                imageStatus: allImagesSuccess ? 'success' : (sceneImagePaths.length > 0 ? 'partial' : 'failed'),
                voicePath: null,
                voiceStatus: skipVoice ? 'skipped' : 'pending'
            };

            // ðŸ” SELF-REFLEXION: Visual Proprioception with Anatomy/3D/Kinetic Audit
            if (sceneImagePaths.length > 0) {
                let anatomyFacts: any = null;
                let kineticFacts: any = null;
                const description = scene.description.toLowerCase();

                if (this.vectorDB) {
                    // Advanced Entity Identification
                    let entityQuery = 'human';
                    const subjects = ['guard', 'alice', 'woman', 'man', 'dragon', 'dog', 'cat'];
                    for (const s of subjects) {
                        if (description.includes(s)) {
                            entityQuery = s;
                            break;
                        }
                    }

                    const factsRes = await this.vectorDB.getAnatomyFacts(entityQuery);
                    if (factsRes.ok) anatomyFacts = factsRes.value;

                    // Kinetic Awareness: Trigger only if motion is detected
                    const motionVerbs = ['run', 'swing', 'fly', 'walk', 'jump', 'fighting', 'combat'];
                    const hasMotion = motionVerbs.some(v => description.includes(v));

                    if (hasMotion && anatomyFacts) {
                        const species = anatomyFacts.type === '3d_model_ref' ? anatomyFacts.species : anatomyFacts.species;
                        const kineticRes = await this.vectorDB.getKineticFacts(species);
                        if (kineticRes.ok) kineticFacts = kineticRes.value;
                    }
                }

                // --- Multi-Image / Temporal Audit ---
                let totalPassed = 0;
                for (let j = 0; j < sceneImagePaths.length; j++) {
                    const imgPath = sceneImagePaths[j]!;
                    const auditPrompt = `Audit: Does this image correctly portray the specific beat "${scene.description}"? 
                                       Context: Scene ${scene.index}, Image ${j + 1}/${sceneImagePaths.length}.
                                       ${anatomyFacts ? `MUST-PASS Anatomical Laws: ${JSON.stringify(anatomyFacts.limits || anatomyFacts.species)}.` : ''}
                                       Reply with ONLY 'PASS' or 'FAIL'.`;

                    const reviewRes = await this.chroma.analyzeImage({
                        imagePath: imgPath,
                        prompt: auditPrompt,
                        anatomyFacts
                    });

                    if (reviewRes.ok && reviewRes.value.output.includes('PASS')) {
                        totalPassed++;
                    } else {
                        logger.warn({ index: scene.index, imageIndex: j }, 'Self-Reflexion: Visual beat mismatch detected.');
                        // Attempt stabilization for the first failure ONLY to prevent infinite loops in sequence
                        if (j === 0) {
                            const redoPrompt = anatomyFacts
                                ? `REDO: ${scene.visualPrompts[j]} (STRICT ANATOMY: ${JSON.stringify(anatomyFacts.limits || anatomyFacts.species)})`
                                : `REDO: ${scene.visualPrompts[j]}`;
                            const retryRes = await this.chroma.generateVisualSubstrate(redoPrompt);
                            if (retryRes.ok) {
                                sceneImagePaths[j] = retryRes.value.path;
                                artifact.imagePaths[j] = retryRes.value.path;
                            }
                        }
                    }
                }
                artifact.metadata = { ...artifact.metadata, auditScore: totalPassed / sceneImagePaths.length };
            }

            // Save scene metadata alongside artifact
            writeFileSync(join(stage1Path, `scene_${scene.index}.json`), JSON.stringify(scene, null, 2));

            artifacts[i] = artifact;
            this.saveCheckpoint(bookId, request, { ...manifest!, scenes: artifacts }, 'images', i + 1, stage1Path);
        }

        // â”€â”€â”€ STAGE 3: Voice Generation â”€â”€â”€
        logger.info({ skipVoice, artifactsCount: artifacts.length }, 'ENTERING STAGE 3: Voice Generation');
        if (!skipVoice) {
            for (let i = 0; i < artifacts.length; i++) {
                const artifact = artifacts[i];
                // POG2 Sovereignty: Ensure artifact exists. Reset if missing.
                const audioPath = join(stage3Path, `scene_${artifact.index}_narration.wav`);
                if (artifact.voiceStatus === 'success' && !existsSync(audioPath)) {
                    logger.warn({ index: artifact.index, audioPath }, 'Audio artifact missing despite success marker. Resetting to pending.');
                    artifact.voiceStatus = 'pending';
                }

                if (artifact.voiceStatus === 'success' && artifact.voicePath && existsSync(artifact.voicePath)) {
                    if (statSync(artifact.voicePath).size > 1000) {
                        logger.info({ index: artifact.index }, 'Voice already exists and is healthy. Skipping.');
                        continue;
                    } else {
                        logger.warn({ index: artifact.index }, 'Voice artifact skeleton detected (0-byte). REDOING.');
                        artifact.voiceStatus = 'pending';
                    }
                }

                if (!existsSync(stage3Path)) mkdirSync(stage3Path, { recursive: true });

                // Deep Sovereignty: Identify character vocal traits for this scene
                const characterName = artifact.scene.speaker || 'Narrator';
                const characterTraits = manifest.characterMap?.[characterName] || (manifest as any).narrativeBlueprint?.characters?.[characterName]?.traits || '';

                logger.info({ index: artifact.index, audioPath, scene: artifact.scene.description.substring(0, 30) }, 'Triggering VoiceLimb.narrate');
                const voiceRes = await this.voice.narrate(artifact.scene.description, {
                    personality: characterName === 'Narrator' ? (personality || characterName) : characterName,
                    characterTraits,
                    outputPath: audioPath,
                    emotion: this.hexagram.getEmotionalState(),
                    prosody: artifact.scene.prosody || aesthetics.prosody,
                    aesthetics // Pass the full context
                });
                if (voiceRes.ok) {
                    artifact.voicePath = audioPath;
                    artifact.voiceStatus = 'success';

                    // ðŸ” SELF-REFLEXION: Auditory Proprioception
                    const auditRes = await this.voice.verifyConsistency(audioPath, artifact.scene.prosody || { chaos: 0, whimsy: 0, darkTone: 0, coherence: 1 });
                    if (auditRes.ok && auditRes.value.matchScore < 0.5) {
                        logger.warn({ index: artifact.index }, 'Self-Reflexion: Audio-Tone mismatch. REDOING...');
                        await this.voice.narrate(artifact.scene.description, {
                            personality: personality || 'Sovereign Narrator',
                            outputPath: audioPath,
                            emotion: this.hexagram.getEmotionalState()
                        });
                    }
                } else {
                    artifact.voiceStatus = 'failed';
                    logger.error({ index: artifact.index, error: voiceRes.error }, 'Voice generation failed for scene.');
                }
                this.saveCheckpoint(bookId, request, { ...manifest!, scenes: artifacts }, 'voice', i + 1, stage1Path);
            }
        }

        // Finalize manifest for assembly
        manifest = {
            ...manifest!,
            totalScenes: scenes.length,
            successfulImages: artifacts.filter(a => a.imageStatus === 'success' || a.imageStatus === 'partial').length,
            successfulVoice: artifacts.filter(a => a.voiceStatus === 'success').length,
            scenes: artifacts,
            status: 'partial' // Default to partial until master assembly
        };

        // --- Decision Rating (Self-Evaluation) ---
        const avgAuditScore = artifacts.reduce((acc, a) => acc + (a.metadata?.auditScore || 0), 0) / artifacts.length;
        const successRate = (manifest.successfulImages + manifest.successfulVoice) / (manifest.totalScenes * 2);
        const decisionRating = (avgAuditScore * 0.4) + (successRate * 0.6);

        (manifest as any).decisionRating = {
            score: decisionRating.toFixed(2),
            auditQuality: avgAuditScore.toFixed(2),
            coverage: successRate.toFixed(2),
            ioTypes: ['TEXT_GUTENBERG', 'IMAGE_STABLE_DIFFUSION', 'AUDIO_TTS_VOICE', 'VIDEO_FFMPEG'],
            timestamp: Date.now()
        };

        logger.info({ rating: (manifest as any).decisionRating }, 'ðŸ“Š Pipeline Decision Rating Finalized.');

        // â”€â”€â”€ STAGE 3.9: Integrity Audit (Check Your Work) â”€â”€â”€
        const auditRes = this.verifyWork(manifest);
        if (!auditRes.ok) {
            logger.error({ errors: auditRes.error?.message }, 'Integrity Audit Failed: Corrupt or missing artifacts detected.');
            this.saveCheckpoint(bookId, request, manifest, 'voice', manifest.scenes.length, stage1Path, auditRes.error?.message);
            return auditRes as any;
        }

        // â”€â”€â”€ STAGE 4: Final Assembly (Autonomous Sequential Finish) â”€â”€â”€
        if (!skipVideo && manifest.successfulImages > 0) {
            // Phase 120: March 5th Directive - Real I/O Probe for Master Video
            if (manifest.videoPath && existsSync(manifest.videoPath) && statSync(manifest.videoPath).size > 100000) {
                logger.info({ videoPath: manifest.videoPath }, 'Master movie already exists and is healthy. Skipping assembly.');
                manifest.status = 'complete';
            } else {
                logger.info('Stage 4/4: Triggering master movie assembly...');
                const videoRes = await this.assembler.assemble(pipelinePath, manifest);
                if (videoRes.ok) {
                    manifest.videoPath = videoRes.value.videoPath;
                    manifest.status = 'complete';
                    logger.info({ videoPath: manifest.videoPath }, 'ðŸŽ¬ Master movie finalized and verified.');
                } else {
                    logger.error({ err: videoRes.error }, 'Master assembly failed. Manifest remains partial.');
                    manifest.status = 'partial';
                }
            }
        }

        // â”€â”€â”€ STAGE 5: YouTube Upload (Optional) â”€â”€â”€
        if (!skipYoutube && manifest.videoPath && existsSync(manifest.videoPath)) {
            try {
                const config = JSON.parse(readFileSync('.pog2-config.json', 'utf8'));
                if (config.youtube?.clientId && config.youtube?.clientSecret) {
                    // â”€â”€â”€ POG2 OAUTH SUBSTRATE: Attempt to ingest token from gcloud CLI â”€â”€â”€
                    let accessToken: string | undefined;
                    try {
                        const { execSync } = await import('child_process');
                        accessToken = execSync(`gcloud auth print-access-token --project ${config.youtube.projectId || 'pickofgods-8eb4b'}`).toString().trim();
                        logger.info('YouTube: Ingested authentication token from gcloud substrate.');
                    } catch (err) {
                        logger.warn('YouTube: Failed to ingest token from gcloud CLI. Falling back to local storage.');
                    }

                    const yt = new YouTubeLimb(config.youtube.clientId, config.youtube.clientSecret, config.youtube.apiKey, accessToken);
                    const bookMeta = this.gutenberg.getLibrary().find(b => b.id === bookId);
                    const isAdultContent = bookMeta?.subjects?.some(s =>
                        s.toLowerCase().includes('erotica') ||
                        s.toLowerCase().includes('adult') ||
                        s.toLowerCase().includes('horror') ||
                        s.toLowerCase().includes('violence') ||
                        s.toLowerCase().includes('gore')
                    ) || false;

                    const uploadRes = await yt.upload({
                        videoPath: manifest.videoPath,
                        title: `${manifest.bookTitle} â€” AI Narrated Audiobook`,
                        description: `Generated by POG2 Sovereign Pipeline from Project Gutenberg #${bookId}.\n\nAuthor: ${bookMeta?.author || 'Unknown'}\nCategory: ${bookMeta?.domain || 'uncategorized'}`,
                        tags: [...(bookMeta?.subjects || []).slice(0, 10), 'audiobook', 'ai-narrated', 'project-gutenberg'],
                        categoryId: '27',
                        privacyStatus: 'unlisted',
                        thumbnailPath: manifest.scenes[0]?.imagePaths?.[0],
                        playlistTitle: bookMeta?.domain ? `POG2: ${bookMeta.domain}` : undefined,
                        containsSyntheticMedia: 'Yes',
                        videoAgeGating: isAdultContent ? { restricted: true } : undefined
                    });
                    if (uploadRes.ok) {
                        logger.info({ videoId: uploadRes.value.videoId, url: uploadRes.value.videoUrl }, 'ðŸŽ¬ YouTube upload complete!');
                        (manifest as any).youtubeUrl = uploadRes.value.videoUrl;
                    } else {
                        logger.warn({ error: uploadRes.error }, 'YouTube upload failed. Video saved locally.');
                    }
                }
            } catch (err) {
                logger.warn({ err }, 'YouTube integration skipped (config or auth issue).');
            }
        }

        if (existsSync(checkpointPath)) {
            const { unlinkSync } = await import('fs');
            unlinkSync(checkpointPath);
        }

        const summaryJson = {
            pipelineStatus: manifest.status.toUpperCase(),
            decisionRating: (manifest as any).decisionRating,
            bookId,
            pipelinePath,
            scenes: {
                totalExpected: scenes.length,
                imagesVerified: manifest.successfulImages,
                voiceVerified: manifest.successfulVoice
            },
            video: manifest.videoPath ? { verified: true, path: manifest.videoPath } : { verified: false, skipped: skipVideo }
        };

        return ok({ manifest, output: JSON.stringify(summaryJson, null, 2) });
    }

    /**
     * orchestrate - The Sovereign Orchestrator.
     * Scans the tiered library for incomplete pipelines, calculates progress metrics,
     * and resumes the "most finished" book to ensure sequential integrity.
     */
    public async orchestrate(requestDefaults: Partial<PipelineRequest> = {}): Promise<Result<PipelineResult | void>> {
        logger.info('ðŸ§¬ Neuro-Scanning tiered storage for active production manifests...');

        const candidates: { manifest: PipelineManifest, checkpoint: PipelineCheckpoint, progress: number }[] = [];
        const categories = readdirSync(this.basePath);

        for (const cat of categories) {
            const catPath = join(this.basePath, cat);
            if (!statSync(catPath).isDirectory()) continue;

            const books = readdirSync(catPath);
            for (const bookDir of books) {
                const bookPath = join(catPath, bookDir);
                if (!statSync(bookPath).isDirectory()) continue;

                const stage1Path = join(bookPath, '1-storyboard');
                const rootManifestPath = join(bookPath, 'manifest.json');
                const tieredManifestPath = join(stage1Path, 'manifest.json');
                const checkpointPath = join(stage1Path, 'checkpoint.json');

                let manifestPath = existsSync(tieredManifestPath) ? tieredManifestPath : (existsSync(rootManifestPath) ? rootManifestPath : null);

                if (manifestPath) {
                    try {
                        // Migration: Move manifest to 1-storyboard if it's in the root
                        if (manifestPath === rootManifestPath) {
                            if (!existsSync(stage1Path)) mkdirSync(stage1Path, { recursive: true });
                            renameSync(rootManifestPath, tieredManifestPath);
                            manifestPath = tieredManifestPath;
                            logger.info({ book: bookDir }, 'Migrated manifest to 1-storyboard.');
                        }

                        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as PipelineManifest;

                        if (manifest.status !== 'complete') {
                            const progress = (manifest.successfulImages + manifest.successfulVoice) / (manifest.totalScenes * 2);

                            // Reconstruct or load checkpoint
                            let checkpoint: PipelineCheckpoint | null = null;
                            if (existsSync(checkpointPath)) {
                                checkpoint = JSON.parse(readFileSync(checkpointPath, 'utf8')) as PipelineCheckpoint;
                            } else {
                                // Neuro-Reconstruction: Create a basic checkpoint if missing
                                checkpoint = {
                                    request: { bookId: manifest.bookId, sceneCount: manifest.totalScenes },
                                    manifest,
                                    lastCompletedStage: 'voice', // Assume finishing audio is next
                                    lastSceneIndex: manifest.scenes.length,
                                    timestamp: Date.now(),
                                    version: '1.2.1-reconstructed'
                                };
                            }
                            candidates.push({ manifest, checkpoint, progress });
                        }
                    } catch (e) {
                        logger.warn({ bookDir }, 'Failed to parse volume for orchestration.');
                    }
                }
            }
        }

        if (candidates.length === 0) {
            logger.info('âœ¨ All current production volumes are complete. Scanning catalog for fresh ingestion...');
            return ok(undefined);
        }

        // Sort by progress descending (Highest progress first)
        candidates.sort((a, b) => b.progress - a.progress);
        const best = candidates[0];

        logger.info({
            book: best.manifest.bookTitle,
            progress: (best.progress * 100).toFixed(1) + '%',
            id: best.manifest.bookId
        }, 'ðŸŽ¯ Identifying priority production target.');

        return this.run({ ...best.checkpoint.request, ...requestDefaults });
    }

    /**
     * runBatch - Iterates through the entire Gutenberg library using orchestrator logic.
     */
    public async runBatch(request: Omit<PipelineRequest, 'bookId'>): Promise<Result<void>> {
        logger.info('ðŸš€ Global Cinema Batch triggered via Sovereign Orchestration.');

        // 1. First, finish everything already in progress
        let orchestrateRes = await this.orchestrate(request);
        while (orchestrateRes.ok && (orchestrateRes.value as any)?.manifest) {
            orchestrateRes = await this.orchestrate(request);
        }

        // 2. Then, ingest new books from library
        const library = this.gutenberg.getLibrary();
        for (const book of library) {
            const storageRes = this.gutenberg.getBookStorageInfo(book.id);
            if (storageRes.ok) {
                const manifestPath = join(this.basePath, storageRes.value.category, storageRes.value.folderName, '1-storyboard', 'manifest.json');
                if (existsSync(manifestPath)) {
                    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as PipelineManifest;
                    if (manifest.status === 'complete') continue;
                }
            }

            logger.info({ bookId: book.id, title: book.title }, 'Ingesting next volume in batch...');
            await this.run({ ...request, bookId: book.id });
        }

        return ok(undefined);
    }

    private saveCheckpoint(bookId: number, request: PipelineRequest, manifest: PipelineManifest, stage: 'storyboard' | 'images' | 'voice' | 'assembly', sceneIndex: number, stage1Path: string, error?: string) {
        const checkpointPath = join(stage1Path, `checkpoint.json`);
        const manifestPath = join(stage1Path, `manifest.json`);

        // Audit for corruptions to store in checkpoint
        const audit = this.verifyWork(manifest);
        const corruptArtifacts = !audit.ok ? [audit.error?.message || 'Unknown error'] : [];

        const checkpoint: PipelineCheckpoint = {
            request, manifest, lastCompletedStage: stage, lastSceneIndex: sceneIndex,
            timestamp: Date.now(), version: '1.2.1-integrity',
            lastError: error,
            corruptArtifacts
        };
        writeFileSync(checkpointPath, JSON.stringify(checkpoint, null, 2));
        writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }

    /**
     * verifyWork - Audits the pipeline output for empty files, 0-byte assets, or missing scenes.
     */
    public verifyWork(manifest: PipelineManifest): Result<void> {
        const corrupt: string[] = [];

        for (const artifact of manifest.scenes) {
            // Check Images
            for (const img of artifact.imagePaths) {
                if (!existsSync(img)) {
                    corrupt.push(`Scene ${artifact.index}: Project missing image substrate ${basename(img)}`);
                } else if (statSync(img).size < 100) { // Tiny file threshold
                    corrupt.push(`Scene ${artifact.index}: Corrupt/Empty image ${basename(img)}`);
                }
            }

            // Check Voice
            if (artifact.voiceStatus === 'success' && artifact.voicePath) {
                if (!existsSync(artifact.voicePath)) {
                    corrupt.push(`Scene ${artifact.index}: Missing narration ${artifact.index}.wav`);
                } else if (statSync(artifact.voicePath).size < 1000) { // Narration is usually > 1KB
                    corrupt.push(`Scene ${artifact.index}: Narration too short/silent`);
                }
            }
        }

        // Check for duplicates
        const seenIndices = new Set<number>();
        for (const scene of manifest.scenes) {
            if (seenIndices.has(scene.index)) {
                corrupt.push(`Duplicate scene index detected: ${scene.index}`);
            }
            seenIndices.add(scene.index);
        }

        if (corrupt.length > 0) {
            return { ok: false, error: new Error(corrupt.join(' | ')) };
        }

        return ok(undefined);
    }

    private async withRetry<T>(fn: () => Promise<Result<T>>, maxRetries: number): Promise<Result<T>> {
        let lastError: Error | undefined;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            const result = await fn();
            if (result.ok) return result;
            lastError = result.error;
            if (attempt < maxRetries) {
                const delayMs = Math.pow(2, attempt) * 1000;
                logger.warn({ attempt: attempt + 1, delayMs }, `Retry in ${delayMs}ms...`);
                await new Promise(resolve => setTimeout(resolve, delayMs));
            }
        }
        return { ok: false, error: lastError || new Error('Max retries exceeded') };
    }

    public healthCheck(): { online: boolean; details: string } {
        return {
            online: existsSync(this.basePath),
            details: existsSync(this.basePath) ? 'Pipeline substrate verified.' : 'Pipeline output path missing.'
        };
    }
}
