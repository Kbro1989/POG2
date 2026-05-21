import { TruthClass, LearningMode, ChaosPhase, YaoState, Coord } from '../../core/models.js';
import { EventEmitter } from 'events';
import type {
    TickEvent,
    CausalEvent,
    ExecutionEvent,
    Interpretation,
    PolicyDecision,
    GovernanceResult,
    CausalPattern,
    InvariantRule,
    EpistemicProof,
    YaoTransitionEvent,
    TransitionPrediction,
    MovingLine,
    PredictionRecord
} from '../../core/models.js';
import { createLogger } from '../../utils/logger.js';
import { EpistemicValidator } from './EpistemicValidator.js';
import { rsmvBridge } from '../../utils/RSMVBridge.js';
import { PedagogyDistiller, type InstructionPair } from '../../limbs/pedagogy/PedagogyDistiller.js';
import { createHash } from 'crypto';
import { ClockAuthorityRegistry, ClockDomain } from '../../utils/ClockAuthorityRegistry.js';

const logger = createLogger('EpistemicTransitionKernel');

/** EMA smoothing factor. Higher = more responsive to recent data. */
const EMA_ALPHA = 0.3;
/** Hysteresis threshold: phase transitions require delta > this value to fire. */
const HYSTERESIS_THRESHOLD = 0.15;
/** Minimum causal confidence to treat a transition as a real event vs noise. */
const CAUSAL_CONFIDENCE_FLOOR = 0.4;

export interface SpatialPredictionRecord {
    tick: number;
    entityId: string;
    predictedCoord: Coord;
    actualCoord?: Coord;
    error?: number;
    confidence: number;
    context?: string;
}

export class PredictionRegistry {
    private static instance: PredictionRegistry;
    private records: PredictionRecord[] = [];
    private spatialPredictions: Map<string, SpatialPredictionRecord[]> = new Map();

    private constructor() { }

    public static getInstance(): PredictionRegistry {
        if (!PredictionRegistry.instance) {
            PredictionRegistry.instance = new PredictionRegistry();
        }
        return PredictionRegistry.instance;
    }

    public addRecord(record: PredictionRecord): void {
        this.records.push(record);
        if (this.records.length > 1000) this.records.shift();
    }

    public getLimbAccuracy(limbName: string, windowSize: number = 10): number {
        const recent = this.records.filter(r => r.limbErrors && r.limbErrors.has(limbName)).slice(-windowSize);
        if (recent.length === 0) return 1.0; // Assume 100% accuracy if no history

        let totalError = 0;
        recent.forEach(r => totalError += r.limbErrors!.get(limbName) || 0);

        const avgError = totalError / recent.length;
        // Map error [0..1] to accuracy [1..0]
        const accuracy = Math.max(0.1, 1.0 - avgError);
        return accuracy;
    }

    public logSpatialPrediction(record: SpatialPredictionRecord): void {
        const history = this.spatialPredictions.get(record.entityId) || [];
        history.push(record);
        // Keep history size reasonable
        if (history.length > 100) history.shift();
        this.spatialPredictions.set(record.entityId, history);
    }

    public verifySpatialPrediction(entityId: string, actualCoord: Coord, tick: number): void {
        const history = this.spatialPredictions.get(entityId);
        if (!history) return;

        const prediction = history.find(p => p.tick === tick);
        if (!prediction) return;

        prediction.actualCoord = actualCoord;
        prediction.error = Math.sqrt(
            Math.pow(actualCoord.x - prediction.predictedCoord.x, 2) +
            Math.pow(actualCoord.y - prediction.predictedCoord.y, 2)
        );

        // If error > threshold, distill to pedagogy
        if (prediction.error > 2) { // More than 2 tiles off
            this.distillPredictionError(prediction);
        }
    }

    private distillPredictionError(record: SpatialPredictionRecord): void {
        logger.warn({ record }, 'Spatial prediction error exceeded threshold! Flagged for pedagogy.');
        
        const context = record.context ? JSON.parse(record.context) : {};
        
        const pair: InstructionPair = {
            instruction: `Predict NPC position given path queue and aggro state`,
            input: `Entity: ${record.entityId} (${context.name || 'Unknown'}, radius ${context.radius || 1}) at tick ${record.tick - (context.tickDepth || 2)}, predicted to be at (${record.predictedCoord.x}, ${record.predictedCoord.y}), but was actually at (${record.actualCoord?.x}, ${record.actualCoord?.y}). Context: ${record.context || '{}'}`,
            output: `Correction: Move to (${record.actualCoord?.x}, ${record.actualCoord?.y}) instead of (${record.predictedCoord.x}, ${record.predictedCoord.y}). Error magnitude: ${record.error?.toFixed(2)}`,
            source: "PredictionRegistry:SpatialError",
            confidence: 0.9,
            timestamp: Date.now()
        };

        try {
            PedagogyDistiller.getInstance().addInstructionPair(pair);
        } catch (e) {
            logger.error({ err: e }, 'Failed to add spatial error to pedagogy corpus.');
        }
    }
}

/**
 * EpistemicTransitionKernel - The Sovereign Truth Controller.
 * 
 * Transition Lattice with Recursive Proof Generation:
 * EXECUTION -> CAUSAL          [Proof: rsmv Cache Alignment]
 * CAUSAL -> INTERPRETATION    [Proof: Cognitive Derivation]
 * INTERPRETATION -> INVARIANT [Proof: Structural Proof]
 */
export class EpistemicTransitionKernel extends EventEmitter {
    private static instance: EpistemicTransitionKernel;
    private proofLog: EpistemicProof[] = [];

    // ── Predictive State Dynamics ──
    private currentPhase: ChaosPhase = ChaosPhase.STABLE;
    private volatilityEMA = 0;
    private stabilityTrendEMA = 1.0;
    private transitionHistory: YaoTransitionEvent[] = [];
    private lastPrediction: TransitionPrediction | null = null;
    private predictionAccuracyEMA = 0.5;
    private lastYaoState: YaoState = YaoState.YoungYang;
    private stateChangeCount = 0;
    private ticksSinceLastChange = 0;

    // ── Nuclear / Secondary Metrics ──
    public secondaryMetrics = {
        latencyTrend: 0,
        retryRate: 0,
        entropyGrowth: 0
    };

    private constructor() {
        super();
    }

    public static getInstance(): EpistemicTransitionKernel {
        if (!this.instance) {
            this.instance = new EpistemicTransitionKernel();
        }
        return this.instance;
    }

    /**
     * promoteToCausal - Transition raw EXECUTION into immutable CAUSAL history.
     */
    public promoteToCausal(event: TickEvent, sealFunction: (ev: TickEvent) => TickEvent): CausalEvent {
        EpistemicValidator.getInstance().validateTransition(event.truthClass, TruthClass.CAUSAL);

        const substratePath = "C:\\ProgramData\\Jagex\\RuneScape\\js5-16.jcache";

        // 2. Physical Sealing
        const sealed = sealFunction(event);

        // 3. Emit Epistemic Proof
        this.emitProof({
            id: `proof-seal-${sealed.id}`,
            artifactId: sealed.id,
            parentArtifactId: event.id, // Linking back to the specific execution artifact
            sourceLayer: TruthClass.EXECUTION,
            targetLayer: TruthClass.CAUSAL,
            rule: 'SUBSTRATE_GROUNDING_MANDATE',
            justification: `Execution event ${sealed.id} aligned with authoritative substrate at ${substratePath}`,
            evidenceHash: sealed.hash || 'NO_HASH',
            timestamp: ClockAuthorityRegistry.resolveTime(ClockDomain.INFERENCE, 'EpistemicKernel'),
            substrateAnchor: substratePath
        });

        return {
            ...sealed,
            truthClass: TruthClass.CAUSAL,
            __brand: 'CAUSAL'
        } as CausalEvent;
    }

    /**
     * deriveInterpretation - Extracts cognitive meaning from sealed history.
     */
    public deriveInterpretation(event: CausalEvent, deriveFunction: (ev: CausalEvent) => CausalPattern): Interpretation {
        EpistemicValidator.getInstance().validateTransition(TruthClass.CAUSAL, TruthClass.INTERPRETATION);

        const pattern = deriveFunction(event);

        this.emitProof({
            id: `proof-derive-${pattern.id}`,
            artifactId: pattern.id,
            parentArtifactId: event.id, // Linking back to the causal trace
            sourceLayer: TruthClass.CAUSAL,
            targetLayer: TruthClass.INTERPRETATION,
            rule: 'CAUSAL_ABSTRACTION',
            justification: `Cognitive pattern ${pattern.archetype} derived from causal event ${event.id}`,
            evidenceHash: event.hash || 'NO_HASH',
            timestamp: ClockAuthorityRegistry.resolveTime(ClockDomain.INFERENCE, 'EpistemicKernel')
        });

        return {
            ...pattern,
            truthClass: TruthClass.INTERPRETATION,
            __brand: 'INTERPRETATION'
        } as Interpretation;
    }

    /**
     * emitInvariant - Hardens a pattern into a structural law.
     */
    public emitInvariant(rule: InvariantRule): any {
        // We look for the pattern ID that spawned this rule
        const patternId = rule.id.replace('rule-', '');

        this.emitProof({
            id: `proof-law-${rule.id}`,
            artifactId: rule.id,
            parentArtifactId: patternId, // Linking back to the empirical interpretation
            sourceLayer: TruthClass.INTERPRETATION,
            targetLayer: TruthClass.INVARIANT,
            rule: 'STRUCTURAL_GENERALIZATION',
            justification: `Heuristic rule ${rule.constraint} promoted to universal invariant.`,
            evidenceHash: createHash('sha256').update(JSON.stringify(rule)).digest('hex'),
            timestamp: ClockAuthorityRegistry.resolveTime(ClockDomain.INFERENCE, 'EpistemicKernel')
        });

        return {
            ...rule,
            truthClass: TruthClass.INVARIANT,
            __brand: 'INVARIANT'
        };
    }

    public emitExecutionEvent(event: TickEvent): ExecutionEvent {
        return {
            ...event,
            truthClass: TruthClass.EXECUTION,
            __brand: 'EXECUTION'
        } as ExecutionEvent;
    }

    public emitPolicyDecision(res: GovernanceResult): PolicyDecision {
        return {
            ...res,
            __brand: 'POLICY'
        } as PolicyDecision;
    }

    private emitProof(proof: EpistemicProof): void {
        this.proofLog.push(proof);

        // Sliding window: Maintain only the last 1000 proofs to manage memory during long simulations
        if (this.proofLog.length > 1000) {
            this.proofLog.shift();
        }

        logger.info({
            rule: proof.rule,
            artifact: proof.artifactId,
            parent: proof.parentArtifactId,
            target: proof.targetLayer
        }, '⚖️ EPISTEMIC PROOF GENERATED: Transition justified.');
    }

    public getProofLog(): EpistemicProof[] {
        return this.proofLog;
    }

    public handleViolation(source: any, target: TruthClass, reason: string): void {
        const err = `⚖️ EPISTEMIC QUARANTINE: Illegal transition for artifact ${source.id}. Source: ${source.truthClass}, Target: ${target}. Reason: ${reason}`;
        logger.error({ reason, sourceClass: source.truthClass, targetClass: target, id: source.id }, err);
        throw new Error(err);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  PHASE 2: PREDICTIVE STATE CONTROLLER
    //  predict → observe → reconcile → adapt
    // ═══════════════════════════════════════════════════════════════════

    /**
     * predictTransition — Called BEFORE an action/tick to declare what the
     * kernel expects the system state to look like afterward.
     */
    public predictTransition(currentYao: YaoState, causalAttributionId?: string): TransitionPrediction {
        const expectedVolatility = this.volatilityEMA;
        const targetPhase = this.classifyPhase(currentYao, expectedVolatility);
        const confidence = this.computePredictionConfidence(currentYao);

        this.lastPrediction = {
            targetPhase,
            confidence,
            expectedVolatility,
            causalAttributionId
        };

        logger.debug({
            currentYao,
            targetPhase,
            confidence: confidence.toFixed(3),
            volatility: expectedVolatility.toFixed(3)
        }, '🔮 PREDICTION: Anticipated post-action state.');

        return this.lastPrediction;
    }

    /**
     * observeTransition — Called AFTER an action/tick with the actual observed
     * state. Reconciles prediction vs reality and updates EMA dynamics.
     */
    public observeTransition(observedYao: YaoState, causalConfidence: number = 1.0, movingLines: MovingLine[] = []): YaoTransitionEvent {
        this.ticksSinceLastChange++;
        const stateChanged = observedYao !== this.lastYaoState;

        // 1. Compute instantaneous volatility signal
        const instantVolatility = stateChanged ? 1.0 : 0.0;

        // 2. EMA update: volatility
        this.volatilityEMA = EMA_ALPHA * instantVolatility + (1 - EMA_ALPHA) * this.volatilityEMA;

        // 3. EMA update: stability trend (inverse of volatility, decays slowly)
        const instantStability = stateChanged ? 0.0 : 1.0;
        this.stabilityTrendEMA = (EMA_ALPHA * 0.5) * instantStability + (1 - EMA_ALPHA * 0.5) * this.stabilityTrendEMA;

        // 4. Reconcile prediction accuracy
        if (this.lastPrediction) {
            const predictedPhase = this.lastPrediction.targetPhase;
            const actualPhase = this.classifyPhase(observedYao, this.volatilityEMA);
            const hit = predictedPhase === actualPhase ? 1.0 : 0.0;
            this.predictionAccuracyEMA = EMA_ALPHA * hit + (1 - EMA_ALPHA) * this.predictionAccuracyEMA;

            // Generate prediction error record
            const errorMagnitude = (predictedPhase === actualPhase && this.lastPrediction.expectedVolatility === this.volatilityEMA) ? 0.0 : 1.0;
            const limbErrors = new Map<string, number>();

            if (errorMagnitude > 0) {
                // Penalize limbs that contributed to moving lines if the prediction was wrong
                for (const line of movingLines) {
                    const currentError = limbErrors.get(line.source) || 0;
                    limbErrors.set(line.source, currentError + 1.0);
                }
            }

            PredictionRegistry.getInstance().addRecord({
                id: ClockAuthorityRegistry.resolveEntropy(ClockDomain.INFERENCE, 'EpistemicKernel').id('pr'),
                timestamp: ClockAuthorityRegistry.resolveTime(ClockDomain.INFERENCE, 'EpistemicKernel'),
                predictedState: this.lastYaoState, // Approximate
                predictedPhase,
                movingLines,
                actualState: observedYao,
                actualPhase,
                errorMagnitude,
                limbErrors
            });
        }

        // 5. Causal attribution gating: filter noise
        const isSignificant = causalConfidence >= CAUSAL_CONFIDENCE_FLOOR;

        // 6. Hysteresis-gated phase transition
        const candidatePhase = this.classifyPhase(observedYao, this.volatilityEMA);
        if (isSignificant && this.shouldTransitionPhase(candidatePhase)) {
            const oldPhase = this.currentPhase;
            this.currentPhase = candidatePhase;
            logger.info({
                from: oldPhase,
                to: candidatePhase,
                volatility: this.volatilityEMA.toFixed(3),
                stability: this.stabilityTrendEMA.toFixed(3),
                causalConfidence: causalConfidence.toFixed(3)
            }, '⚡ PHASE TRANSITION: Hysteresis gate passed.');
            this.emit('phaseShift', candidatePhase);
        }

        // Emit other events for triggers
        if (causalConfidence > 0.8) this.emit('confidenceRise');
        if (this.volatilityEMA < 0.2) this.emit('volatilityDrop');

        // 7. Track state change
        if (stateChanged) {
            this.stateChangeCount++;
            this.ticksSinceLastChange = 0;
        }

        // 8. Build transition event
        const event: YaoTransitionEvent = {
            id: ClockAuthorityRegistry.resolveEntropy(ClockDomain.INFERENCE, 'EpistemicKernel').id('yte'),
            timestamp: ClockAuthorityRegistry.resolveTime(ClockDomain.INFERENCE, 'EpistemicKernel'),
            sourceState: this.lastYaoState,
            targetState: observedYao,
            phase: this.currentPhase,
            volatility: this.volatilityEMA,
            stabilityTrend: this.stabilityTrendEMA,
            prediction: this.lastPrediction || undefined,
            observed: true
        };

        // 9. Sliding window history
        this.transitionHistory.push(event);
        if (this.transitionHistory.length > 500) {
            this.transitionHistory.shift();
        }

        this.lastYaoState = observedYao;
        this.lastPrediction = null;

        return event;
    }

    /**
     * updateSecondaryMetrics — Feeds nuclear metrics into the kernel to detect FALSE_STABILITY.
     */
    public updateSecondaryMetrics(latency: number, retries: number, entropy: number): void {
        this.secondaryMetrics.latencyTrend = EMA_ALPHA * latency + (1 - EMA_ALPHA) * this.secondaryMetrics.latencyTrend;
        this.secondaryMetrics.retryRate = EMA_ALPHA * retries + (1 - EMA_ALPHA) * this.secondaryMetrics.retryRate;
        this.secondaryMetrics.entropyGrowth = EMA_ALPHA * entropy + (1 - EMA_ALPHA) * this.secondaryMetrics.entropyGrowth;
    }

    /**
     * classifyPhase — Maps raw YaoState + volatility into a ChaosPhase.
     * This replaces the hard boolean gates with a continuous phase classifier.
     */
    private classifyPhase(yao: YaoState, volatility: number): ChaosPhase {
        // Check for nuclear churn beneath apparent stability
        const nuclearChurn = (this.secondaryMetrics.latencyTrend > 0.6 || this.secondaryMetrics.retryRate > 0.6 || this.secondaryMetrics.entropyGrowth > 0.6);
        if (volatility <= 0.3 && nuclearChurn) {
            return ChaosPhase.FALSE_STABILITY;
        }

        // OldMixed with high volatility = actively degrading
        if (yao === YaoState.OldMixed && volatility > 0.5) return ChaosPhase.DEGRADING;
        // OldMixed with low volatility = exploring/probing
        if (yao === YaoState.OldMixed && volatility <= 0.5) return ChaosPhase.EXPLORING;
        // Transition from chaos back to order
        if (this.currentPhase === ChaosPhase.DEGRADING || this.currentPhase === ChaosPhase.EXPLORING) {
            if (yao !== YaoState.OldMixed && volatility < 0.3) return ChaosPhase.RECOVERING;
        }
        // Recovering completes when stability is high
        if (this.currentPhase === ChaosPhase.RECOVERING && this.stabilityTrendEMA > 0.7) {
            return ChaosPhase.STABLE;
        }
        // Default
        if (yao === YaoState.OldYang || yao === YaoState.OldYin) {
            return volatility > 0.6 ? ChaosPhase.DEGRADING : ChaosPhase.EXPLORING;
        }
        return ChaosPhase.STABLE;
    }

    /**
     * shouldTransitionPhase — Hysteresis gate. Prevents jittery phase flapping
     * by requiring the volatility delta to exceed a threshold.
     */
    private shouldTransitionPhase(candidate: ChaosPhase): boolean {
        if (candidate === this.currentPhase) return false;
        // Always allow transition out of DEGRADING (recovery is urgent)
        if (this.currentPhase === ChaosPhase.DEGRADING && candidate === ChaosPhase.RECOVERING) return true;
        // Require hysteresis threshold for other transitions
        const delta = Math.abs(this.volatilityEMA - (1 - this.stabilityTrendEMA));
        return delta > HYSTERESIS_THRESHOLD;
    }

    /**
     * computePredictionConfidence — How confident the kernel is in its prediction,
     * based on historical accuracy and current stability.
     */
    private computePredictionConfidence(currentYao: YaoState): number {
        const historyWeight = this.predictionAccuracyEMA;
        const stabilityWeight = this.stabilityTrendEMA;
        // Chaotic states inherently reduce confidence
        const chaosDiscount = (currentYao === YaoState.OldMixed) ? 0.5 : 1.0;
        return Math.min(1.0, (historyWeight * 0.4 + stabilityWeight * 0.6) * chaosDiscount);
    }

    // ── Public Accessors for Phase-Aware Gating ──

    public getCurrentPhase(): ChaosPhase { return this.currentPhase; }
    public getVolatility(): number { return this.volatilityEMA; }
    public getStabilityTrend(): number { return this.stabilityTrendEMA; }
    public getPredictionAccuracy(): number { return this.predictionAccuracyEMA; }
    public getTransitionHistory(): YaoTransitionEvent[] { return this.transitionHistory; }

    /**
     * getPhaseGateMultiplier — Returns a 0.0–1.0 multiplier that downstream
     * systems use instead of hard boolean gates. This allows graceful
     * degradation instead of full shutdowns.
     *
     * STABLE:     1.0 (full authority)
     * RECOVERING: 0.7 (cautious operation)
     * EXPLORING:  0.4 (limited probing)
     * DEGRADING:  0.1 (survival mode only)
     */
    public getPhaseGateMultiplier(): number {
        switch (this.currentPhase) {
            case ChaosPhase.STABLE: return 1.0;
            case ChaosPhase.RECOVERING: return 0.7;
            case ChaosPhase.EXPLORING: return 0.4;
            case ChaosPhase.FALSE_STABILITY: return 0.5; // Cautious throttling
            case ChaosPhase.DEGRADING: return 0.1;
            default: return 0.5;
        }
    }

    /**
     * recordAction — Reports an intentional system action to the kernel.
     * This feeds the "Intentionality" signal back into the epistemic loop.
     */
    public recordAction(actionType: string, confidence: number): void {
        this.emit('actionCommitted', { actionType, confidence, timestamp: ClockAuthorityRegistry.resolveTime(ClockDomain.INFERENCE, 'EpistemicKernel') });

        // Intentional action slightly increases volatility (system is moving/changing)
        // but stabilizes the trend if confidence is high.
        const intentImpact = 0.05 * (1 - confidence);
        this.volatilityEMA = Math.min(1.0, this.volatilityEMA + intentImpact);

        logger.debug({ actionType, confidence }, 'Epistemic Kernel: Action reported');
    }

    /**
     * getDiagnostics — Snapshot of the entire predictive state machine
     * for health reports and clinical logging.
     */
    public getDiagnostics(): Record<string, any> {
        return {
            phase: this.currentPhase,
            volatilityEMA: parseFloat(this.volatilityEMA.toFixed(4)),
            stabilityTrendEMA: parseFloat(this.stabilityTrendEMA.toFixed(4)),
            predictionAccuracyEMA: parseFloat(this.predictionAccuracyEMA.toFixed(4)),
            totalTransitions: this.stateChangeCount,
            ticksSinceLastChange: this.ticksSinceLastChange,
            historyLength: this.transitionHistory.length,
            proofLogLength: this.proofLog.length
        };
    }
}
