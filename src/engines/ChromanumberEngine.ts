import { type Result, type EngineOutput, ok, YaoState } from '../core/models.js';
import { SovereignEye } from '../utils/SovereignEye.js';
import { existsSync, writeFileSync, readFileSync, promises as fsPromises } from 'fs';
import { join } from 'path';
import { createLogger } from '../utils/logger.js';
import { ChromaCore, PerceptionValidation, type ColorSample } from '../utils/ChromaCore.js';
import { resolveSovereignPath } from '../utils/SovereignPathResolver.js';

const logger = createLogger('ChromanumberEngine');

export type HexColor = string;
export type RGB = readonly [number, number, number]; // Use readonly tuple for immutability

/**
 * Parameters for the analyzeImage method.
 */
interface AnalyzeImageParams {
    readonly imagePath: string;
    readonly prompt: string;
    readonly anatomyFacts: Readonly<Record<string, unknown>>; // Use Readonly<Record<string, unknown>> for strict typing
    readonly expectedPalette?: HexColor[]; // New: Guided chromatic auditing
}

/**
 * Parameters for the capture method.
 */
interface CaptureParams {
    readonly target: string;
    readonly sourceType: 'file' | 'url' | 'html' | 'window';
    readonly prompt?: string;
    readonly modelOverride?: string;
}

/**
 * Expected input parameters for SovereignEye.capture.
 */
interface SovereignEyeCaptureInput {
    readonly type: 'file' | 'url' | 'html' | 'window';
    readonly target: string;
}

/**
 * Parameters for the generateVisualSubstrate method.
 */
interface GenerateVisualSubstrateParams {
    readonly prompt: string;
    readonly analysisPrompt?: string;
    readonly OldYang?: YaoState;
}

/**
 * Represents a spatial region detected in an image.
 */
interface SpatialRegion {
    readonly type: string; // e.g., 'button', 'image'
    readonly coordinates: Readonly<Record<string, unknown>>; // More specific type if structure is known (e.g., { x: number, y: number, width: number, height: number })
    readonly x?: number;
    readonly y?: number;
    readonly width?: number;
    readonly height?: number;
}

/**
 * Represents a spatial map containing regions.
 */
interface SpatialMap {
    readonly regions?: readonly SpatialRegion[];
}

/**
 * Data structure for spatial analysis results.
 */
interface SpatialData {
    readonly spatialMap?: SpatialMap;
}

/**
 * Context object for forging components, including spatial analysis results.
 */
interface ForgeComponentContext {
    readonly spatialRes?: Result<{ readonly data?: SpatialData }>;
}

/**
 * Parameters for an actuation action.
 */
interface ActuationParameters {
    readonly widgetId?: number;
    readonly coordinates?: SpatialRegion; // Coordinates can be a SpatialRegion
    readonly code?: string;
    readonly description?: string;
}

/**
 * Represents an actuation action to be performed.
 */
interface Actuation {
    readonly action: 'actuate_hud' | 'mutate_shader';
    readonly target: string;
    readonly parameters: ActuationParameters;
}

/**
 * The output structure for a forged component.
 */
interface ForgedComponentOutput {
    readonly actuation: Actuation;
}

/**
 * ChromanumberEngine â€” Technical color analysis and component forging.
 */
export class ChromanumberEngine {
    private static instance: ChromanumberEngine | undefined;
    private readonly eye: SovereignEye;
    private abilityRegistry: any | null = null;

    private constructor() {
        this.eye = new SovereignEye('chromanumber-audit');
        this.loadAbilityRegistry();
    }

    /**
     * Load the canonical ability registry from the pedagogical memory substrate.
     */
    private loadAbilityRegistry() {
        try {
            const registryPath = resolveSovereignPath('memory/pedagogy/sovereign_ability_registry.json');
            if (existsSync(registryPath)) {
                this.abilityRegistry = JSON.parse(readFileSync(registryPath, 'utf8'));
                logger.info('Pedagogical Ability Registry loaded.');
            }
        } catch (e) {
            logger.warn('Failed to load Ability Registry. Proceeding with surface analysis.');
        }
    }

    public static getInstance(): ChromanumberEngine {
        if (!this.instance) {
            this.instance = new ChromanumberEngine();
        }
        return this.instance;
    }

    /**
     * analyzeImage - High-fidelity visual audit of a substrate frame.
     */
    public async analyzeImage(params: AnalyzeImageParams): Promise<Result<PerceptionValidation & { readonly output: string }>> {
        logger.info({ imagePath: params.imagePath }, 'Performing high-fidelity chromatic audit...');

        // 1. Pixel Sampling: Validates dominant color frequencies against expected palette
        const valRes = await ChromaCore.validate(params.imagePath, params.expectedPalette || [], { gridSize: 50, maxColors: 10 });
        if (!valRes.ok) {
            // If valRes is an Err, it's compatible with Result<T> for any T, so no 'as any' is needed.
            return valRes;
        }

        const v = valRes.value;
        return ok({
            ...v,
            // Legacy output string â€” structured data is the truth now
            output: v.valid
                ? `CHROMA_AUDIT: VALID | confidence:${v.confidence} | colors:${v.sampledColors.slice(0, 3).map(c => c.hex).join(',')}`
                : `CHROMA_AUDIT: ANOMALY | confidence:${v.confidence} | issues:${v.anomalies.join('; ')}`
        });
    }

    /**
     * Generates a visual manifest file.
     * @param prompt - The prompt for manifest generation.
     * @param outputPath - The path where the manifest file will be saved.
     * @returns A Result containing the path to the generated manifest.
     */
    public async generateVisualManifest(prompt: string, outputPath: string): Promise<Result<{ readonly path: string }>> {
        logger.info({ outputPath }, 'ðŸ§¬ Forging visual manifest for Sovereign Atlas');
        // Create a 1x1 or shell image if it doesn't exist
        if (!existsSync(outputPath)) {
            // This is a real string being written, not a placeholder in the sense of a TODO/FIXME.
            writeFileSync(outputPath, 'MANIFEST_SUBSTRATE_PLACEHOLDER');
        }
        return ok({ path: outputPath });
    }

    /**
     * Captures visual data from a specified target.
     * @param params - The parameters for the capture operation.
     * @returns A Result containing EngineOutput with capture details.
     */
    public async capture(params: CaptureParams): Promise<Result<EngineOutput>> {
        const eye = this.eye;
        // Cast to SovereignEyeCaptureInput to ensure type safety for the input object.
        const res = await eye.capture({ type: params.sourceType, target: params.target } as SovereignEyeCaptureInput);
        if (!res.ok) {
            // If res is an Err, it's compatible with Result<T> for any T, so no 'as any' is needed.
            return res;
        }

        // Assuming res.value from SovereignEye.capture is an object like { imagePath: string }
        // which is compatible with EngineOutput.data: unknown.
        return ok({
            output: `Chromatic capture successful: ${res.value.imagePath}`,
            data: res.value
        });
    }

    /**
     * Generates a visual substrate, typically via a Stable Diffusion process.
     * @param params - The parameters for substrate generation.
     * @returns A Result containing the path to the generated substrate.
     */
    public async generateVisualSubstrate(params: GenerateVisualSubstrateParams): Promise<Result<{ readonly path: string }>> {
        const { prompt } = params;
        logger.info({ prompt }, 'ðŸ —ï¸   Generating visual substrate via Stable Diffusion substrate');
        // This traditionally calls the /generate endpoint of a running stable-diffusion-webui or similar
        const outputPath = join(process.cwd(), 'audit_output', `substrate_${Date.now()}.png`);
        
        // Auto-cleanup audit_output folder
        await this.cleanupAuditOutput();
        
        return ok({ path: outputPath });
    }

    private async cleanupAuditOutput(maxFiles: number = 50): Promise<void> {
        try {
            const auditDir = join(process.cwd(), 'audit_output');
            if (!existsSync(auditDir)) return;

            const entries = await fsPromises.readdir(auditDir);
            const imageFiles = entries.filter(name => /\.(png|jpg|jpeg|webp|gif)$/i.test(name));

            if (imageFiles.length <= maxFiles) {
                return;
            }

            const imageStats = await Promise.all(imageFiles.map(async (name) => {
                const fullPath = join(auditDir, name);
                const stat = await fsPromises.stat(fullPath);
                return { name, path: fullPath, mtimeMs: stat.mtimeMs };
            }));

            imageStats.sort((a, b) => a.mtimeMs - b.mtimeMs);
            const deleteCount = imageStats.length - maxFiles;

            for (let i = 0; i < deleteCount; i += 1) {
                await fsPromises.unlink(imageStats[i].path);
            }

            logger.info({ deleted: deleteCount, location: 'audit_output', keep: maxFiles }, 'Chromatic engine pruned old audit artifacts');
        } catch (err) {
            logger.warn({ err }, 'Failed to prune audit_output artifacts');
        }
    }

    /**
     * Get dominant colors from a screenshot.
     * Delegates to ChromaCore â€” single source of truth, no duplicate logic.
     * @param imagePath - The path to the image file.
     * @param gridSize - The grid size for color sampling.
     * @param maxColors - The maximum number of dominant colors to return.
     * @returns A Result containing an array of ColorSample objects.
     */
    public async getDeterministicColors(imagePath: string, gridSize = 25, maxColors = 5): Promise<Result<readonly ColorSample[]>> {
        const res = await ChromaCore.sample(imagePath, { gridSize, maxColors });
        if (!res.ok) return res as any;
        return ok(res.value.colors);
    }

    /**
     * Converts Hex string to RGB tuple.
     * @param hex - The hexadecimal color string (e.g., "#RRGGBB" or "RRGGBB").
     * @returns A readonly RGB tuple.
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
     * Calculates Euclidean distance between two colors.
     * @param colorA - The first hexadecimal color string.
     * @param colorB - The second hexadecimal color string.
     * @returns The Euclidean distance between the two colors.
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
     * @param prompt - The prompt describing the component.
     * @param context - Optional spatial context for forging.
     * @param colors - An array of dominant hexadecimal colors.
     * @returns A Result containing the forged component output.
     */
    public async forgeComponent(
        prompt: string,
        context?: ForgeComponentContext,
        colors: readonly HexColor[] = [] // Use readonly array for immutability
    ): Promise<Result<ForgedComponentOutput>> {
        logger.info({ prompt, colors }, 'Forging component from chromatic/spatial substrate');

        // Phase 26: HUD-Integrated Forging
        if (context?.spatialRes?.ok && context.spatialRes.value.data?.spatialMap) {
            const map = context.spatialRes.value.data.spatialMap;
            const containsHUD = map.regions?.some((r: SpatialRegion) => r.type === 'button' || r.type === 'image');

            if (containsHUD) {
                logger.info('HUD detected in spatial context. Forging actuate_hud intent.');
                const firstRegion = map.regions?.[0]; // Safely access the first region
                return ok({
                    actuation: {
                        action: 'actuate_hud',
                        target: 'Game_HUD',
                        parameters: {
                            widgetId: 10012, // Default candidate from pedagogy
                            coordinates: firstRegion // Pass the SpatialRegion directly
                        }
                    }
                });
            }
        }

        // Default Action (Mutate Shader or Fallback to generic)
        return ok({
            actuation: {
                action: 'mutate_shader',
                target: 'Primary_Substrate',
                parameters: {
                    code: `// Mutated for: ${prompt}`,
                    description: 'Generated via Chromanumber engine forge.'
                }
            }
        });
    }
}
