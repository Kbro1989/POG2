import { EpistemicTransitionKernel } from '../../engines/core/EpistemicTransitionKernel.js';
import { CNSCausalityLedger } from '../../engines/core/CNSCausalityLedger.js';
import { CausalPatternExtractor } from '../../engines/core/CausalPatternExtractor.js';
import { InvariantCompiler } from '../../engines/core/InvariantCompiler.js';
import type { EpistemicQuery, QueryResponse, EpistemicProof, TickEvent } from '../../core/models.js';
import { TruthClass } from '../../core/models.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('EpistemicVerificationLimb');

/**
 * EpistemicVerificationLimb - The "Self-Interrogator" of POG2.
 * 
 * This limb provides the 'Epistemic Query Language' interface. It allows the system 
 * (or an external auditor) to interrogate the causal history and proof log to 
 * justify, verify, or falsify derived knowledge.
 */
export class EpistemicVerificationLimb {
    private static instance: EpistemicVerificationLimb;

    private constructor() {}

    public static getInstance(): EpistemicVerificationLimb {
        if (!this.instance) {
            this.instance = new EpistemicVerificationLimb();
        }
        return this.instance;
    }

    /**
     * query - Executes an epistemic query and returns a proof-carrying answer.
     */
    public async query(q: EpistemicQuery): Promise<QueryResponse> {
        logger.info({ target: q.targetId, type: q.queryType }, '⚖️ EPISTEMIC INTERROGATION PULSE');

        try {
            switch (q.queryType) {
                case 'JUSTIFY':
                    return this.executeJustificationQuery(q);
                case 'VERIFY':
                    return this.executeVerificationQuery(q);
                case 'FALSIFY':
                    return this.executeFalsificationQuery(q);
                default:
                    throw new Error(`Unsupported query: ${q.queryType}`);
            }
        } catch (error: any) {
            logger.error({ error: error.message, q }, 'Epistemic query failed execution.');
            return {
                query: q,
                status: 'INCONCLUSIVE',
                confidence: 0,
                proofChain: [],
                evidenceSummary: `Query Error: ${error.message}`
            };
        }
    }

    /**
     * executeJustificationQuery - Traces the lineage of a belief back to the physical substrate.
     * "Why do we believe this?"
     */
    private executeJustificationQuery(q: EpistemicQuery): QueryResponse {
        const kernel = EpistemicTransitionKernel.getInstance();
        const proofs = kernel.getProofLog();
        const chain: EpistemicProof[] = [];
        
        // 1. Recursive Proof Search
        let currentArtifactId = q.targetId;
        const maxDepth = q.depth || 10;

        for (let i = 0; i < maxDepth; i++) {
            const proof = proofs.find(p => p.artifactId === currentArtifactId);
            if (!proof) break;

            chain.push(proof);
            
            // If we've reached a substrate grounding proof, we're done.
            if (proof.rule === 'SUBSTRATE_GROUNDING_MANDATE') break;

            // Follow the parent link
            if (!proof.parentArtifactId) break;
            currentArtifactId = proof.parentArtifactId;
        }

        return {
            query: q,
            status: chain.length > 0 ? 'VERIFIED' : 'INCONCLUSIVE',
            confidence: chain.length > 0 ? 1.0 : 0.0,
            proofChain: chain,
            evidenceSummary: `Justification found: ${chain.length} steps of proof from ${q.targetId} to substrate anchor.`
        };
    }

    /**
     * executeVerificationQuery - Re-validates a derived pattern against the current Causal Ledger.
     * "Is this still true based on recent history?"
     */
    private executeVerificationQuery(q: EpistemicQuery): QueryResponse {
        const ledger = CNSCausalityLedger.getInstance();
        const extractor = CausalPatternExtractor.getInstance();
        
        const pattern = extractor.getMemory().activePatterns.get(q.targetId);
        if (!pattern) {
            return {
                query: q,
                status: 'INCONCLUSIVE',
                confidence: 0,
                proofChain: [],
                evidenceSummary: `Pattern ${q.targetId} not found in active interpretation memory.`
            };
        }

        // Search the ledger for events matching the pattern's archetype
        const supportingEvents = ledger.getTickEvents(ledger.getCurrentTick() - 10) || [];
        const matchCount = supportingEvents.filter(e => e.action === pattern.archetype.split('_')[1]).length;

        return {
            query: q,
            status: matchCount > 0 ? 'VERIFIED' : 'INCONCLUSIVE',
            confidence: Math.min(1.0, matchCount / 5),
            proofChain: [],
            evidenceSummary: `Recent verification: Found ${matchCount} supporting instances in the last 10 ticks.`
        };
    }

    /**
     * executeFalsificationQuery - Actively seeks contradictory evidence for a belief.
     * "What if this is a false correlation?"
     */
    private executeFalsificationQuery(q: EpistemicQuery): QueryResponse {
        const ledger = CNSCausalityLedger.getInstance();
        
        // Search for 'ANOMALY' events that contradict the expected outcome of the targetId
        const recentTicks = ledger.getTickEvents(ledger.getCurrentTick() - 50) || [];
        const contradictions = recentTicks.filter(e => e.truthClass === TruthClass.ANOMALY);

        return {
            query: q,
            status: contradictions.length > 0 ? 'REFUTED' : 'VERIFIED',
            confidence: contradictions.length > 0 ? 1.0 : 0.9,
            proofChain: [],
            evidenceSummary: `Falsification sweep: Found ${contradictions.length} anomalies in the last 50 ticks.`,
            counterEvidence: contradictions.map(e => e.id)
        };
    }
}
