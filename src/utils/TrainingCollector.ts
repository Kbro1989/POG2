import pino from 'pino';
import { appendFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import {
    getTrainingInteractionsPath,
    getTrainingDecisionsPath,
    getTrainingHistoryPath,
    getTrainingMetricsPath,
    getTrainingThinkingPath,
    getTrainingFPRAGPath,
    getTrainingErrorFixesPath,
    getTrainingConsequencesPath
} from './SovereignPathResolver.js';
import { type ThinkingNexus, type DecisionAuditRecord } from '../core/models.js';

const logger = pino({ name: 'TrainingCollector', base: { hostname: 'POG2' } });

// â•â•â• Training Data Interfaces â•â•â•

export interface InteractionRecord {
    timestamp: string;
    sessionId: string;
    model: string;
    provider: 'ollama' | 'huggingface' | 'cloudflare' | 'gemini' | 'fireworks' | 'openrouter' | 'unknown';
    category?: 'coding' | 'gutenberg' | 'chromanumber' | 'vision' | 'voice' | 'orchestration' | 'diagnostic' | 'error_fix' | 'search' | 'general';
    prompt: string;
    response: string;
    latencyMs: number;
    tokenCount?: number;
    success: boolean;
    error?: string;
}

export interface RoutingDecisionRecord {
    timestamp: string;
    sessionId: string;
    task: string;
    category?: string;
    classifiedComplexity: string;
    yaoState: number;
    chosenModel: string;
    provider: string;
    fallbackUsed: boolean;
    fallbackReason?: string;
    cascadeOrder: string[];
}

export interface SessionHistoryRecord {
    timestamp: string;
    sessionId: string;
    event: 'task_start' | 'task_complete' | 'task_failed' | 'tool_used' | 'error' | 'rollback';
    detail: string;
    metadata?: Record<string, unknown>;
}

export interface MetricRecord {
    timestamp: string;
    sessionId: string;
    model: string;
    provider: string;
    latencyMs: number;
    success: boolean;
    tokenCount?: number;
    memoryUsageMb?: number;
}

export interface ErrorFixRecord {
    timestamp: string;
    sessionId: string;
    errorMessage: string;
    resolution?: string;
    model: string;
    success: boolean;
}

export interface ConsequenceRecord {
    timestamp: string;
    sessionId: string;
    decisionId: string;
    tool: string;
    args: Record<string, unknown>;
    output: string;
    success: boolean;
    yaoState: number;
    latencyMs: number;
}

/**
 * TrainingCollector â€” Biological memory substrate for perpetual learning.
 * Records all interactions, routing decisions, session history, and metrics
 * as JSONL files on D:\sovereign\training\ for future model training.
 *
 * This is the "hippocampus" â€” it captures *everything* so the system
 * can learn from its own behavior over time.
 */
export class TrainingCollector {
    private readonly sessionId: string;
    private interactionCount = 0;
    private errorCount = 0;

    private static instance: TrainingCollector;

    private constructor(sessionId?: string) {
        this.sessionId = sessionId || this.generateSessionId();
        logger.info({ sessionId: this.sessionId }, 'Training collector initialized');
    }

    public static getInstance(sessionId?: string): TrainingCollector {
        if (!TrainingCollector.instance) {
            TrainingCollector.instance = new TrainingCollector(sessionId);
        }
        return TrainingCollector.instance;
    }

    private generateSessionId(): string {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0]!.replace(/-/g, '');
        const timeStr = now.toTimeString().split(' ')[0]!.replace(/:/g, '');
        return `pog2_${dateStr}_${timeStr}_${Math.random().toString(36).substring(2, 6)}`;
    }

    getSessionId(): string {
        return this.sessionId;
    }

    getStats(): { interactions: number; errors: number } {
        return { interactions: this.interactionCount, errors: this.errorCount };
    }

    // â•â•â• Interaction Recording â•â•â•

    async recordInteraction(record: Omit<InteractionRecord, 'timestamp' | 'sessionId'>): Promise<void> {
        const full: InteractionRecord = {
            ...record,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        this.interactionCount++;
        if (!record.success) this.errorCount++;

        const dir = getTrainingInteractionsPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), full);
    }

    // â•â•â• Routing Decision Recording â•â•â•

    async recordRoutingDecision(record: Omit<RoutingDecisionRecord, 'timestamp' | 'sessionId'>): Promise<void> {
        const full: RoutingDecisionRecord = {
            ...record,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        const dir = getTrainingDecisionsPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), full);
    }

    // â•â•â• Session History Recording â•â•â•

    async recordHistory(event: SessionHistoryRecord['event'], detail: string, metadata?: Record<string, unknown>): Promise<void> {
        const record: SessionHistoryRecord = {
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId,
            event,
            detail,
            metadata
        };

        const dir = getTrainingHistoryPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), record);
    }

    // â•â•â• Metric Recording â•â•â•

    async recordMetric(record: Omit<MetricRecord, 'timestamp' | 'sessionId'>): Promise<void> {
        const full: MetricRecord = {
            ...record,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        const dir = getTrainingMetricsPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), full);
    }

    // â•â•â• Thinking Nexus Recording â•â•â•

    async recordThinkingNexus(nexus: ThinkingNexus): Promise<void> {
        const full = {
            ...nexus,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        const dir = getTrainingThinkingPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), full);
    }

    // â•â•â• FPRAG Decision Recording â•â•â•

    async recordFPRAGDecision(audit: DecisionAuditRecord): Promise<void> {
        const full = {
            ...audit,
            sessionId: this.sessionId
        };

        const dir = getTrainingFPRAGPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), full);
        logger.debug({ model: audit.selectedModel, directive: audit.directive }, 'FPRAG decision recorded to training substrate');
    }

    // â•â•â• Error-Fix Pair Recording â•â•â•

    async recordErrorFix(record: Omit<ErrorFixRecord, 'timestamp' | 'sessionId'>): Promise<void> {
        const full: ErrorFixRecord = {
            ...record,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        const dir = getTrainingErrorFixesPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), full);
    }

    // â•â•â• Consequence/Outcome Recording â•â•â•

    async recordConsequence(record: Omit<ConsequenceRecord, 'timestamp' | 'sessionId'>): Promise<void> {
        const full: ConsequenceRecord = {
            ...record,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        const dir = getTrainingConsequencesPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        await this.appendJsonl(join(dir, fileName), full);
    }

    // â•â•â• Health Check (for NodeTester) â•â•â•

    healthCheck(): { online: boolean; details: string } {
        try {
            const interactionsDir = getTrainingInteractionsPath();
            const fpragDir = getTrainingFPRAGPath();
            const accessible = existsSync(interactionsDir) && existsSync(fpragDir);
            return {
                online: accessible,
                details: accessible
                    ? `Training substrate active. Session: ${this.sessionId}. Interactions: ${this.interactionCount}, Errors: ${this.errorCount}`
                    : 'Training substrate directories inaccessible'
            };
        } catch (err) {
            return { online: false, details: `Training substrate probe failed: ${(err as Error).message}` };
        }
    }

    // â•â•â• Internal Helpers â•â•â•

    private getDatePrefix(): string {
        return new Date().toISOString().split('T')[0]!;
    }

    private async appendJsonl(filePath: string, data: unknown): Promise<void> {
        try {
            mkdirSync(dirname(filePath), { recursive: true });
            const line = JSON.stringify(data) + '\n';
            await appendFile(filePath, line, 'utf-8');
        } catch (error) {
            logger.warn({ filePath, error: (error as Error).message }, 'Failed to write training data');
        }
    }
}
