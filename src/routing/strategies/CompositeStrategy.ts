import type { RoutingContext, RoutingDecision, RoutingStrategy, TerminalStrategy } from '../types.js';
import pino from 'pino';

export class CompositeStrategy implements TerminalStrategy {
    readonly name: string;
    private readonly strategies: [...RoutingStrategy[], TerminalStrategy];
    private readonly logger = pino({ name: 'CompositeStrategy' });

    constructor(strategies: [...RoutingStrategy[], TerminalStrategy], name: string = 'composite') {
        this.strategies = strategies;
        this.name = name;
    }

    async route(context: RoutingContext): Promise<RoutingDecision> {
        const startTime = performance.now();
        const nonTerminal = this.strategies.slice(0, -1) as RoutingStrategy[];
        const terminal = this.strategies[this.strategies.length - 1] as TerminalStrategy;

        for (const strategy of nonTerminal) {
            try {
                const decision = await strategy.route(context);
                if (decision) return this.finalize(decision, startTime);
            } catch (error) {
                this.logger.warn({ strategy: strategy.name, error }, 'Strategy failed');
            }
        }

        const decision = await terminal.route(context);
        return this.finalize(decision, startTime);
    }

    private finalize(decision: RoutingDecision, start: number): RoutingDecision {
        return {
            ...decision,
            metadata: {
                ...decision.metadata,
                source: `${this.name}/${decision.metadata.source}`,
                latencyMs: Math.round(performance.now() - start)
            }
        };
    }
}
