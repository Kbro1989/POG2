import { createLogger } from '../../utils/logger.js';
import type { CausalPattern, InvariantRule, InvariantManifest, PatternMemory } from '../../core/models.js';
import { LearningMode, TruthClass } from '../../core/models.js';
import { HexagramManager } from '../../routing/HexagramManager.js';
import { EpistemicTransitionKernel } from './EpistemicTransitionKernel.js';

const logger = createLogger('InvariantCompiler');

/**
 * InvariantCompiler - The "Generalization Boundary" of the CNS.
 * 
 * Sits above the CausalPatternExtractor. It promotes empirical patterns
 * to structural invariants if they satisfy logical consistency checks.
 * It prevents "Correlation is Causality" fallacies by requiring a structural proof.
 */
export class InvariantCompiler {
    private static instance: InvariantCompiler | undefined;
    private manifest: InvariantManifest = {
        rules: [],
        lastCompiledTick: 0
    };

    private constructor() {}

    public static getInstance(): InvariantCompiler {
        if (!this.instance) {
            this.instance = new InvariantCompiler();
        }
        return this.instance;
    }

    /**
     * compilePatterns - Analyzes PatternMemory to extract/verify structural invariants.
     */
    public compilePatterns(memory: PatternMemory, currentTick: number): InvariantRule[] {
        // ISA Governance Check (Phase 230: Shadow Learning Paradigm)
        const contract = HexagramManager.getInstance().getContract();
        const permissions = contract.permissions;
        
        if (permissions.mode === LearningMode.SHADOW) {
            // We do not compile new rules from chaotic memory.
            return [];
        }

        if (!permissions.allowInvariantCompilation) {
            logger.debug('Invariant compilation blocked by ISA governance.');
            return [];
        }

        logger.info({ totalTraces: memory.totalTracesAnalyzed }, 'Initiating Invariant Compilation Pass');
        
        const newRules: InvariantRule[] = [];

        for (const pattern of memory.activePatterns.values()) {
            // 1. Structural Verification (Hard Gate)
            // A pattern is only an invariant if it represents a recurring logic boundary.
            if (this.isStructurallyConsistent(pattern)) {
                const rule = this.promoteToRule(pattern);
                newRules.push(rule);
            }
        }

        this.manifest.rules = newRules;
        this.manifest.lastCompiledTick = currentTick;
        
        return newRules;
    }

    /**
     * isStructurallyConsistent - Validates that a pattern isn't just a statistical coincidence.
     */
    private isStructurallyConsistent(pattern: CausalPattern): boolean {
        // Condition: Frequency must be high enough relative to total traces (Empirical)
        // AND it must involve critical resolution domains (Structural)
        const isHighFrequency = pattern.frequency > 50; 
        const isCoreDomain = pattern.archetype.includes('REJECTED_COLLISION') || pattern.archetype.includes('REJECTED_AUTHORITY');
        
        return isHighFrequency && isCoreDomain;
    }

    /**
     * promoteToRule - Pure transform: Statistical Pattern -> Structural Invariant.
     */
    /**
     * promoteToRule - Pure transform: Statistical Pattern -> Structural Invariant.
     */
    private promoteToRule(pattern: CausalPattern): InvariantRule {
        const domain = pattern.archetype.split('_')[1] === 'COLLISION' ? 'SPATIAL' : 'POLICY';
        
        const rule: InvariantRule = {
            id: `rule-${pattern.id}`,
            domain,
            constraint: pattern.label,
            validationPath: pattern.contributingSignals,
            confidence: Math.min(1.0, pattern.frequency / 1000), // Normalizing confidence
            isTransferable: domain === 'SPATIAL', // Spatial laws are usually universal
            truthClass: TruthClass.INVARIANT
        };

        return EpistemicTransitionKernel.getInstance().emitInvariant(rule);
    }

    public getManifest(): InvariantManifest {
        return this.manifest;
    }
}

