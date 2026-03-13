import type { RoutingContext, RoutingDecision, TerminalStrategy } from '../types.js';

export class DefaultStrategy implements TerminalStrategy {
    readonly name = 'default';

    async route(context: RoutingContext): Promise<RoutingDecision> {
        const startTime = performance.now();
        const model = context.availableModels?.[0]?.name || 'qwen2.5-coder:7b';

        return {
            model,
            metadata: {
                source: 'default',
                latencyMs: Math.round(performance.now() - startTime),
                reasoning: 'Terminal fallback'
            }
        };
    }
}
