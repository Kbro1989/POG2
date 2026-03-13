import type { RoutingContext, RoutingDecision, RoutingStrategy } from '../types.js';
import { IntentMap } from '../../api/ai/IntentMap.js';

export class OverrideStrategy implements RoutingStrategy {
    readonly name = 'override';

    async route(context: RoutingContext): Promise<RoutingDecision | null> {
        const startTime = performance.now();
        const prompt = context.prompt.toLowerCase();
        const available = context.availableModels || [];

        for (const category of Object.values(IntentMap)) {
            for (const path of category) {
                if (path.keywords.some((kw: string) => prompt.includes(kw.toLowerCase()))) {
                    const target = path.targetCapabilityId;
                    if (available.some(m => m.model === target)) {
                        return {
                            model: target,
                            metadata: {
                                source: 'override',
                                latencyMs: Math.round(performance.now() - startTime),
                                reasoning: `Intent Match: ${path.description}`
                            }
                        };
                    }
                }
            }
        }
        return null;
    }
}
