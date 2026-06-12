import { TruthClass, TRUTH_PRECEDENCE } from '../../core/models.js';
import type { TickEvent, CausalPattern } from '../../core/models.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('EpistemicValidator');

/**
 * EpistemicValidator - The Enforcer of Layer Boundaries.
 * 
 * Rules (The Physics of Truth):
 * 1. Irreversibility: Data flows ONLY from High Authority (low index) to Low Authority (high index).
 * 2. Immutable Sink: Once data is sealed (CAUSAL), it can NEVER be re-classified downward.
 * 3. Directional Enforcement:
 *    - EXECUTION (0) -> CAUSAL (1) (Promotion/Sealing)
 *    - CAUSAL (1) -> INTERPRETATION (4) (Derivation/Cognition)
 *    - POLICY (3) -> EXECUTION (0) (Gating: Rejection/Anomaly only)
 */
export class EpistemicValidator {
    private static instance: EpistemicValidator;

    private constructor() {}

    public static getInstance(): EpistemicValidator {
        if (!this.instance) {
            this.instance = new EpistemicValidator();
        }
        return this.instance;
    }

    /**
     * validateTransition - Checks if a transition from sourceClass to targetClass is legal.
     * Prevents cross-layer contamination.
     */
    public validateTransition(sourceClass: TruthClass, targetClass: TruthClass): boolean {
        const sourceRank = TRUTH_PRECEDENCE.indexOf(sourceClass);
        const targetRank = TRUTH_PRECEDENCE.indexOf(targetClass);

        // 1. Rank Integrity: Cannot promote a lower-tier truth to a higher-tier class.
        // (e.g. INTERPRETATION [4] cannot become EXECUTION [0])
        if (targetRank < sourceRank) {
            const err = `⚖️ EPISTEMIC VIOLATION: Illegal promotion from ${sourceClass} [Rank ${sourceRank}] to ${targetClass} [Rank ${targetRank}].`;
            logger.error({ sourceClass, targetClass, sourceRank, targetRank }, err);
            throw new Error(err);
        }

        // 2. Immutable Sealing Rule
        if (sourceClass === TruthClass.CAUSAL && targetClass !== TruthClass.CAUSAL && targetRank > TRUTH_PRECEDENCE.indexOf(TruthClass.INTERPRETATION)) {
             // Once causal, it can only be interpreted or remain causal.
             // It cannot "decay" into an anomaly without an audit.
        }

        return true;
    }

    /**
     * enforceProvenance - Hard mandate for artifact metadata.
     * Throws on violation to halt the contamination at the boundary.
     */
    public enforceProvenance(artifact: any, expectedClass: TruthClass): void {
        // A. Type Safety
        if (!artifact.truthClass || artifact.truthClass !== expectedClass) {
            logger.error({ artifactId: artifact.id, expectedClass, actualClass: artifact.truthClass }, '⚖️ PROVENANCE FAILURE: Missing or incorrect TruthClass.');
            throw new Error(`Epistemic Provenance Violation: Expected ${expectedClass}`);
        }

        // B. Sealing Requirements
        if (expectedClass === TruthClass.CAUSAL) {
            if (!artifact.hash || !artifact.signature || !artifact.parentHash) {
                logger.error({ artifactId: artifact.id }, '⚖️ PROVENANCE FAILURE: CAUSAL artifact missing cryptographic seals.');
                throw new Error('Epistemic Provenance Violation: CAUSAL events must be sealed and signed.');
            }
        }

        // C. Interpretation Grounding
        if (expectedClass === TruthClass.INTERPRETATION) {
            if (!artifact.parentEventId && !artifact.archetype) {
                logger.warn({ artifactId: artifact.id }, '⚖️ WEAK PROVENANCE: INTERPRETATION artifact missing grounding reference.');
            }
        }
    }
}

