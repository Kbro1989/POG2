// src/routing/DomainLocker.ts
import { SovereignDomain, classifyDomain, TOOL_DOMAIN_MAP } from '../types/SovereignDomain.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('DomainLocker');

/**
 * DomainTransition — Record of domain context switches for audit trail.
 */
export interface DomainTransition {
    readonly from: SovereignDomain | null;
    readonly to: SovereignDomain;
    readonly intent: string;
    readonly timestamp: number;
}

/**
 * DispatchVerdict — Result of a tool dispatch check.
 * Replaces the old hard-block model with wait/pass:
 *   PASS  — tool is in the active domain, execute immediately
 *   WAIT  — tool is cross-domain, Kimi dispatches to a worker and waits for return
 */
export type DispatchVerdict = {
    readonly action: 'PASS' | 'WAIT';
    readonly toolDomain: SovereignDomain | 'UNKNOWN';
    readonly activeDomain: SovereignDomain | null;
    readonly reasoning: string;
};

/**
 * DomainViolationError — Kept for backwards compatibility but only thrown
 * for explicitly dangerous operations (reserved for future use).
 */
export class DomainViolationError extends Error {
    public readonly toolName: string;
    public readonly requiredDomain: SovereignDomain;
    public readonly activeDomain: SovereignDomain;

    constructor(toolName: string, requiredDomain: SovereignDomain, activeDomain: SovereignDomain) {
        super(`DOMAIN VIOLATION: Tool "${toolName}" requires ${requiredDomain}, active is ${activeDomain}.`);
        this.name = 'DomainViolationError';
        this.toolName = toolName;
        this.requiredDomain = requiredDomain;
        this.activeDomain = activeDomain;
    }
}

export class ToolAuthorizationError extends Error {
    constructor(
        public readonly modelId: string,
        public readonly toolName: string,
        public readonly authorizedTools: readonly string[]
    ) {
        super(`Tool authorization failed: Model ${modelId} not authorized for ${toolName}.`);
        this.name = 'ToolAuthorizationError';
    }
}

/**
 * DomainLocker — Wait/Pass Dispatch Model.
 *
 * Kimi is the orchestrating agent. It classifies domain, dispatches tools
 * to the right worker, waits for their output, and passes it back.
 *
 * Rules:
 * 1. Every task is classified into a domain for routing context.
 * 2. Same-domain tools get PASS (immediate execution).
 * 3. Cross-domain tools get WAIT (Kimi dispatches to a domain worker).
 * 4. No hard blocks. Kimi is the brain — it can reach any limb.
 * 5. All transitions are logged for audit.
 */
export class DomainLocker {
    private activeDomain: SovereignDomain | null = null;
    private readonly transitionHistory: DomainTransition[] = [];
    private lockDepth = 0;

    /**
     * Set the domain context for a task. Not a "lock" — just context.
     */
    public lockDomain(intent: string): DomainTransition {
        const safeIntent = intent ?? '';
        const previousDomain = this.activeDomain;
        const newDomain = classifyDomain(safeIntent);

        this.activeDomain = newDomain;
        this.lockDepth++;

        const transition: DomainTransition = {
            from: previousDomain,
            to: newDomain,
            intent: safeIntent.substring(0, 120),
            timestamp: Date.now()
        };

        this.transitionHistory.push(transition);

        logger.info({
            from: previousDomain,
            to: newDomain,
            lockDepth: this.lockDepth,
            intent: safeIntent.substring(0, 80)
        }, 'Domain context set');

        return transition;
    }

    /**
     * Force-set a specific domain context (sensory interception / manual override).
     */
    public forceLock(domain: SovereignDomain, reason: string): DomainTransition {
        const previousDomain = this.activeDomain;
        this.activeDomain = domain;
        this.lockDepth++;

        const transition: DomainTransition = {
            from: previousDomain,
            to: domain,
            intent: `[FORCE] ${reason}`,
            timestamp: Date.now()
        };

        this.transitionHistory.push(transition);
        logger.info({ from: previousDomain, to: domain, reason }, 'Domain force-set');

        return transition;
    }

    /**
     * Release the current domain context.
     */
    public releaseDomain(): void {
        if (this.lockDepth > 0) {
            this.lockDepth--;
        }
        if (this.lockDepth === 0) {
            logger.info({ releasedDomain: this.activeDomain }, 'Domain context released');
            this.activeDomain = null;
        }
    }

    /**
     * Complete reset of domain state to prevent cross-contamination between commands.
     */
    public forceReleaseAll(): void {
        if (this.lockDepth > 0 || this.activeDomain !== null) {
            logger.info({ releasedDomain: this.activeDomain, clearedDepth: this.lockDepth }, 'Domain context forcefully reset for new command isolation');
            this.activeDomain = null;
            this.lockDepth = 0;
        }
    }

    /**
     * Dispatch check — returns PASS or WAIT instead of blocking.
     * Kimi uses this to decide whether to execute directly or dispatch to a worker.
     */
    public dispatchCheck(toolName: string): DispatchVerdict {
        const toolDomain = (TOOL_DOMAIN_MAP[toolName] ?? 'UNKNOWN') as SovereignDomain | 'UNKNOWN';

        // No active domain context — pass everything
        if (this.activeDomain === null) {
            return { action: 'PASS', toolDomain, activeDomain: null, reasoning: 'No domain context — open dispatch' };
        }

        // Same domain — immediate pass
        if (toolDomain === this.activeDomain) {
            return { action: 'PASS', toolDomain, activeDomain: this.activeDomain, reasoning: `Tool in active domain (${this.activeDomain})` };
        }

        // Cross-domain — Kimi dispatches to the right worker and waits
        logger.info({ tool: toolName, toolDomain, activeDomain: this.activeDomain }, 'Cross-domain dispatch — Kimi routing to worker');
        return {
            action: 'WAIT',
            toolDomain,
            activeDomain: this.activeDomain,
            reasoning: `Cross-domain: ${toolDomain} tool in ${this.activeDomain} context — dispatching to worker`
        };
    }

    /**
     * Legacy compatibility — isToolAllowed always returns true now.
     * Kimi can reach any limb.
     */
    public isToolAllowed(_toolName: string): boolean {
        return true;
    }

    /**
     * Hard gate for ModelClient / ToolRegistry integration.
     * Translates Wait/Pass verdict to boolean/throw.
     * PASS → true, WAIT → throws DomainViolationError.
     *
     * NOTE: The existing Wait/Pass model classifies by tool name, not model tier.
     * `modelId` is used as the tool name for dispatch lookup.
     */
    public check(modelId: string, domain: string, _tier?: string): boolean {
        const verdict = this.dispatchCheck(modelId);
        if (verdict.action === 'WAIT') {
            // Cast domain string to SovereignDomain for the existing error shape
            const activeDomain = this.activeDomain ?? (domain as SovereignDomain);
            throw new DomainViolationError(modelId, domain as SovereignDomain, activeDomain);
        }
        return true;
    }

    /**
     * Advisory check — returns false instead of throwing.
     * Use for logging/metrics where you don't want hard blocks.
     */
    public canAccess(modelId: string, domain: string, tier?: string): boolean {
        try {
            return this.check(modelId, domain, tier);
        } catch {
            return false;
        }
    }

    /**
     * Forward-compatible stub for explicit model registration.
     * Current Wait/Pass model uses intent classification rather than explicit allowlists.
     * Future cycles may implement a hybrid policy.
     */
    public registerModel(_modelId: string, _domains: string[]): void {
        // No-op: Wait/Pass architecture classifies by tool intent, not model-domain allowlist
    }

    /**
     * Legacy compatibility — assertToolAllowed is now a no-op.
     * Use dispatchCheck() for routing decisions instead.
     */
    public assertToolAllowed(_toolName: string): void {
        // Wait/pass model: never blocks. Kimi is the brain.
    }

    public getActiveDomain(): SovereignDomain | null {
        return this.activeDomain;
    }

    public getAllowedDomains(): ReadonlySet<SovereignDomain> {
        // All domains are reachable — Kimi dispatches, workers execute
        return new Set(Object.values(SovereignDomain));
    }

    public getTransitionHistory(): readonly DomainTransition[] {
        return this.transitionHistory;
    }

    public getLockDepth(): number {
        return this.lockDepth;
    }

    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: "DomainLocker active and verified." };
    }
}
