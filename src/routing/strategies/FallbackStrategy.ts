import type { RoutingContext, RoutingDecision, RoutingStrategy } from '../types.js';

export class FallbackStrategy implements RoutingStrategy {
    readonly name = 'fallback';

    async route(context: RoutingContext): Promise<RoutingDecision | null> {
        const startTime = performance.now();
        const available = context.availableModels || [];
        const fallback = available.find((m: any) => m.model.includes('qwen'))?.model;

        if (!fallback) return null;

        return {
            model: fallback,
            metadata: {
                source: 'fallback',
                latencyMs: Math.round(performance.now() - startTime),
                reasoning: 'Routing to available fallback'
            }
        };
    }
}
