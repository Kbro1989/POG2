import { YaoState, CognitiveChoice, FreeModelConfig, ModelPerformance, Lesson } from '../core/models.js';

export interface RoutingDecision {
    model: string;
    metadata: {
        source: string;
        latencyMs: number;
        reasoning: string;
        path?: number[];
        error?: string;
    };
}

export interface RoutingContext {
    prompt: string;
    weightedTasks?: Record<string, number>;
    extension?: string;
    fileSize?: number;
    complexity?: CognitiveChoice;
    availableModels?: FreeModelConfig[];
    architectureAlignment?: string[];
    goldenTemplates?: string[];
    historicalPerformance?: ModelPerformance[];
    lessons?: Lesson[];
    metadata?: {
        ternarySignals?: {
            localAvailability: YaoState;
            historySignal: YaoState;
            supervisorSignal: YaoState;
            architectureAlignmentState: YaoState;
        };
        decisionDirective?: string;
        [key: string]: unknown;
    };
    hexagram?: any;
}

export interface RoutingStrategy {
    readonly name: string;
    route(context: RoutingContext): Promise<RoutingDecision | null>;
}

export interface TerminalStrategy extends RoutingStrategy {
    route(context: RoutingContext): Promise<RoutingDecision>;
}
