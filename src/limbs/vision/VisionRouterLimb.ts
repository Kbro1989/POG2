import { createLogger } from '../../utils/logger.js';
import type { RoutingSnapshot, YaoState } from '../../core/models.js';
import { ImageProcessorLimb, type QutritProcessedImage } from './ImageProcessorLimb.js';

const logger = createLogger('VisionRouterLimb');

export interface QuantumRouteDecision {
    probe: {
        layout_check: number;
        top_panels: string;
        bottom_card: string;
        matrix_form: 'square' | 'inline';
        matrix_off_diagonal_labels: string;
        utf8_hexagram_top: string;
        gate_fidelity_label: string;
        line_direction_arrows: string;
        cz3_subscript: string;
        b7_b87_ambiguity: string;
        issues: string[];
        imageProcessor: {
            paletteSize: number;
            regionCount: number;
            qutritDistribution: Record<0 | 1 | 2, number>;
            dominantHexagram: string;
        };
    };
    state: YaoState;
    snapshot: RoutingSnapshot | null;
    fallback: boolean;
}

export class VisionRouterLimb {
    private static instance: VisionRouterLimb | null = null;
    private lastDecision: QuantumRouteDecision | null = null;

    private constructor() {
        logger.info('VisionRouterLimb initialized. Awaiting pass card ingestion.');
    }

    public static getInstance(): VisionRouterLimb {
        if (!VisionRouterLimb.instance) VisionRouterLimb.instance = new VisionRouterLimb();
        return VisionRouterLimb.instance;
    }

    public async ingestPassCard(imagePath?: string): Promise<QuantumRouteDecision> {
        try {
            if (!imagePath) throw new Error('ingestPassCard requires imagePath in native mode');

            const processor = ImageProcessorLimb.getInstance();
            const processed = await processor.process(imagePath, 48);
            const summary = processor.summarizeQutritRegions(processed);

            const probe = this.processedImageToProbe(processed, summary);
            const state = this.probeToQutritState(processed, summary);

            const decision: QuantumRouteDecision = {
                probe,
                state,
                snapshot: null,
                fallback: false,
            };

            this.lastDecision = decision;
            logger.info(
                { state: String(state), regions: processed.regions.length, palette: processed.palette.length },
                'Pass card ingested and mapped to qutrit state.',
            );
            return decision;
        } catch (err: any) {
            logger.error({ err }, 'Pass card ingestion failed. Applying Ghost Limb fallback.');
            return this.applyFallback(err?.message ?? String(err));
        }
    }

    public getLastDecision(): QuantumRouteDecision | null {
        return this.lastDecision;
    }

    public reset(): void {
        this.lastDecision = null;
        logger.info('VisionRouterLimb reset. Cache cleared.');
    }

    private processedImageToProbe(processed: QutritProcessedImage, summary: ReturnType<typeof ImageProcessorLimb.prototype.summarizeQutritRegions>): QuantumRouteDecision['probe'] {
        const qutritDistribution: Record<0 | 1 | 2, number> = { 0: 0, 1: 0, 2: 0 };
        for (const r of processed.qutritRegions) qutritDistribution[r.qutritState] += r.pixels.length;

        const dominantRegion = summary[0];
        const dominantHexagram = dominantRegion
            ? `qutrit-${dominantRegion.qutritState}-${dominantRegion.hex}`
            : 'empty';

        return {
            layout_check: 1,
            top_panels: `processed:${processed.palette.length}`,
            bottom_card: `dominant:${dominantHexagram}`,
            matrix_form: 'square',
            matrix_off_diagonal_labels: '',
            utf8_hexagram_top: 'E5 B7 BA',
            gate_fidelity_label: 'pipeline:kmeans+floodfill',
            line_direction_arrows: '4-neighbor-stack',
            cz3_subscript: 'absent; baseline ASCII 3',
            b7_b87_ambiguity: 'b7',
            issues: [],
            imageProcessor: {
                paletteSize: processed.palette.length,
                regionCount: processed.regions.length,
                qutritDistribution,
                dominantHexagram,
            },
        };
    }

    private probeToQutritState(processed: QutritProcessedImage, summary: ReturnType<typeof ImageProcessorLimb.prototype.summarizeQutritRegions>): YaoState {
        if (!summary.length) return 0 as YaoState;
        const dominant = summary[0].qutritState;
        return (dominant === 0 ? 1 : dominant === 1 ? 2 : 0) as YaoState;
    }

    private validateProbe(probe: QuantumRouteDecision['probe']): boolean {
        if (!probe) return false;
        if (probe.issues && probe.issues.length > 0) return false;
        return true;
    }

    private applyFallback(reason: string): QuantumRouteDecision {
        logger.warn({ reason }, 'Ghost Limb fallback engaged. No active pass card state.');
        return {
            probe: {
                layout_check: 0,
                top_panels: '',
                bottom_card: 'fallback',
                matrix_form: 'square',
                matrix_off_diagonal_labels: '',
                utf8_hexagram_top: '',
                gate_fidelity_label: '',
                line_direction_arrows: '',
                cz3_subscript: 'unknown',
                b7_b87_ambiguity: 'unknown',
                issues: [reason],
                imageProcessor: {
                    paletteSize: 0,
                    regionCount: 0,
                    qutritDistribution: { 0: 0, 1: 0, 2: 0 },
                    dominantHexagram: 'fallback',
                },
            },
            state: 0 as YaoState,
            snapshot: null,
            fallback: true,
        };
    }
}

export default VisionRouterLimb;
