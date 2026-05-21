import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { getTrainingInteractionsPath, getTrainingFPRAGPath, getTrainingConsequencesPath } from './SovereignPathResolver.js';
import { YaoState } from '../core/models.js';
import { EventBus } from '../events/EventBus.js';
import { createLogger } from "./logger.js";
const logger = createLogger('TrainingCollector');
/**
 * TrainingCollector â€” Biological memory substrate for perpetual learning.
 * Records all interactions, routing decisions, session history, and metrics
 * as JSONL files on D:\sovereign\training\ for future model training.
 *
 * This is the "hippocampus" â€” it captures *everything* so the system
 * can learn from its own behavior over time.
 */
export class TrainingCollector {
    async getRecentConsequences(count) {
        const dir = getTrainingConsequencesPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        const filePath = join(dir, fileName);
        if (!existsSync(filePath))
            return [];
        try {
            const raw = readFileSync(filePath, 'utf-8');
            const lines = raw.trim().split('\n');
            const records = lines
                .map((line) => { try {
                return JSON.parse(line);
            }
            catch {
                return null;
            } })
                .filter((r) => r !== null);
            return records.slice(-count);
        }
        catch (error) {
            logger.warn({ filePath, error: error.message }, 'Failed to read consequences');
            return [];
        }
    }
    async recordRetrospective(record) {
        const full = {
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
    sessionId;
    interactionCount = 0;
    errorCount = 0;
    globeStateLimb; // Avoid circular deep import, functionally typed
    hexagramManager;
    static instance;
    constructor(sessionId) {
        this.sessionId = sessionId || this.generateSessionId();
        logger.info({ sessionId: this.sessionId }, 'Training collector initialized');
    }
    static getInstance(sessionId) {
        if (!TrainingCollector.instance) {
            TrainingCollector.instance = new TrainingCollector(sessionId);
        }
        return TrainingCollector.instance;
    }
    generateSessionId() {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '');
        return `pog2_${dateStr}_${timeStr}_${Math.random().toString(36).substring(2, 6)}`;
    }
    getSessionId() {
        return this.sessionId;
    }
    getStats() {
        return { interactions: this.interactionCount, errors: this.errorCount };
    }
    /**
     * Sovereign FinOps / Hive Mind: Attach the durable GlobeStateLimb for broadcasting training events.
     */
    setGlobeStateLimb(limb) {
        this.globeStateLimb = limb;
    }
    /**
     * Sovereign FinOps / Hive Mind: Attach HexagramManager to filter outbound events.
     */
    setHexagramManager(hex) {
        this.hexagramManager = hex;
    }
    shouldBroadcast(eventType) {
        if (!this.hexagramManager)
            return true; // Default to allow if immune system offline
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
    async recordInteraction(record) {
        const full = {
            ...record,
            timestamp: new Date().toISOString(),
            sessionId: this.sessionId
        };
        this.interactionCount++;
        if (!record.success)
            this.errorCount++;
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
    async getRecentInteractions(count = 20) {
        const dir = getTrainingInteractionsPath();
        const fileName = `${this.getDatePrefix()}.jsonl`;
        const filePath = join(dir, fileName);
        if (!existsSync(filePath))
            return [];
        try {
            const raw = readFileSync(filePath, 'utf-8');
            const lines = raw.trim().split('\n');
            const records = lines
                .map((line) => {
                try {
                    return JSON.parse(line);
                }
                catch {
                    return null;
                }
            })
                .filter((r) => r !== null);
            return records.slice(-count);
        }
        catch (error) {
            logger.warn({ filePath, error: error.message }, 'Failed to read interactions');
            return [];
        }
    }
    // â•â•â• Routing Decision Recording â•â•â•
    async recordRoutingDecision(record) {
        const full = {
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
            const complexityScores = { low: 0.2, medium: 0.5, high: 0.8, extreme: 1.0 };
            const score = complexityScores[record.classifiedComplexity?.toLowerCase()] ?? 0.5;
            this.globeStateLimb.pushNodeState('routing_event', {
                ...full,
                score,
                status: 'active',
                lastActivity: `Route: ${record.chosenModel} (${record.classifiedComplexity || 'low'})`
            }).catch((err) => {
                logger.debug({ err: err.message }, 'Globe broadcast failed for routing_event');
            });
        }
    }
    // â•â•â• Session History Recording â•â•â•
    async recordHistory(event, detail, metadata) {
        const record = {
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
    async recordMetric(record) {
        const full = {
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
    async recordThinkingNexus(nexus) {
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
            }).catch((err) => {
                logger.debug({ err: err.message }, 'Globe broadcast failed for thinking_event');
            });
        }
    }
    // â•â•â• FPRAG Decision Recording â•â•â•
    async recordFPRAGDecision(audit) {
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
            }).catch((err) => {
                logger.debug({ err: err.message }, 'Globe broadcast failed for fprag_event');
            });
        }
    }
    // â•â•â• Error-Fix Pair Recording â•â•â•
    async recordErrorFix(record) {
        const full = {
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
            this.globeStateLimb.pushNodeState('error_fix_event', full).catch((err) => {
                logger.debug({ err: err.message }, 'Globe broadcast failed for error_fix_event');
            });
        }
    }
    // â•â•â• Consequence/Outcome Recording â•â•â•
    async recordConsequence(record) {
        const full = {
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
    healthCheck() {
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
        }
        catch (err) {
            return { online: false, details: `Training substrate probe failed: ${err.message}` };
        }
    }
    // â•â•â• Internal Helpers â•â•â•
    getDatePrefix() {
        return new Date().toISOString().split('T')[0];
    }
}
