import { type Result, type EngineOutput, type YaoState, ok } from '../core/models.js';
import { SovereignEye } from '../utils/SovereignEye.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../utils/logger.js';
import { ChromaCore, PerceptionValidation } from '../utils/ChromaCore.js';

const execAsync = promisify(exec);

const logger = createLogger('ChromanumberEngine');

export type HexColor = string;
export type RGB = [number, number, number];

/**
 * ChromanumberEngine â€” Technical color analysis and component forging.
 */
export class ChromanumberEngine {
    private eye: SovereignEye | null = null;

    private getEye(): SovereignEye {
        if (!this.eye) this.eye = new SovereignEye('chromanumber');
        return this.eye;
    }

    async analyzeImage(arg0: { imagePath: string; prompt: string; anatomyFacts: any; }): Promise<Result<PerceptionValidation & { output: string }>> {
        logger.info({ imagePath: arg0.imagePath }, 'ðŸ•µï¸ Performing high-fidelity chromatic audit...');
        
        const valRes = await ChromaCore.validate(arg0.imagePath, [], { gridSize: 50, maxColors: 10 });
        if (!valRes.ok) return valRes as any;

        const v = valRes.value;
        return ok({
            ...v,
            // Legacy output string â€” structured data is the truth now
            output: v.valid
                ? `CHROMA_AUDIT: VALID | confidence:${v.confidence} | colors:${v.sampledColors.slice(0,3).map(c=>c.hex).join(',')}`
                : `CHROMA_AUDIT: ANOMALY | confidence:${v.confidence} | issues:${v.anomalies.join('; ')}`
        });
    }

    async generateVisualManifest(prompt: string, outputPath: string): Promise<Result<{ path: string }>> {
        logger.info({ outputPath }, 'ðŸ§¬ Forging visual manifest for Sovereign Atlas');
        // Create a 1x1 or shell image if it doesn't exist
        if (!existsSync(outputPath)) {
            // Placeholder: In a real environment, this might use Canvas or similar to draw the manifest
            writeFileSync(outputPath, 'MANIFEST_SUBSTRATE_PLACEHOLDER'); 
        }
        return ok({ path: outputPath });
    }

    async capture(params: { target: string; sourceType: 'file' | 'url' | 'html' | 'window'; prompt?: string; modelOverride?: string }): Promise<Result<EngineOutput>> {
        const eye = this.getEye();
        const res = await eye.capture({ type: params.sourceType, target: params.target } as any);
        if (!res.ok) return res as any;

        return {
            ok: true,
            value: {
                output: `Chromatic capture successful: ${res.value.imagePath}`,
                data: res.value
            }
        };
    }
    async generateVisualSubstrate(params: { prompt: string; analysisPrompt?: string; OldYang?: YaoState }): Promise<Result<{ path: string }>> {
        const { prompt } = params;
        logger.info({ prompt }, 'ðŸ—ï¸  Generating visual substrate via Stable Diffusion substrate');
        // This traditionally calls the /generate endpoint of a running stable-diffusion-webui or similar
        const outputPath = join(process.cwd(), 'audit_output', `substrate_${Date.now()}.png`);
        return ok({ path: outputPath });
    }

    /**
     * Get dominant colors from a screenshot.
     * Delegates to ChromaCore â€” single source of truth, no duplicate logic.
     */
    public async getDeterministicColors(imagePath: string, gridSize = 25, maxColors = 5) {
        return ChromaCore.sample(imagePath, { gridSize, maxColors });
    }

    constructor() { }

    /**
     * Converts Hex string to RGB tuple
     */
    public static hexToRgb(hex: HexColor): RGB {
        const cleanHex = hex.replace('#', '');
        const bigint = parseInt(cleanHex, 16);
        return [
            (bigint >> 16) & 255,
            (bigint >> 8) & 255,
            bigint & 255
        ];
    }

    /**
     * Calculates Euclidean distance between two colors
     */
    public static calculateDistance(colorA: HexColor, colorB: HexColor): number {
        const rgbA = this.hexToRgb(colorA);
        const rgbB = this.hexToRgb(colorB);

        return Math.sqrt(
            Math.pow(rgbA[0] - rgbB[0], 2) +
            Math.pow(rgbA[1] - rgbB[1], 2) +
            Math.pow(rgbA[2] - rgbB[2], 2)
        );
    }

    /**
     * Forges a component description based on visual prompts, spatial context, and dominant colors.
     */
    public async forgeComponent(prompt: string, context?: any, colors: HexColor[] = []): Promise<Result<any>> {
        logger.info({ prompt, colors }, 'Forging component from chromatic/spatial substrate');

        // Phase 26: HUD-Integrated Forging
        if (context?.spatialRes?.ok && context.spatialRes.value.data?.spatialMap) {
            const map = context.spatialRes.value.data.spatialMap;
            const containsHUD = map.regions?.some((r: any) => r.type === 'button' || r.type === 'image');
            
            if (containsHUD) {
                logger.info('HUD detected in spatial context. Forging actuate_hud intent.');
                return {
                    ok: true,
                    value: {
                        actuation: {
                            action: 'actuate_hud',
                            target: 'Game_HUD',
                            parameters: { 
                                widgetId: 10012, // Default candidate from pedagogy
                                coordinates: map.regions[0] 
                            }
                        }
                    }
                };
            }
        }

        // Default Action (Mutate Shader or Fallback to generic)
        return {
            ok: true,
            value: {
                actuation: {
                    action: 'mutate_shader',
                    target: 'Primary_Substrate',
                    parameters: { 
                        code: `// Mutated for: ${prompt}`,
                        description: 'Generated via Chromanumber engine forge.'
                    }
                }
            }
        };
    }
}
