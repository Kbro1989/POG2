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
import { type ThinkingNexus, type DecisionAuditRecord, YaoState, type LearningEvent, LearningFidelity, LearningMode, type Lesson, TruthClass } from '../core/models.js';
import { EventBus } from '../events/EventBus.js';
import { createLogger } from "./logger.js";
import { HexagramManager } from '../routing/HexagramManager.js';
import type { VectorDB } from './VectorDB.js';

const logger = createLogger('TrainingCollector');

/**
 * Memory Arbitration Kernel - Logic-only classification outcomes.
 */
type ArbitrationOutcome = {
    target: TruthClass | 'IGNORE';
    type?: string;
    data?: any;
};

// Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Training Data Interfaces Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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

export interface RetrospectiveInsight {
    thought: string;
    action: string;
    outcome: string;
    why: string;
    logic: number;
}

export interface RetrospectiveRecord {
    timestamp: string;
    sessionId: string;
    task: string;
    narrative: string;
    insight: RetrospectiveInsight;
    yaoState: number;
    hexagram: string;
}

/**
 * TrainingCollector Ã¢â‚¬â€ Biological memory substrate for perpetual learning.
 * Records all interactions, routing decisions, session history, and metrics
 * as JSONL files on D:\sovereign\training\ for future model training.
 *
 * This is the "hippocampus" Ã¢â‚¬â€ it captures *everything* so the system
 * can learn from its own behavior over time.
 */
export class TrainingCollector {
    async getRecentConsequences(count: number): Promise<ConsequenceRecord[]> {
        const dir = getTrainingConsequencesPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        const filePath = join(dir, fileName);
        if (!existsSync(filePath)) return [];
        try {
            const raw = readFileSync(filePath, 'utf-8');
            const lines = raw.trim().split('\n');
            const records: ConsequenceRecord[] = lines
                .map((line: string) => { try { return JSON.parse(line); } catch { return null; } })
                .filter((r: any): r is ConsequenceRecord => r !== null);
            return records.slice(-count);
        } catch (error) {
            logger.warn({ filePath, error: (error as Error).message }, 'Failed to read consequences');
            return [];
        }
    }

    async recordRetrospective(record: Omit<RetrospectiveRecord, 'timestamp' | 'sessionId'>): Promise<void> {
        const full: RetrospectiveRecord = {
            ...record,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };
        EventBus.getInstance().publish({
            type: 'retrospective',
            source: 'TrainingCollector',
            payload: full
        });
    }
    private readonly sessionId: string;
    private interactionCount = 0;
    private errorCount = 0;
    private globeStateLimb?: any; // Avoid circular deep import, functionally typed
    private hexagramManager?: any;
    private vectorDB?: VectorDB;

    private static instance: TrainingCollector;

    private constructor(sessionId?: string) {
        this.sessionId = sessionId || this.generateSessionId();
        logger.info({ sessionId: this.sessionId }, 'Training collector initialized');

        // Phase 220: Cognitive Subscriptions (Event-Sourced Learning)
        EventBus.getInstance().subscribe('cognitive.learning', (event) => {
            this.recordLearningEvent(event.payload);
        });
    }

    /**
     * STAGE 1: Intake (Entry points)
     */

    public async recordLearningEvent(event: LearningEvent): Promise<void> {
        const contract = HexagramManager.getInstance().getContract();
        const permissions = contract.permissions;
        const outcome = this.arbitrateEvent(event, permissions);
        await this.executeEmission(outcome, event);
    }

    public async recordLesson(lesson: Lesson & { projectId: string; domainNamespace?: string; hash?: string; type?: string }): Promise<void> {
        const contract = HexagramManager.getInstance().getContract();
        const permissions = contract.permissions;
        const outcome = this.arbitrateLesson(lesson, permissions);
        await this.executeEmission(outcome, lesson);
    }

    public async recordAnomaly(tick: number, eventId: string | null, type: string, data: any): Promise<void> {
        // Direct anomaly recording (forensic intake)
        await this.persistToAnomalies(tick, eventId, type, data);
        await this.archiveToForensicLog(tick, eventId, type, data);
    }

    /**
     * STAGE 2: Arbitration (Policy Logic)
     * Decisions on where interpretation is allowed to happen.
     */

    private arbitrateEvent(event: LearningEvent, permissions: any): ArbitrationOutcome {
        // 1. Shadow Mode check
        if (permissions.mode === LearningMode.SHADOW) {
            return { target: TruthClass.ANOMALY, type: 'SHADOW_LEARNING_GATED', data: { fidelity: event.fidelity } };
        }

        // 2. Fidelity Gating
        if (event.fidelity === LearningFidelity.RAW || event.fidelity === LearningFidelity.CAUSAL) {
            return { target: TruthClass.EXECUTION };
        }

        if (event.fidelity === LearningFidelity.PATTERN && !permissions.allowPatternExtraction) return { target: TruthClass.POLICY_DENIED, type: 'GATED_PATTERN_EXTRACTION' };
        if (event.fidelity === LearningFidelity.INVARIANT && !permissions.allowInvariantCompilation) return { target: TruthClass.POLICY_DENIED, type: 'GATED_INVARIANT_COMPILATION' };
        if (event.fidelity === LearningFidelity.PEDAGOGY && !permissions.allowPedagogy) return { target: TruthClass.POLICY_DENIED, type: 'GATED_PEDAGOGY' };

        return { target: event.fidelity === LearningFidelity.INVARIANT ? TruthClass.INVARIANT : TruthClass.INTERPRETATION };
    }

    private arbitrateLesson(lesson: Lesson, permissions: any): ArbitrationOutcome {
        if (permissions.mode === LearningMode.SHADOW) {
            return { target: TruthClass.ANOMALY, type: 'SHADOW_LESSON_SUPPRESSED', data: { text: lesson.text, type: lesson.type } };
        }
        return { target: TruthClass.INTERPRETATION };
    }

    /**
     * STAGE 3: Emission (Persistence Execution)
     * Dumb routing to physical substrates.
     */

    private async executeEmission(outcome: ArbitrationOutcome, payload: any): Promise<void> {
        switch (outcome.target) {
            case TruthClass.EXECUTION:
                await this.archiveTruth(payload);
                break;
            case TruthClass.INTERPRETATION:
            case TruthClass.INVARIANT:
                if (outcome.target === TruthClass.INVARIANT || (outcome.target === TruthClass.INTERPRETATION && payload.projectId)) {
                    // It's a Lesson or Invariant
                    if (this.vectorDB) await this.vectorDB.addLesson(payload);
                    await this.archiveKnowledge({
                        tick: -1,
                        fidelity: LearningFidelity.PEDAGOGY,
                        patterns: payload.type === 'pattern' ? [payload] : [],
                        invariants: payload.type === 'invariant' ? [payload] : []
                    } as any);
                } else {
                    // It's a LearningEvent
                    await this.archiveKnowledge(payload);
                }
                break;
            case TruthClass.ANOMALY:
            case TruthClass.POLICY_DENIED:
                await this.recordAnomaly(
                    payload.tick || -1,
                    payload.id || payload.trace?.eventId || null,
                    outcome.type || (outcome.target === TruthClass.POLICY_DENIED ? 'POLICY_VIOLATION' : 'UNKNOWN_ANOMALY'),
                    outcome.data || payload
                );
                break;
            case 'IGNORE':
                // Do nothing
                break;
        }
    }

    private async persistToAnomalies(tick: number, eventId: string | null, type: string, data: any): Promise<void> {
        if (this.vectorDB) {
            this.vectorDB.addAnomaly(tick, eventId, type, data);
        }
    }

    private async archiveToForensicLog(tick: number, eventId: string | null, type: string, data: any): Promise<void> {
        const path = getTrainingHistoryPath();
        const record = {
            timestamp: new Date().toISOString(),
            tick,
            fidelity: 'SHADOW',
            type: 'ANOMALY_CAPTURE',
            data: { eventId, anomalyType: type, payload: data }
        };
        await appendFile(path, JSON.stringify(record) + '\n');
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

    /**
     * Single Write Authority: Attach VectorDB for persistent memory formation.
     */
    public setVectorDB(db: VectorDB): void {
        this.vectorDB = db;
    }

    private shouldBroadcast(eventType: string): boolean {
        if (!this.hexagramManager) return true; // Default to allow if immune system offline

        const contract = this.hexagramManager.getContract();
        // If the node is in complete chaos (Contract structural restraint), do not broadcast panic to the Swarm,
        // EXCEPT for error fixes which might be a desperate survival mechanism.
        if (!contract.gates.allowStructuralRepair && eventType !== 'error_fix_event') {
            logger.warn({ eventType }, 'Cognitive Immunology: Blocked outbound broadcast due to local OldMixed chaotic state.');
            return false;
        }
        return true;
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Interaction Recording Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Routing Decision Recording Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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
            const complexityScores: Record<string, number> = { low: 0.2, medium: 0.5, high: 0.8, extreme: 1.0 };
            const score = complexityScores[record.classifiedComplexity?.toLowerCase()] ?? 0.5;
            this.globeStateLimb.pushNodeState('routing_event', {
                ...full,
                score,
                status: 'active',
                lastActivity: `Route: ${record.chosenModel} (${record.classifiedComplexity || 'low'})`
            }).catch((err: any) => {
                logger.debug({ err: err.message }, 'Globe broadcast failed for routing_event');
            });
        }
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Session History Recording Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Metric Recording Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Thinking Nexus Recording Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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
            const score = nexus.curiosity !== undefined ? nexus.curiosity : 0.95;
            const lastActivity = nexus.reflection 
                ? (nexus.reflection.length > 35 ? nexus.reflection.substring(0, 35) + '...' : nexus.reflection)
                : 'Nominal cogitation';
            this.globeStateLimb.pushNodeState('thinking_event', {
                ...full,
                score,
                status: 'active',
                lastActivity
            }).catch((err: any) => {
                logger.debug({ err: err.message }, 'Globe broadcast failed for thinking_event');
            });
        }
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â FPRAG Decision Recording Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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
            const lastActivity = audit.directive 
                ? (audit.directive.length > 30 ? `Directive: ${audit.directive.substring(0, 30)}...` : `Directive: ${audit.directive}`)
                : (audit.task.length > 30 ? `Audit: ${audit.task.substring(0, 30)}...` : `Audit: ${audit.task}`);
            this.globeStateLimb.pushNodeState('fprag_event', {
                ...full,
                score: 1.0,
                status: 'active',
                lastActivity
            }).catch((err: any) => {
                logger.debug({ err: err.message }, 'Globe broadcast failed for fprag_event');
            });
        }
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Error-Fix Pair Recording Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Consequence/Outcome Recording Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Health Check (for NodeTester) Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

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

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â Internal Helpers Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    private async archiveTruth(event: LearningEvent): Promise<void> {
        const path = getTrainingConsequencesPath(); // Using consequences as a proxy for truth
        const record = {
            timestamp: new Date().toISOString(),
            tick: event.tick,
            fidelity: 'HIGH',
            trace: event.trace,
            resolution: event.resolution
        };
        await appendFile(path, JSON.stringify(record) + '\n');
    }

    private async archiveKnowledge(event: LearningEvent): Promise<void> {
        const path = getTrainingFPRAGPath(); // Using FPRAG for abstracted knowledge
        const record = {
            timestamp: new Date().toISOString(),
            tick: event.tick,
            fidelity: event.fidelity === LearningFidelity.PATTERN ? 'PATTERN' : 'KNOWLEDGE',
            data: event.patterns || event.invariants
        };
        await appendFile(path, JSON.stringify(record) + '\n');
    }

    private getDatePrefix(): string {
        return new Date().toISOString().split('T')[0]!;
    }
}

