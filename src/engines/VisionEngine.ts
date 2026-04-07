import { EventEmitter } from 'node:events';
import { ModelClient } from '../clients/ModelClient.js';
import { ShellEngine } from './ShellEngine.js';
import { Renderer } from '../ui/Renderer.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import type { Result, EngineOutput } from '../core/models.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createLogger } from "../utils/logger.js";
import { SovereignEye } from '../utils/SovereignEye.js';

const logger = createLogger('VisionEngine');

export interface VisionParams {
    intent: 'chroma' | 'eye' | 'generic';
    target?: string; // process name or file path
    prompt?: string;
    modelOverride?: string;
}

/**
 * VisionEngine Ã¢â‚¬â€ Multimodal observation substrate.
 * Implements SoverignEye (system-wide viewing) and Chromanumber (color/line mapping).
 */
export class VisionEngine extends EventEmitter {
    private static instance: VisionEngine;
    private readonly client: ModelClient;
    private readonly shell: ShellEngine;
    private readonly eye: SovereignEye;

    private static initialized = false;

    public static getInstance(config: SovereignConfig, renderer: Renderer): VisionEngine {
        if (!this.instance) {
            if (!config || !renderer) {
                throw new Error("VisionEngine requires config on first initialization");
            }
            this.instance = new VisionEngine(config, renderer);
            this.initialized = true;
        }
        return this.instance;
    }

    public static isInitialized(): boolean {
        return this.initialized;
    }

    private constructor(
        private readonly config: SovereignConfig,
        private readonly renderer: Renderer
    ) {
        super();
        this.client = new ModelClient(config);
        this.shell = new ShellEngine(renderer);
        this.eye = new SovereignEye('vision-engine');
        
        // Proxy SovereignEye captures to VisionEngine listeners (Switchboard)
        this.eye.on('capture', (res) => this.emit('capture', res));
    }

    async observe(params: VisionParams): Promise<Result<EngineOutput>> {
        const screenshotPath = join(tmpdir(), `POG2_obs_${Date.now()}.png`);

        // 1. Capture State (SoverignEye)
        if (params.intent === 'eye' || params.intent === 'chroma') {
            this.renderer.info('Capturing system state via SoverignEye...');
            const captureRes = await this.eye.capture({ type: 'window', target: params.target || 'POG2' });
            if (!captureRes.ok) return captureRes as any;
        }

        const imagePath = params.target && existsSync(params.target)
            ? params.target
            : screenshotPath;

        if (!existsSync(imagePath)) {
            return { ok: false, error: new Error(`Image not found for vision analysis: ${imagePath}`) };
        }

        // 2. Multimodal Analysis
        const base64Image = readFileSync(imagePath).toString('base64');
        const modelPrompt = this.buildVisionPrompt(params);

        const result = await this.client.call({
            model: params.modelOverride ?? this.config.visionModel,
            prompt: modelPrompt,
            images: [base64Image]
        });

        if (!result.ok) return result as any;

        return {
            ok: true,
            value: {
                output: result.value.response,
                data: {
                    intent: params.intent,
                    model: this.config.visionModel,
                    source: imagePath
                }
            }
        };
    }


    private buildVisionPrompt(params: VisionParams): string {
        if (params.intent === 'chroma') {
            return `
CHROMANUMBER TECHNICAL ANALYSIS:
You are the Chromanumber Substrate. Decompile this image into a rigorous technical color map.

TASKS:
1. COLOR KEY: Identify all unique HEX codes (#) used. Match them to UI tokens (Primary, Secondary, Background, Accent).
2. TOPOLOGY: Map the spatial coordinates of color regions (e.g., [0-100, 0-50] = #1A1A1A).
3. EDGE DETECTION: Identify the precise lines between contrasting colors.
4. KEY: Provide a final legend/key mapping colors to intended functions or elements.

OUTPUT FORMAT:
- HEX Palette List
- Region Grid Map
- Topology Summary
- Functional Key
`.trim();
        }

        if (params.intent === 'eye') {
            return `
You are SoverignEye. Analyze this system view/process screenshot.
TASKS:
1. Describe the active windows and visible content (HTML, HTTP, Localhost, Wrangler dev pages, etc.).
2. Detect any UI bugs, alignment issues, or console errors visible.
3. Provide a high-level summary of the current user workspace.
`.trim();
        }

        return params.prompt ?? "Analyze this image and describe its contents in technical detail.";
    }

    /**
     * Diagnostic probe for NodeTester.
     */
    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const capture = await this.eye.capture({ type: 'window', target: 'POG2' });
        const online = capture.ok;
        return {
            online,
            details: `Vision Substrate: ${online ? 'ONLINE' : 'OFFLINE'} (SoverignEye Win32 capture: ${online ? 'SUCCESS' : 'FAILED'})`
        };
    }
}
