import { appendFile, readFile } from 'fs/promises';
import { existsSync, mkdirSync, readFileSync } from 'fs';
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
import { type ThinkingNexus, type DecisionAuditRecord, YaoState } from '../core/models.js';
import { EventBus } from '../events/EventBus.js';
import { createLogger } from "./logger.js";

const logger = createLogger('TrainingCollector');

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
    private globeStateLimb?: any; // Avoid circular deep import, functionally typed
    private hexagramManager?: any;

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

    /**
     * Sovereign FinOps / Hive Mind: Attach the durable GlobeStateLimb for broadcasting training events.
     */
    public setGlobeStateLimb(limb: any): void {
        this.globeStateLimb = limb;
    }

    /**
     * Sovereign FinOps / Hive Mind: Attach HexagramManager to filter outbound events.
     */
    public setHexagramManager(hex: any): void {
        this.hexagramManager = hex;
    }

    private shouldBroadcast(eventType: string): boolean {
        if (!this.hexagramManager) return true; // Default to allow if immune system offline

        const yao = this.hexagramManager.getYaoState?.();
        // If the node is in complete chaos (OldMixed), do not broadcast panic to the Swarm,
        // EXCEPT for error fixes which might be a desperate survival mechanism.
        if (yao === YaoState.OldMixed && eventType !== 'error_fix_event') {
            logger.warn({ eventType }, 'Cognitive Immunology: Blocked outbound broadcast due to local OldMixed chaotic state.');
            return false;
        }
        return true;
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

        EventBus.getInstance().publish({
            type: 'interaction',
            source: 'TrainingCollector',
            payload: full
        });
    }

    /**
     * Get recent interactions for diagnostic or evolutionary sweep.
     * Reads from the current day's log file.
     */
    public async getRecentInteractions(count: number = 20): Promise<InteractionRecord[]> {
        const dir = getTrainingInteractionsPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        const filePath = join(dir, fileName);

        if (!existsSync(filePath)) return [];

        try {
            const raw = readFileSync(filePath, 'utf-8');
            const lines = raw.trim().split('\n');
            const records: InteractionRecord[] = lines
                .map((line: string) => {
                    try { return JSON.parse(line); } catch { return null; }
                })
                .filter((r: any): r is InteractionRecord => r !== null);

            return records.slice(-count);
        } catch (error) {
            logger.warn({ filePath, error: (error as Error).message }, 'Failed to read interactions');
            return [];
        }
    }

    // â•â•â• Routing Decision Recording â•â•â•

    async recordRoutingDecision(record: Omit<RoutingDecisionRecord, 'timestamp' | 'sessionId'>): Promise<void> {
        const full: RoutingDecisionRecord = {
            ...record,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        EventBus.getInstance().publish({
            type: 'decision.routing',
            source: 'TrainingCollector',
            payload: full
        });

        // Broadcast high-level routing evolution to the swarm
        if (this.globeStateLimb && this.shouldBroadcast('routing_event')) {
            this.globeStateLimb.pushNodeState('routing_event', full).catch((err: any) => {
                logger.debug({ err: err.message }, 'Globe broadcast failed for routing_event');
            });
        }
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

        EventBus.getInstance().publish({
            type: 'history',
            source: 'TrainingCollector',
            payload: record
        });
    }

    // â•â•â• Metric Recording â•â•â•

    async recordMetric(record: Omit<MetricRecord, 'timestamp' | 'sessionId'>): Promise<void> {
        const full: MetricRecord = {
            ...record,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        EventBus.getInstance().publish({
            type: 'metric',
            source: 'TrainingCollector',
            payload: full
        });
    }

    // â•â•â• Thinking Nexus Recording â•â•â•

    async recordThinkingNexus(nexus: ThinkingNexus): Promise<void> {
        const full = {
            ...nexus,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        EventBus.getInstance().publish({
            type: 'thinking',
            source: 'TrainingCollector',
            payload: full
        });

        // Broadcast deep thinking chains to the swarm
        if (this.globeStateLimb && this.shouldBroadcast('thinking_event')) {
            this.globeStateLimb.pushNodeState('thinking_event', full).catch((err: any) => {
                logger.debug({ err: err.message }, 'Globe broadcast failed for thinking_event');
            });
        }
    }

    // â•â•â• FPRAG Decision Recording â•â•â•

    async recordFPRAGDecision(audit: DecisionAuditRecord): Promise<void> {
        const full = {
            ...audit,
            sessionId: this.sessionId
        };

        EventBus.getInstance().publish({
            type: 'decision.fprag',
            source: 'TrainingCollector',
            payload: full
        });
        logger.debug({ model: audit.selectedModel, directive: audit.directive }, 'FPRAG decision assigned to EventBus');

        // Broadcast ethical/directive validations to the swarm
        if (this.globeStateLimb && this.shouldBroadcast('fprag_event')) {
            this.globeStateLimb.pushNodeState('fprag_event', full).catch((err: any) => {
                logger.debug({ err: err.message }, 'Globe broadcast failed for fprag_event');
            });
        }
    }

    // â•â•â• Error-Fix Pair Recording â•â•â•

    async recordErrorFix(record: Omit<ErrorFixRecord, 'timestamp' | 'sessionId'>): Promise<void> {
        const full: ErrorFixRecord = {
            ...record,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        EventBus.getInstance().publish({
            type: 'error.fix',
            source: 'TrainingCollector',
            payload: full
        });

        // Broadcast self-healing methodologies to the swarm
        if (this.globeStateLimb && this.shouldBroadcast('error_fix_event')) {
            this.globeStateLimb.pushNodeState('error_fix_event', full).catch((err: any) => {
                logger.debug({ err: err.message }, 'Globe broadcast failed for error_fix_event');
            });
        }
    }

    // â•â•â• Consequence/Outcome Recording â•â•â•

    async recordConsequence(record: Omit<ConsequenceRecord, 'timestamp' | 'sessionId'>): Promise<void> {
        const full: ConsequenceRecord = {
            ...record,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };

        EventBus.getInstance().publish({
            type: 'consequence',
            source: 'TrainingCollector',
            payload: full
        });
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
}
