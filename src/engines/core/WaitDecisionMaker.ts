import { ChaosPhase, TransitionPrediction, MovingLine, YaoState } from '../../core/models.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('WaitDecisionMaker');

export interface TransitionalVector {
    movingLines: MovingLine[];
    transitionProgress: number;
    energyFlow: 'ASCENDING' | 'DESCENDING' | 'STABLE';
    falseStability: boolean;
}

export interface WaitDecision {
    state: 'COMMIT' | 'WAIT' | 'PREPARE';
    confidence: number;
    deadlineMs: number;        // max wait time before forced decision
    triggerConditions: string[]; // which signals would flip state
}

/**
 * WaitDecisionMaker - The Hysteresis Engine
 *
 * Implements a 6-dimensional dangerous/opportune factor space mapping.
 * Acts as the reflex arc to decide whether to commit an action immediately,
 * wait for the next tick boundary, or delay for further signals.
 */
export class WaitDecisionMaker {
    private static instance: WaitDecisionMaker;

    private constructor() {}

    public static getInstance(): WaitDecisionMaker {
        if (!WaitDecisionMaker.instance) {
            WaitDecisionMaker.instance = new WaitDecisionMaker();
        }
        return WaitDecisionMaker.instance;
    }

    /**
     * evaluate - Computes the trajectory of the predictive state machine.
     * Incorporates Perceptual Grounding: visual and pedagogical audit scores
     * drive the final confidence adjustment.
     */
    public evaluate(
        prediction: TransitionPrediction,
        transitionalVector: TransitionalVector,
        timeInWaitMs: number,
        perceptualAudit: number = 1.0 // 0-1, 1.0 is perfect grounding
    ): WaitDecision {
        const { targetPhase, confidence } = prediction;
        const falseStabilityRisk = transitionalVector.falseStability;

        // Apply Perceptual Dampening: if vision/pedagogy disagrees with state, drop confidence
        const groundedConfidence = confidence * perceptualAudit;

        // HARD COMMIT: High confidence + stable + no false stability + high grounding
        if (groundedConfidence > 0.85 && targetPhase === ChaosPhase.STABLE && !falseStabilityRisk) {
            return { state: 'COMMIT', confidence: groundedConfidence, deadlineMs: 0, triggerConditions: [] };
        }

        // HARD WAIT: Degrading + low confidence + nuclear churn (or false stability)
        if ((targetPhase === ChaosPhase.DEGRADING || falseStabilityRisk) && groundedConfidence < 0.4) {
            return {
                state: 'WAIT',
                confidence: groundedConfidence,
                deadlineMs: 600, // max wait before forced action aligned with ~600ms vision latency
                triggerConditions: ['confidence_rises', 'phase_shifts_to_recovering', 'visual_sync_improves']
            };
        }

        // PREPARE: Opportune signal emerging (Old Yin lines activating: YIN -> YANG)
        const oldYinCount = transitionalVector.movingLines.filter(
            l => l.fromState === 'YIN' && l.toState === 'YANG'
        ).length;

        if (oldYinCount >= 2 && groundedConfidence > 0.6) {
            return {
                state: 'PREPARE',
                confidence: groundedConfidence,
                deadlineMs: 400, // Adjusted for latency substrate
                triggerConditions: ['upper_line_confirms', 'volatility_drops', 'perceptual_grounding_verified']
            };
        }

        // DEFAULT: Extend wait with decaying patience
        const patienceDecay = Math.min(1.0, timeInWaitMs / 600);
        const adjustedConfidence = groundedConfidence * (1 - patienceDecay);

        return {
            state: adjustedConfidence > 0.5 ? 'COMMIT' : 'WAIT',
            confidence: adjustedConfidence,
            deadlineMs: Math.max(0, 600 - timeInWaitMs),
            triggerConditions: ['any_improvement', 'visual_audit_pass']
        };
    }
}

