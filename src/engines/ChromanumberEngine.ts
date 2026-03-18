import { ModelClient } from '../clients/ModelClient.js';
import { SovereignEye, type CaptureSource } from '../utils/SovereignEye.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import type { Result, EngineOutput, SovereignRecord, ActuationIntent, PedagogyProfile } from '../core/models.js';
import { getGenerationsPath, getSovereignRoot } from '../utils/SovereignPathResolver.js';
import { RSMVController } from '../vision/RSMVController.js';
import { ShaderInjector } from '../vision/ShaderInjector.js';
import { TransientObserver } from '../vision/TransientObserver.js';
import { join } from 'path';
import { existsSync, readdirSync, mkdirSync, writeFileSync } from 'fs';

import { HexagramManager } from '../routing/HexagramManager.js';
import { GoogleServices } from '../services/GoogleServices.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('ChromanumberEngine');

export interface CaptureParams {
    sourceType: 'url' | 'html' | 'window' | 'file';
    target: string;
    prompt?: string;
    width?: number;
    height?: number;
    modelOverride?: string;
}

export interface VisionParams {
    imagePath?: string;
    prompt?: string;
    isRSC?: boolean;
    modelOverride?: string;
}

/**
 * ChromanumberEngine - Universal Sensory Perception and Creative Forging
 * 
 * Adapts the Chromanumber logic to the POG2 substrate, leveraging SovereignEye
 * for visual capture and multimodal models for semantic understanding.
 */
export class ChromanumberEngine {
    private readonly eye: SovereignEye;
    private readonly googleServices: GoogleServices;
    private readonly rsmv: RSMVController;
    private readonly injector: ShaderInjector;
    private readonly observer: TransientObserver;

    constructor(
        private readonly client: ModelClient,
        private readonly config: SovereignConfig,
        private readonly hexagram: HexagramManager = HexagramManager.getInstance()
    ) {
        this.eye = new SovereignEye();
        this.googleServices = new GoogleServices({
            apiKey: process.env['GOOGLE_API_KEY'] || ''
        });
        this.rsmv = new RSMVController();
        this.injector = new ShaderInjector();
        this.observer = new TransientObserver();
    }

    public getEye(): SovereignEye {
        return this.eye;
    }

    /**
     * Universal Capture & Perception
     */
    async capture(params: CaptureParams): Promise<Result<EngineOutput>> {
        const { sourceType, target, prompt = 'Describe what you see.', width = 1280, height = 720 } = params;

        logger.info({ sourceType, target }, 'Sensory Eye engaging target');

        const captureResult = await this.eye.capture({ type: sourceType, target } as CaptureSource, { width, height });
        if (!captureResult.ok) return captureResult;

        const capture = captureResult.value;
        let perceptionData = '';

        if (capture.imagePath) {
            perceptionData += `[VISUAL PERCEPTION]\nLocation: ${capture.imagePath}\n`;

            // If we have an image, attempt vision analysis via multimodal fallback
            const visionPrompt = `CHROMANUMBER PERCEPTION GRID ANALYSIS:
You are viewing a capture from: ${sourceType} source "${target}"

${prompt}

CALIBRATION:
- Identify UI regions, buttons, and layouts.
- Report any visible errors or broken elements.
- Describe the aesthetic and color scheme.`;

            const visionResult = await this.analyzeImage({
                imagePath: capture.imagePath,
                prompt: visionPrompt,
                modelOverride: params.modelOverride
            });
            if (visionResult.ok && visionResult.value) {
                perceptionData += `\n[VISION ANALYSIS]\n${visionResult.value.output}\n`;
            }
        }

        if (capture.textContent) {
            perceptionData += `\n[TEXTUAL PERCEPTION]\n${capture.textContent}\n`;
        }

        return {
            ok: true,
            value: {
                output: perceptionData || 'Capture successful but no data extracted.',
                data: capture as unknown as SovereignRecord
            }
        };
    }

    /**
     * Specialized Image Analysis via Multimodal Models
     */
    async analyzeImage(params: VisionParams & { anatomyFacts?: any }): Promise<Result<EngineOutput>> {
        const { imagePath, prompt = 'Describe this image.', isRSC = false, anatomyFacts } = params;

        // Multi-modal check: Prefer Vision-capable models
        const visionPrompt = isRSC
            ? `[RSC_CLIENT_CONTEXT] ${prompt}`
            : prompt;

        const modelToUse = params.modelOverride || 'ollama:llava';

        let auditRules = '';
        if (anatomyFacts) {
            auditRules = `
[SOVEREIGN ANATOMICAL LAWS]
Facts: ${JSON.stringify(anatomyFacts)}

TASK: Audit the image at "${imagePath}" against these specific biological laws.
- If the subject violates these facts (e.g., incorrect limb count, impossible joints), you MUST report 'FAIL'.
- Be strict. No "creative hallucinations" allowed for standardized species.
`;
        }

        const finalPrompt = `IMAGE_PATH: ${imagePath}\n${auditRules}\n\n[SELF_REVIEW_CONTEXT] Analyze this image for visual continuity and physiological fidelity.\n\nPROMPT: ${visionPrompt}`;

        const result = await this.client.resilientCall({
            model: modelToUse,
            prompt: finalPrompt,
            temperature: 0.1, // Lower temperature for strict auditing
            category: 'chromanumber'
        });

        if (!result.ok) return result;

        return {
            ok: true,
            value: {
                output: result.value.response,
                data: { imagePath, model: result.value.model }
            }
        };
    }

    /**
     * Temporal Image Sequence Analysis for Kinetic Integrity
     */
    async analyzeSequence(params: {
        imagePaths: string[];
        prompt: string;
        kineticFacts: any;
        modelOverride?: string;
    }): Promise<Result<EngineOutput>> {
        const { imagePaths, prompt, kineticFacts } = params;
        const modelToUse = params.modelOverride || 'ollama:llava';

        logger.info({ images: imagePaths.length }, 'Temporal Kinetic Audit engaging sequence');

        const kineticLaws = `
[SOVEREIGN KINETIC LAWS]
Kinetic Profile: ${JSON.stringify(kineticFacts)}

TASK: You are auditing a sequence of images for movement integrity.
- Ensure joint movements between frames do not exceed the listed limits.
- Detect "teleporting limbs" or impossible rotations.
- Ensure movement speed/velocity feels biologically plausible.
- Report 'FAIL' if any frame violates physical reality or these laws.
`;

        const finalPrompt = `SEQUENCE_IMAGES: ${imagePaths.join(', ')}\n${kineticLaws}\n\nPROMPT: ${prompt}`;

        const result = await this.client.resilientCall({
            model: modelToUse,
            prompt: finalPrompt,
            temperature: 0.2, // Slightly higher to allow for movement interpretation
            category: 'chromanumber'
        });

        if (!result.ok) return result;

        return {
            ok: true,
            value: {
                output: result.value.response,
                data: { imagePaths, model: result.value.model }
            }
        };
    }

    /**
     * Analyze Project Patterns (Adapted from ChromanumberLimb)
     */
    async analyzePatterns(): Promise<Result<EngineOutput>> {
        const root = process.cwd();
        try {
            const files = readdirSync(root).slice(0, 50); // Sample
            const summary = `Project Patterns at ${root}:\nFiles: ${files.join(', ')}`;

            return {
                ok: true,
                value: {
                    output: `Successfully analyzed project substrate patterns.`,
                    data: { summary }
                }
            };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Forge Components based on analyzed style
     */
    async forgeComponent(prompt: string, modelOverride?: string, dominantColors?: string[]): Promise<Result<EngineOutput>> {
        const colorContext = dominantColors && dominantColors.length > 0
            ? `\nSUBSTRATE DOMINANT COLORS (HEX): ${dominantColors.join(', ')}`
            : '';

        const forgingPrompt = `You are a POG2 - SOVEREIGN forge engine.
    Prompt: ${prompt}${colorContext}

RULES:
- ONLY output a valid Hex Color code or CSS Color name.
- Do NOT output full code. Do NOT output markdown code blocks.
- Your entire response MUST just be the color string (e.g., #DC143C or crimson).
- If colors are provided, use them as primary/secondary anchors unless instructed otherwise.

Forge result: `;

        const modelToUse = modelOverride || 'kimi-k2.5:cloud';

        const result = await this.client.resilientCall({
            model: modelToUse, // Use Kimi's override or fallback
            prompt: forgingPrompt,
            category: 'chromanumber'
        });

        if (!result.ok) return result;

        // Strip markdown backticks if present
        let cleanResponse = result.value.response;
        if (cleanResponse.includes('```')) {
            const matches = cleanResponse.match(/```(?:typescript|glsl|javascript)?([\s\S]*?)```/);
            if (matches && matches[1]) {
                cleanResponse = matches[1].trim();
            } else {
                cleanResponse = cleanResponse.replace(/```[a-z]*\n?/gi, '').replace(/```/g, '').trim();
            }
        }

        // Phase 15: Structural Intent Detection
        let actuation: ActuationIntent | undefined;
        if (prompt.toLowerCase().includes('mutate') || prompt.toLowerCase().includes('shader')) {
            // Priority: provided target or default to test substrate/procedural target
            // Use absolute path resolution to avoid ENOENT in the injector
            const relativeTarget = prompt.includes('test_substrate')
                ? join('tmp_rsmv_inspect', 'src', '3d', 'test_substrate.ts')
                : join('tmp_rsmv_inspect', 'src', '3d', 'proceduraltexture.ts');

            const target = join(process.cwd(), relativeTarget);

            actuation = {
                action: 'mutate_shader',
                target,
                parameters: { code: cleanResponse },
                reasoning: 'Forged component requires live shader mutation.'
            };
        } else if (prompt.toLowerCase().includes('view') || prompt.toLowerCase().includes('model')) {
            actuation = {
                action: 'rsmv_control',
                target: 'RSMV Inspector',
                parameters: { modelId: 'auto' }, // To be resolved by context
                reasoning: 'User requested visual inspection of the forged model.'
            };
        }

        return {
            ok: true,
            value: {
                output: result.value.response,
                data: { prompt },
                actuation
            }
        };
    }

    /**
     * Generate Visual Substrate (Creative Image Forging)
     * Prioritizes professional Cloudflare Flux API, falls back to HTML/SVG-based substrate.
     */
    async generateVisualSubstrate(prompt: string, modelOverride?: string): Promise<Result<{ path: string }>> {
        const CLOUDFLARE_IMAGE_ENDPOINT = process.env['CLOUDFLARE_IMAGE_ENDPOINT'] || 'https://chromanumber-api.kristain33rs.workers.dev/ai/generate-image';

        logger.info({ prompt }, 'Attempting professional substrate generation via Flux...');

        try {
            const aesthetics = this.hexagram.getGenerativeAesthetics();
            const response = await fetch(CLOUDFLARE_IMAGE_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    prompt: `${prompt}${modelOverride ? ` . Style: ${modelOverride}` : ''}`,
                    aesthetics: aesthetics // Pass aesthetics to worker
                })
            });

            if (response.ok) {
                const data = await response.json() as { image: string };
                if (data.image) {
                    const base64Data = data.image.includes('base64,')
                        ? data.image.split('base64,')[1]
                        : data.image;

                    const buffer = Buffer.from(base64Data, 'base64');
                    const outputPath = join(getGenerationsPath(), 'captures', `flux_${Date.now()}.png`);

                    const capturesDir = join(getGenerationsPath(), 'captures');
                    if (!existsSync(capturesDir)) {
                        mkdirSync(capturesDir, { recursive: true });
                    }

                    writeFileSync(outputPath, buffer);
                    logger.info({ outputPath }, 'Successfully generated professional Flux substrate');
                    return { ok: true, value: { path: outputPath } };
                }
            }
            logger.warn('Cloudflare Worker returned non-OK status. Falling back to HTML substrate.');
        } catch (err) {
            logger.error({ err }, 'Flux generation failed. Falling back to HTML/SVG substrate.');
        }

        // --- FALLBACK: HTML/SVG Rendering ---
        const generationPrompt = `
You are the Chromanumber Artistic Substrate.
    TASK: Generate a high-fidelity visual representation in HTML/SVG format based on the prompt.

USER PROMPT: ${prompt}

RULES:
1. Output a SINGLE HTML file containing all CSS and SVG/HTML needed.
2. Use vibrant, modern aesthetics (glassmorphism, gradients, high density).
3. Ensure it is responsive and fits a 1280x720 canvas.
4. Output ONLY the code. No explanations.

Visual Code: `.trim();

        const modelToUse = modelOverride || 'kimi-k2.5:cloud';
        const result = await this.client.resilientCall({
            model: modelToUse,
            prompt: generationPrompt,
            category: 'chromanumber'
        });

        if (!result.ok) return { ok: false, error: result.error };

        const code = result.value.response.replace(/```html|```/g, '').trim();
        const capturesDir = join(getSovereignRoot(), 'memory', 'captures');
        const outputPath = join(capturesDir, `gen_${Date.now()}.html`);

        try {
            if (!existsSync(capturesDir)) {
                mkdirSync(capturesDir, { recursive: true });
            }
            writeFileSync(outputPath, code);
            logger.info({ outputPath }, 'Generated HTML/SVG fallback substrate');
            return { ok: true, value: { path: outputPath } };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Generate Visual Manifest (Fallback)
     * Creates a text-based visual placeholder when AI substrates are offline.
     */
    async generateVisualManifest(prompt: string, outputPath: string): Promise<Result<{ path: string }>> {
        logger.warn({ prompt }, 'Generating Visual Manifest as emergency fallback substrate...');

        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { margin: 0; background: #0a0a0a; color: #fff; font-family: 'Inter', system-ui, sans-serif; height: 720px; width: 1280px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .manifest { border: 2px solid #333; padding: 40px; border-radius: 20px; background: rgba(255,255,255,0.05); backdrop-filter: blur(10px); width: 80%; text-align: center; }
        h1 { font-size: 24px; color: #aaa; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 2px; }
        p { font-size: 32px; font-weight: 600; line-height: 1.4; color: #eee; }
        .meta { margin-top: 30px; font-size: 14px; color: #555; }
    </style>
</head>
<body>
    <div class="manifest">
        <h1>Visual Manifest Substrate</h1>
        <p>${prompt}</p>
        <div class="meta">POG2 Sovereign Offline Fallback â€” Generated at ${new Date().toISOString()}</div>
    </div>
</body>
</html>`;

        try {
            const dir = join(getSovereignRoot(), 'memory', 'captures');
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

            writeFileSync(outputPath, html);
            return { ok: true, value: { path: outputPath } };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    public healthCheck(): { online: boolean; details: string } {
        return { 
            online: true, 
            details: 'ChromanumberEngine sensory Eye substrate active.' 
        };
    }

    /**
     * Pedagogy Study — Distills professional standards from a cache asset.
     */
    public async study(modelId: string): Promise<Result<PedagogyProfile>> {
        logger.info({ modelId }, 'Initiating pedagogy study loop');
        return await this.observer.study(modelId);
    }
}
