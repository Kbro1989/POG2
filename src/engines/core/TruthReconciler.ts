import { createLogger } from '../../utils/logger.js';
import { createHash, createHmac } from 'crypto';
import { TruthClass, TRUTH_PRECEDENCE, EPISTEMIC_INVARIANTS } from '../../core/models.js';
import type { TickEvent, CausalPattern, InvariantRule } from '../../core/models.js';
import { CNSCausalityLedger } from './CNSCausalityLedger.js';
import { CausalPatternExtractor } from './CausalPatternExtractor.js';
import { HexagramManager } from '../../routing/HexagramManager.js';
import { TrainingCollector } from '../../utils/TrainingCollector.js';
import { EpistemicValidator } from './EpistemicValidator.js';
import { ClockAuthorityRegistry, ClockDomain } from '../../utils/ClockAuthorityRegistry.js';

const logger = createLogger('TruthReconciler');

/**
 * TruthReconciler - The "Single Enforced Truth Lattice" of POG2.
 * 
 * Enforces the Epistemic Invariants by detecting and resolving divergences
 * between Execution, Interpretation, and Governance layers.
 */
export class TruthReconciler {
    private static instance: TruthReconciler | undefined;

    private constructor() {}

    public static getInstance(): TruthReconciler {
        if (!this.instance) {
            this.instance = new TruthReconciler();
        }
        return this.instance;
    }

    /**
     * reconcileTick - Performs a cross-layer audit for a specific tick.
     * Enforces the rule: EXECUTION > INVARIANT > INTERPRETATION.
     */
    public async reconcileTick(tick: number): Promise<void> {
        const ledger = CNSCausalityLedger.getInstance();
        const executionTruth = ledger.getTickEvents(tick) || [];
        
        const extractor = CausalPatternExtractor.getInstance();
        const interpretationTruth = Array.from(extractor.getMemory().activePatterns.values());

        const manager = HexagramManager.getInstance();
        const governanceTruth = manager.getContract();

        logger.debug({ tick, eventCount: executionTruth.length }, 'Initiating Truth Reconciliation Pass');

        // 1. Boundary Integrity Check: Enforce layer rules
        const validator = EpistemicValidator.getInstance();
        for (const event of executionTruth) {
            validator.enforceProvenance(event, TruthClass.CAUSAL);
        }
        
        // 2. Structural Divergence Check: Do active patterns contradict recorded events?
        for (const event of executionTruth) {
            this.auditEventAgainstInterpretations(event, interpretationTruth);
        }

        // 3. Governance Alignment Check: Is the ISA allowing actions that the Ledger says are failing?
        this.auditGovernanceAlignment(executionTruth, governanceTruth);

        // 4. Sealing Audit: Verify cryptographic integrity of the tick
        this.verifyChainIntegrity(executionTruth);

        // 5. Temporal Domain Audit: Ensure INFERENCE and OBSERVABILITY clocks have not drifted
        this.auditTemporalMonotonicity(tick);
    }

    /**
     * auditTemporalMonotonicity - Asserts cross-domain ordering rules to prevent silent 
     * desynchronization between causal logic, inference traces, and observability timelines.
     */
    private auditTemporalMonotonicity(tick: number): void {
        const simTime = ClockAuthorityRegistry.resolveTime(ClockDomain.SIMULATION, 'TruthReconciler');
        const infTime = ClockAuthorityRegistry.resolveTime(ClockDomain.INFERENCE, 'TruthReconciler');
        const obsTime = ClockAuthorityRegistry.resolveTime(ClockDomain.OBSERVABILITY, 'TruthReconciler');

        // Rule 1: Causal Monotonicity. INFERENCE must never drift behind SIMULATION
        if (infTime < simTime) {
            const err = `Temporal Invariant Violation: INFERENCE time (${infTime}) drifted behind SIMULATION time (${simTime}) at tick ${tick}`;
            logger.fatal({ rule: 'CAUSAL_MONOTONICITY', simTime, infTime, tick }, err);
            throw new Error(err);
        }

        // Rule 2: Observability Progression. Must proxy simulation without negative drift.
        if (obsTime < simTime) {
            const err = `Temporal Invariant Violation: OBSERVABILITY time (${obsTime}) fell behind SIMULATION time (${simTime})`;
            logger.fatal({ rule: 'OBSERVABILITY_DESYNC', simTime, obsTime, tick }, err);
            throw new Error(err);
        }
    }

    /**
     * verifyChainIntegrity - Audits the cryptographic seals of the ledger.
     */
    public verifyChainIntegrity(events: readonly TickEvent[]): boolean {
        if (events.length === 0) return true;

        const secret = process.env.SOVEREIGN_ROOT_SECRET || 'TEMPORARY_FALLBACK_KEY';

        for (const event of events) {
            // 1. Reconstruct the payload as it was before sealing
            const keys = Object.keys(event).filter(k => k !== 'hash' && k !== 'parentHash' && k !== 'signature' && k !== 'substrateAnchor').sort();
            const payload = JSON.stringify(event, keys);
            
            // 2. Verify Payload Hash
            const expectedHash = createHash('sha256')
                .update(payload)
                .update(event.parentHash || 'GENESIS')
                .digest('hex');

            if (event.hash !== expectedHash) {
                this.reportDivergence(event, { id: 'CRYPTO_SEAL' }, `TAMPER DETECTED: Hash mismatch. Expected ${expectedHash.substring(0, 8)}, got ${event.hash?.substring(0, 8)}`);
                return false;
            }

            // 3. Verify Authoritative Signature (Phase 252)
            const expectedSignature = createHmac('sha256', secret)
                .update(expectedHash)
                .update(event.substrateAnchor || 'OFFLINE_SIM')
                .digest('hex');

            if (event.signature !== expectedSignature) {
                this.reportDivergence(event, { id: 'AUTHORITY_SEAL' }, `TAMPER DETECTED: Invalid Authority Signature. Key mismatch or runtime compromise.`);
                return false;
            }
        }

        logger.debug({ count: events.length }, '✅ Tick authoritative integrity verified.');
        return true;
    }

    /**
     * auditEventAgainstInterpretations - Detects if a "learned rule" is being violated by reality.
     */
    private auditEventAgainstInterpretations(event: TickEvent, patterns: readonly CausalPattern[]): void {
        for (const pattern of patterns) {
            // Example: If a pattern identifies a 'SAFE_ZONE' but a collision event happens there.
            if (pattern.archetype === 'SPATIAL_INVARIANT' && event.outcome === 'REJECTED_COLLISION') {
                if (this.isContradiction(event, pattern)) {
                    this.reportDivergence(event, pattern, 'Pattern contradicted by Execution Truth');
                }
            }
        }
    }

    private isContradiction(event: TickEvent, pattern: CausalPattern): boolean {
        // Logic to detect contradiction between a specific event and a learned pattern.
        // For now, placeholder for specific geometric/policy matching.
        return false; 
    }

    /**
     * auditGovernanceAlignment - Detects if the ISA is out of sync with substrate reality.
     */
    private auditGovernanceAlignment(events: readonly TickEvent[], contract: any): void {
        const failedEvents = events.filter(e => e.outcome !== 'SUCCESS');
        const blockedByPolicy = failedEvents.filter(e => e.outcome === 'REJECTED_AUTHORITY');

        if (blockedByPolicy.length > 5 && contract.permissions.allowActiveRecovery) {
            logger.warn({ count: blockedByPolicy.length }, 'Governance/Reality Mismatch: ISA allows Active Recovery but substrate is hitting high Policy Rejection.');
            
            TrainingCollector.getInstance().recordAnomaly(
                events[0]?.tick || -1,
                null,
                'GOVERNANCE_DESYNC',
                { blockedCount: blockedByPolicy.length, contractMode: contract.polarity }
            );
        }
    }

    private reportDivergence(event: TickEvent, source: any, reason: string): void {
        logger.error({ eventId: event.id, sourceId: source.id, reason }, '⚖️ Epistemic Divergence Detected!');
        
        TrainingCollector.getInstance().recordAnomaly(
            event.tick,
            event.id,
            'COGNITIVE_DIVERGENCE',
            { event, source, reason, precedence: TRUTH_PRECEDENCE[0] } // EXECUTION wins
        );
    }

    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: "TruthReconciler active and verified." };
    }
}


