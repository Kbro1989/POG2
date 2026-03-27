import type { RoutingContext, RoutingDecision, RoutingStrategy } from '../types.js';
import { YaoState } from '../../core/models.js';

export class TernaryClassifierStrategy implements RoutingStrategy {
    readonly name = 'ternary-classifier';

    async route(context: RoutingContext): Promise<RoutingDecision | null> {
        const startTime = performance.now();
        const { prompt, availableModels = [] } = context;

        const tier = prompt.length > 100 ? 'deep' : 'local';
        const target = availableModels.find(m => {
            const priority = m.priority || 0;
            return tier === 'deep' ? priority > 90 : priority <= 90;
        })?.model || availableModels[0]?.model;

        if (!target) return null;

        return {
            model: target,
            metadata: {
                source: 'ternary-classifier',
                latencyMs: Math.round(performance.now() - startTime),
                reasoning: `Classified as ${tier}`
            }
        };
    }
}
