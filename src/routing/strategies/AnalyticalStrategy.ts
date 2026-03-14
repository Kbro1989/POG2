import type { RoutingContext, RoutingDecision, RoutingStrategy } from '../types.js';
import { TaskType as TT, YaoState, Ternary } from '../../core/models.js';
import { CognitiveTranslator } from '../../utils/CognitiveTranslator.js';

export class AnalyticalStrategy implements RoutingStrategy {
    readonly name = 'analytical';

    async route(context: RoutingContext): Promise<RoutingDecision | null> {
        const startTime = performance.now();
        const { complexity = 'Yin', availableModels = [] } = context;

        if (complexity === 'Yin') return null;

        const bestModel = availableModels.sort((a: any, b: any) => (b.priority || 0) - (a.priority || 0))[0]?.model || 'qwen2.5-coder:7b';

        return {
            model: bestModel,
            metadata: {
                source: 'analytical',
                latencyMs: Math.round(performance.now() - startTime),
                reasoning: 'Synthesized best route based on priority and availability.'
            }
        };
    }

    public healthCheck(): { online: boolean; details: string } {
        return {
            online: true,
            details: 'AnalyticalStrategy nominal'
        };
    }
}

