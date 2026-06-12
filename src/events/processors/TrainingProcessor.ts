import { appendFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { EventBus, SovereignEvent } from '../EventBus.js';
import { CompressionEngine } from '../../utils/CompressionEngine.js';
import {
    getTrainingInteractionsPath,
    getTrainingDecisionsPath,
    getTrainingHistoryPath,
    getTrainingThinkingPath,
    getTrainingFPRAGPath,
    getTrainingErrorFixesPath,
    getTrainingConsequencesPath
} from '../../utils/SovereignPathResolver.js';
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('TrainingProcessor');

/**
 * TrainingProcessor subscribes to core runtime events and writes them
 * to the `memory/training/*.jsonl` files asynchronously, removing I/O bottlenecks.
 */
export class TrainingProcessor {
    constructor(private readonly bus: EventBus = EventBus.getInstance()) {}

    public register(): void {
        this.bus.subscribe('interaction', this.handleInteraction.bind(this));
        this.bus.subscribe('decision.routing', this.handleRouting.bind(this));
        this.bus.subscribe('decision.fprag', this.handleFPRAG.bind(this));
        this.bus.subscribe('history', this.handleHistory.bind(this));
        this.bus.subscribe('thinking', this.handleThinking.bind(this));
        this.bus.subscribe('error.fix', this.handleErrorFix.bind(this));
        this.bus.subscribe('consequence', this.handleConsequence.bind(this));
        logger.info('TrainingProcessor registered with EventBus');
    }

    private getDatePrefix(): string {
        return new Date().toISOString().split('T')[0]!;
    }

    private async appendJsonl(filePath: string, data: unknown): Promise<void> {
        try {
            const dir = dirname(filePath);
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
            const line = JSON.stringify(data) + '\n';
            await appendFile(filePath, line, 'utf-8');
        } catch (error) {
            logger.error({ filePath, error: (error as Error).message }, 'Failed to write training data asynchronously');
        }
    }

    private async handleInteraction(event: SovereignEvent): Promise<void> {
        const dir = getTrainingInteractionsPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), event.payload);
    }

    private async handleRouting(event: SovereignEvent): Promise<void> {
        const dir = getTrainingDecisionsPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), event.payload);
    }

    private async handleHistory(event: SovereignEvent): Promise<void> {
        const dir = getTrainingHistoryPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), event.payload);
    }

    private async handleThinking(event: SovereignEvent): Promise<void> {
        const dir = getTrainingThinkingPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), event.payload);
    }

    private async handleFPRAG(event: SovereignEvent): Promise<void> {
        const dir = getTrainingFPRAGPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), event.payload);
    }

    private async handleErrorFix(event: SovereignEvent): Promise<void> {
        const dir = getTrainingErrorFixesPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), event.payload);
    }

    private async handleConsequence(event: SovereignEvent): Promise<void> {
        const dir = getTrainingConsequencesPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), event.payload);
    }
}

