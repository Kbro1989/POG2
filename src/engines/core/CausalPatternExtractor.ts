import { createLogger } from '../../utils/logger.js';
import type { TickEvent, CausalPattern, PatternMemory, CausalEvidence } from '../../core/models.js';
import { LearningMode, TruthClass } from '../../core/models.js';
import { HexagramManager } from '../../routing/HexagramManager.js';
import { TrainingCollector } from '../../utils/TrainingCollector.js';
import { EpistemicValidator } from './EpistemicValidator.js';

const logger = createLogger('CausalPatternExtractor');

/**
 * CausalPatternExtractor - The "Wisdom Layer" of the CNS.
 * 
 * Performs "Lossy Abstraction" on raw causal traces to identify recurring 
 * failure/success archetypes. This turns forensic logs into reusable knowledge.
 */
export class CausalPatternExtractor {
    private static instance: CausalPatternExtractor | undefined;
    private memory: PatternMemory = {
        activePatterns: new Map(),
        totalTracesAnalyzed: 0
    };

    private constructor() {}

    public static getInstance(): CausalPatternExtractor {
        if (!this.instance) {
            this.instance = new CausalPatternExtractor();
        }
        return this.instance;
    }

    /**
     * ingestTrace - Analyzes a completed event trace and updates cognitive patterns.
     */
    public ingestTrace(event: TickEvent): CausalPattern | null {
        // ISA Governance Check (Phase 230: Shadow Learning Paradigm)
        const contract = HexagramManager.getInstance().getContract();
        const permissions = contract.permissions;
        
        // 0. Epistemic Boundary Enforcement
        // Interpretation MUST derive from CAUSAL truth.
        if (event.truthClass !== TruthClass.CAUSAL) {
            logger.warn({ eventId: event.id, actual: event.truthClass }, '⚖️ DEFERRED DERIVATION: Event is not yet sealed (CAUSAL).');
            return null;
        }

        if (!EpistemicValidator.getInstance().validateTransition(event.truthClass, TruthClass.INTERPRETATION)) {
            return null;
        }

        // If in SHADOW mode, we capture the anomaly but skip memory mutation.
        if (permissions.mode === LearningMode.SHADOW) {
            this.captureAnomaly(event);
            return null;
        }

        if (!permissions.allowPatternExtraction) {
            return null; // Gated out (e.g. Pure Silence states)
        }

        this.memory.totalTracesAnalyzed++;

        // 1. Generate Archetype Fingerprint
        const signals = event.signals || [];
        const resolutionIndex = event.resolutionPointIndex;
        
        if (resolutionIndex === undefined) return null;

        const resolutionSignal = signals[resolutionIndex];
        if (!resolutionSignal) return null;

        // Archetype = Outcome + Primary Signal Code
        const archetype = `${event.outcome}_${resolutionSignal.code}`;
        
        // 2. Cluster or Create Pattern
        let pattern = this.memory.activePatterns.get(archetype);
        if (!pattern) {
            pattern = this.initializePattern(archetype, resolutionSignal);
            this.memory.activePatterns.set(archetype, pattern);
        }

        // 3. Update Frequency and Metadata
        const updatedPattern: CausalPattern = {
            ...pattern,
            frequency: pattern.frequency + 1,
            lastOccurredTick: event.tick
        };
        this.memory.activePatterns.set(archetype, updatedPattern);
        
        logger.debug({ archetype, frequency: updatedPattern.frequency }, 'Causal pattern reinforced.');
        return updatedPattern;
    }

    /**
     * initializePattern - Defines the "Wisdom" mapping for a new failure/success archetype.
     */
    private initializePattern(archetype: string, signal: CausalEvidence): CausalPattern {
        const id = `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        
        // Mapping Machine Logic to Human Heuristics
        let label = "Unknown Interaction";
        let heuristic = "Monitor signal sequence for unexpected resolution.";

        switch (signal.code) {
            case 'TILE_LOCK_CONTENTION':
                label = "Spatial Precedence Conflict";
                heuristic = "Ensure spatial locks are resolved BEFORE policy checks. Verify entity tile ownership.";
                break;
            case 'UNAUTHORIZED_ACTION':
                label = "Policy Authority Denial";
                heuristic = "Check RegistryB rules. Action is valid geometrically but forbidden by world law.";
                break;
            case 'EXTERNAL_REJECTION':
                label = "Substrate Truth Disagreement";
                heuristic = "Check RSMVBridge stability. Reality engine disagreed with CNS prediction.";
                break;
        }

        return {
            id,
            label,
            archetype,
            frequency: 0,
            lastOccurredTick: 0,
            heuristic,
            contributingSignals: [signal.code],
            truthClass: TruthClass.INTERPRETATION
        };
    }

    /**
     * getTopInsights - Returns the most frequent patterns for display/learning.
     */
    public getTopInsights(limit = 5): CausalPattern[] {
        return [...this.memory.activePatterns.values()]
            .sort((a, b) => b.frequency - a.frequency)
            .slice(0, limit);
    }

    public getMemory(): PatternMemory {
        return this.memory;
    }

    /**
     * captureAnomaly - Routes forensic structural deviations to the hippocampus (TrainingCollector).
     */
    private captureAnomaly(event: TickEvent): void {
        const yao = HexagramManager.getInstance().getYaoState();
        TrainingCollector.getInstance().recordAnomaly(
            event.tick,
            event.id,
            'SHADOW_LEARNING_INTERRUPTION',
            {
                outcome: event.outcome,
                signals: event.signals,
                yaoState: yao
            }
        );
        logger.info({ tick: event.tick, eventId: event.id }, 'Cognitive Anomaly captured (Shadow Mode).');
    }
}
