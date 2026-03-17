import { appendFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { EventBus, SovereignEvent } from '../EventBus.js';
import { getTrainingMetricsPath } from '../../utils/SovereignPathResolver.js';
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('MetricsAggregator');

/**
 * MetricsAggregator subscribes to metric runtime events and writes them
 * to the metrics storage asynchronously, removing I/O bottlenecks.
 */
export class MetricsAggregator {
    constructor(private readonly bus: EventBus = EventBus.getInstance()) {}

    public register(): void {
        this.bus.subscribe('metric', this.handleMetric.bind(this));
        logger.info('MetricsAggregator registered with EventBus');
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
            logger.error({ filePath, error: (error as Error).message }, 'Failed to write metric data asynchronously');
        }
    }

    private async handleMetric(event: SovereignEvent): Promise<void> {
        const dir = getTrainingMetricsPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), event.payload);
    }
}
