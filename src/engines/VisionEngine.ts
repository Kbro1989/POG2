import { ModelClient } from '../clients/ModelClient.js';
import { ShellEngine } from './ShellEngine.js';
import { Renderer } from '../ui/Renderer.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import type { Result, EngineOutput } from '../core/models.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('VisionEngine');

export interface VisionParams {
    intent: 'chroma' | 'eye' | 'generic';
    target?: string; // process name or file path
    prompt?: string;
    modelOverride?: string;
}

/**
 * VisionEngine â€” Multimodal observation substrate.
 * Implements SoverignEye (system-wide viewing) and Chromanumber (color/line mapping).
 */
export class VisionEngine {
    private readonly client: ModelClient;
    private readonly shell: ShellEngine;

    constructor(
        private readonly config: SovereignConfig,
        private readonly renderer: Renderer
    ) {
        this.client = new ModelClient(config);
        this.shell = new ShellEngine(renderer);
    }

    async observe(params: VisionParams): Promise<Result<EngineOutput>> {
        const screenshotPath = join(tmpdir(), `POG2_obs_${Date.now()}.png`);

        // 1. Capture State (SoverignEye)
        if (params.intent === 'eye' || params.intent === 'chroma') {
            this.renderer.info('Capturing system state via SoverignEye...');
            const captureRes = await this.captureScreen(screenshotPath);
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

    private async captureScreen(outputPath: string): Promise<Result<void>> {
        // Real Win32 screen capture via PowerShell
        const command = `powershell -NoProfile -Command "[Reflection.Assembly]::LoadWithPartialName('System.Drawing') | Out-Null; [Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms') | Out-Null; $Screen = [System.Windows.Forms.Screen]::PrimaryScreen; $Width = $Screen.Bounds.Width; $Height = $Screen.Bounds.Height; $Left = $Screen.Bounds.Left; $Top = $Screen.Bounds.Top; $Bitmap = New-Object System.Drawing.Bitmap($Width, $Height); $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap); $Graphics.CopyFromScreen($Left, $Top, 0, 0, $Bitmap.Size); $Bitmap.Save('${outputPath}', [System.Drawing.Imaging.ImageFormat]::Png); $Graphics.Dispose(); $Bitmap.Dispose();"`;

        const res = await this.shell.execute({ command, silent: true });
        if (!res.ok) return res as any;

        return { ok: true, value: undefined };
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
        const screenshotPath = join(tmpdir(), `POG2_probe_${Date.now()}.png`);
        const capture = await this.captureScreen(screenshotPath);
        const online = capture.ok;
        return {
            online,
            details: `Vision Substrate: ${online ? 'ONLINE' : 'OFFLINE'} (SoverignEye Win32 capture: ${online ? 'SUCCESS' : 'FAILED'})`
        };
    }
}
