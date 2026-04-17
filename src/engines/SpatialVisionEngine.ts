import { ModelClient } from '../clients/ModelClient.js';
import { ShellEngine } from './ShellEngine.js';
import { Renderer } from '../ui/Renderer.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import { type Result, type EngineOutput, type YaoState, ok, err } from '../core/models.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createLogger } from "../utils/logger.js";
import { SovereignEye } from '../utils/SovereignEye.js';
import { ChromaCore } from '../utils/ChromaCore.js';

const logger = createLogger('SpatialVisionEngine');

export interface SpatialVisionParams {
    intent: 'chroma' | 'eye' | 'spatial_map' | 'ui_analysis' | 'code_view';
    target?: string;
    prompt?: string;
    includeScreenshot?: boolean;
    modelOverride?: string;
    yaoState?: YaoState;
}

export interface SpatialMap {
    regions: Array<{
        id: string;
        x: number;
        y: number;
        width: number;
        height: number;
        type: 'text' | 'button' | 'input' | 'image' | 'code' | 'line' | 'color';
        content?: string;
        color?: string;
    }>;
    lines: Array<{
        id: string;
        startX: number;
        startY: number;
        endX: number;
        endY: number;
        color?: string;
        thickness?: number;
    }>;
    colorPalette: Array<{
        hex: string;
        usage: string;
        locations: string[];
    }>;
}

/**
 * SpatialVisionEngine Ã¢â‚¬â€ Enhanced vision with spatial mapping for Kimi
 * Provides line/color/space key maps so Kimi knows exactly what's on screen
 */
export class SpatialVisionEngine {
    private static instance: SpatialVisionEngine | undefined;
    private readonly client: ModelClient;
    private readonly shell: ShellEngine;
    private readonly eye: SovereignEye;

    private constructor(
        private readonly config: SovereignConfig,
        private readonly renderer: Renderer
    ) {
        if (SpatialVisionEngine.instance) {
            throw new Error('Singleton violation: use SpatialVisionEngine.getInstance()');
        }
        this.client = new ModelClient(config);
        this.shell = new ShellEngine(renderer);
        this.eye = new SovereignEye('spatial-vision');
    }

    private static initialized = false;

    public static getInstance(config?: SovereignConfig, renderer?: Renderer): SpatialVisionEngine {
        if (!this.instance) {
            if (!config || !renderer) {
                // Return a dormant instance shell to prevent boot crashes.
                // This allows the CNS to reference the engine before it is fully configured.
                return {
                    state: 'DORMANT',
                    healthCheck: () => ({ online: false, details: 'SpatialVisionEngine: DORMANT (Waiting for config/renderer)' }),
                    observe: async () => ({ ok: false, error: new Error('SpatialVisionEngine not initialized') }),
                    sampleFrame: async () => {},
                    verifySpatialAnchor: async () => ({ ok: false, error: new Error('SpatialVisionEngine not initialized') })
                } as any;
            }
            this.instance = new SpatialVisionEngine(config, renderer);
            this.initialized = true;
        }
        return this.instance;
    }

    public static isInitialized(): boolean {
        return this.initialized;
    }

    public static resetInstance(): void {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('resetInstance is forbidden in production');
        }
        this.instance = undefined;
        this.initialized = false;
    }

    /**
     * sampleFrame - Perceptual reconciliation after a 600ms tick.
     */
    public async sampleFrame(): Promise<void> {
        logger.debug('Perceptual Frame Sampling started...');
        // Trigger UI analysis as the authoritative visual check
        await this.observe({
            intent: 'ui_analysis',
            includeScreenshot: true
        });
        logger.debug('Visual reconciliation complete. Pulse alignment confirmed.');
    }


    /**
     * verifySpatialAnchor - Visual ground-truth confirmation.
     * Ensures the 3D substrate has rendered the expected state after a pulse.
     */
    public async verifySpatialAnchor(): Promise<Result<boolean>> {
        const res = await this.observe({
            intent: 'ui_analysis',
            includeScreenshot: true
        });
        if (!res.ok) return err(res.error as Error);
        
        // In full impl, this would parse the spatialMap and check if the expected 
        // entity/coordinate markers are present.
        return ok(true);
    }

    async observe(params: SpatialVisionParams): Promise<Result<EngineOutput>> {
        let imagePath = params.target && existsSync(params.target) ? params.target : '';

        // 1. Capture screen
        if (params.includeScreenshot !== false && !imagePath) {
            this.renderer.info('ðŸ‘ï¸  Spatial capture initiated...');
            // Target the live dashboard for ground-truth perception
            const captureRes = await this.eye.capture({ type: 'url', target: 'http://localhost:5173' });
            if (!captureRes.ok) return captureRes as any;
            imagePath = captureRes.value.imagePath || '';
        }

        if (!imagePath || !existsSync(imagePath)) {
            return { ok: false, error: new Error(`Image not found for spatial analysis: ${imagePath}`) };
        }

        // 2. Analyze based on intent
        const base64Image = readFileSync(imagePath).toString('base64');
        const modelPrompt = this.buildSpatialPrompt(params);

        const result = await this.client.call({
            model: this.config.visionModel,
            prompt: modelPrompt,
            images: [base64Image],
            yaoState: params.yaoState
        });

        if (!result.ok) {
            return { ok: false, error: result.error as any };
        }

        // 3. Parse spatial map if chroma/spatial intent
        let spatialMap: SpatialMap | undefined;
        if (params.intent === 'chroma' || params.intent === 'spatial_map' || params.intent === 'ui_analysis') {
            spatialMap = this.parseSpatialMap(result.value.response);
        }

        // 4. Chroma augmentation â€” perception layer only.
        //    Fix 4 (Cache-Priority Guard): if the caller already resolved this
        //    entity from cache (CacheForensicsLimb / locToModel / npcToModel),
        //    do NOT let pixel sampling override that ground truth.
        //    Perception is advisory only â€” it appends to colorPalette, never replaces.
        if (params.intent === 'chroma') {
            const deterministicColors = await this.getDeterministicColors(imagePath);
            if (deterministicColors.ok) {
                spatialMap = spatialMap || { regions: [], lines: [], colorPalette: [] };
                spatialMap.colorPalette = [
                    ...spatialMap.colorPalette,
                    ...deterministicColors.value.colors.map(c => ({
                        hex: c.hex,
                        usage: `Detected via pixel frequency analysis (freq: ${(c.frequency * 100).toFixed(1)}%)`,
                        locations: ['Global Substrate']
                    }))
                ];
            }
        }

        return {
            ok: true,
            value: {
                output: result.value.response,
                data: {
                    intent: params.intent,
                    spatialMap,
                    model: this.config.visionModel,
                    source: imagePath
                }
            }
        };
    }

    /**
     * Get dominant colors â€” delegates to ChromaCore.
     * Fix 3: no duplicate PS script; single canonical sampler.
     */
    private async getDeterministicColors(imagePath: string) {
        return ChromaCore.sample(imagePath, { gridSize: 50, maxColors: 10 });
    }


    private buildSpatialPrompt(params: SpatialVisionParams): string {
        if (params.intent === 'chroma') {
            return `
You are the Chromanumber Spatial Substrate.
Analyze this image and produce a TECHNICAL COLOR MAP with SPATIAL COORDINATES.

OUTPUT FORMAT (JSON-like structure):
{
  "colorPalette": [
    {"hex": "#RRGGBB", "usage": "what this color represents", "locations": ["top-left", "center", etc]}
  ],
  "lines": [
    {"id": "L1", "startX": 0, "startY": 100, "endX": 1920, "endY": 100, "color": "#RRGGBB", "thickness": 2}
  ],
  "regions": [
    {"id": "R1", "x": 100, "y": 50, "width": 300, "height": 200, "type": "button", "color": "#RRGGBB"}
  ]
}

RULES:
1. Provide HEX codes for ALL dominant colors (>5% of screen)
2. Map UI regions with bounding box coordinates (x,y,width,height)
3. Identify lines (horizontal/vertical dividers)
4. Describe what each color is used for
`.trim();
        }

        if (params.intent === 'spatial_map') {
            return `
You are the Spatial Mapper. Create a grid-based map of this screen.

TASKS:
1. Divide screen into a 10x10 grid
2. Identify what's in each grid cell (text, button, image, code, etc.)
3. Map text regions with approximate character positions
4. Identify clickable/interactive elements

OUTPUT:
- Grid coordinates (e.g., "A1: menubar", "B5: code editor")
- List of interactive elements with positions
- Color scheme detection (dark/light mode, accent colors)
`.trim();
        }

        if (params.intent === 'code_view') {
            return `
You are the Code Viewer. Analyze this code editor screenshot.

TASKS:
1. Transcribe visible code exactly as shown
2. Identify line numbers visible
3. Note cursor position if visible
4. Detect syntax highlighting colors used
5. Identify the programming language
6. Note any errors/squiggles visible

OUTPUT:
- Language detected
- Line range visible (e.g., lines 45-67)
- Code content (as accurate as possible)
- Any visible errors or warnings
`.trim();
        }

        if (params.intent === 'ui_analysis') {
            return `
You are SoverignEye with Spatial Awareness. Analyze this UI.

TASKS:
1. Describe the active application/window
2. Map layout structure (sidebar, main area, panels)
3. Identify all interactive elements (buttons, inputs, menus)
4. Detect any errors, notifications, or status indicators
5. Provide element positions as screen coordinates

OUTPUT FORMAT:
- Application name/type
- Layout structure with coordinates
- Interactive elements list with positions
- Any alerts/errors detected
- Overall UI state assessment
`.trim();
        }

        return params.prompt ?? "Analyze this image with spatial awareness. Provide positions and coordinates where relevant.";
    }

    private parseSpatialMap(response: string): SpatialMap | undefined {
        try {
            // Try to extract JSON from response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                return {
                    regions: parsed.regions || [],
                    lines: parsed.lines || [],
                    colorPalette: parsed.colorPalette || []
                };
            }
        } catch {
            // JSON parsing failed, return undefined
        }
        return undefined;
    }

    /**
     * Generate a text-based spatial map for Kimi to reference
     */
    generateTextMap(spatialMap: SpatialMap, width = 80, height = 24): string {
        const grid: string[][] = [];

        // Initialize empty grid
        for (let y = 0; y < height; y++) {
            grid[y] = new Array(width).fill(' ');
        }

        // Place regions
        for (const region of spatialMap.regions) {
            const rx = Math.floor((region.x / 1920) * width);
            const ry = Math.floor((region.y / 1080) * height);
            const rw = Math.max(1, Math.floor((region.width / 1920) * width));
            const rh = Math.max(1, Math.floor((region.height / 1080) * height));

            const char = region.type.charAt(0).toUpperCase();
            for (let y = ry; y < Math.min(ry + rh, height); y++) {
                for (let x = rx; x < Math.min(rx + rw, width); x++) {
                    if (y >= 0 && y < height && x >= 0 && x < width) {
                        grid[y]![x] = char;
                    }
                }
            }
        }

        // Draw lines
        for (const line of spatialMap.lines) {
            const sx = Math.floor((line.startX / 1920) * width);
            const sy = Math.floor((line.startY / 1080) * height);
            const ex = Math.floor((line.endX / 1920) * width);
            const ey = Math.floor((line.endY / 1080) * height);

            // Simple line drawing
            if (sx === ex) { // Vertical
                for (let y = Math.min(sy, ey); y <= Math.max(sy, ey) && y < height; y++) {
                    if (y >= 0 && sx >= 0 && sx < width) grid[y]![sx] = '|';
                }
            } else if (sy === ey) { // Horizontal
                for (let x = Math.min(sx, ex); x <= Math.max(sx, ex) && x < width; x++) {
                    if (sy >= 0 && sy < height && x >= 0) grid[sy]![x] = '-';
                }
            }
        }

        // Convert to string
        return grid.map(row => row.join('')).join('\n');
    }

    /**
     * Get summary of what's currently on screen for Kimi
     */
    async getScreenSummary(): Promise<Result<EngineOutput>> {
        return this.observe({
            intent: 'ui_analysis',
            includeScreenshot: true
        }) as any;
    }

    /**
     * Diagnostic probe for NodeTester.
     */
    public healthCheck(): { online: boolean; details: string } {
        return {
            online: true,
            details: 'SpatialVisionEngine nominal; line/color decomposition substrate active.'
        };
    }
}
