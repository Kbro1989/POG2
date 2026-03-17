import { SovereignDomain, classifyDomain, TOOL_DOMAIN_MAP } from '../types/SovereignDomain.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('DomainLocker');

/**
 * DomainTransition â€” Record of domain context switches for audit trail.
 */
export interface DomainTransition {
    readonly from: SovereignDomain | null;
    readonly to: SovereignDomain;
    readonly intent: string;
    readonly timestamp: number;
}

/**
 * DispatchVerdict â€” Result of a tool dispatch check.
 * Replaces the old hard-block model with wait/pass:
 *   PASS  â€” tool is in the active domain, execute immediately
 *   WAIT  â€” tool is cross-domain, Kimi dispatches to a worker and waits for return
 */
export type DispatchVerdict = {
    readonly action: 'PASS' | 'WAIT';
    readonly toolDomain: SovereignDomain | 'UNKNOWN';
    readonly activeDomain: SovereignDomain | null;
    readonly reasoning: string;
};

/**
 * DomainViolationError â€” Kept for backwards compatibility but only thrown
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
 * DomainLocker â€” Wait/Pass Dispatch Model.
 *
 * Kimi is the orchestrating agent. It classifies domain, dispatches tools
 * to the right worker, waits for their output, and passes it back.
 *
 * Rules:
 * 1. Every task is classified into a domain for routing context.
 * 2. Same-domain tools get PASS (immediate execution).
 * 3. Cross-domain tools get WAIT (Kimi dispatches to a domain worker).
 * 4. No hard blocks. Kimi is the brain â€” it can reach any limb.
 * 5. All transitions are logged for audit.
 */
export class DomainLocker {
    private activeDomain: SovereignDomain | null = null;
    private readonly transitionHistory: DomainTransition[] = [];
    private lockDepth = 0;

    /**
     * Set the domain context for a task. Not a "lock" â€” just context.
     */
    lockDomain(intent: string): DomainTransition {
        const previousDomain = this.activeDomain;
        const newDomain = classifyDomain(intent);

        this.activeDomain = newDomain;
        this.lockDepth++;

        const transition: DomainTransition = {
            from: previousDomain,
            to: newDomain,
            intent: intent.substring(0, 120),
            timestamp: Date.now()
        };

        this.transitionHistory.push(transition);

        logger.info({
            from: previousDomain,
            to: newDomain,
            lockDepth: this.lockDepth,
            intent: intent.substring(0, 80)
        }, 'Domain context set');

        return transition;
    }

    /**
     * Force-set a specific domain context (sensory interception / manual override).
     */
    forceLock(domain: SovereignDomain, reason: string): DomainTransition {
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
    releaseDomain(): void {
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
    forceReleaseAll(): void {
        if (this.lockDepth > 0 || this.activeDomain !== null) {
            logger.info({ releasedDomain: this.activeDomain, clearedDepth: this.lockDepth }, 'Domain context forcefully reset for new command isolation');
            this.activeDomain = null;
            this.lockDepth = 0;
        }
    }

    /**
     * Dispatch check â€” returns PASS or WAIT instead of blocking.
     * Kimi uses this to decide whether to execute directly or dispatch to a worker.
     */
    dispatchCheck(toolName: string): DispatchVerdict {
        const toolDomain = (TOOL_DOMAIN_MAP[toolName] ?? 'UNKNOWN') as SovereignDomain | 'UNKNOWN';

        // No active domain context â€” pass everything
        if (this.activeDomain === null) {
            return { action: 'PASS', toolDomain, activeDomain: null, reasoning: 'No domain context â€” open dispatch' };
        }

        // Same domain â€” immediate pass
        if (toolDomain === this.activeDomain) {
            return { action: 'PASS', toolDomain, activeDomain: this.activeDomain, reasoning: `Tool in active domain (${this.activeDomain})` };
        }

        // Cross-domain â€” Kimi dispatches to the right worker and waits
        logger.info({ tool: toolName, toolDomain, activeDomain: this.activeDomain }, 'Cross-domain dispatch â€” Kimi routing to worker');
        return {
            action: 'WAIT',
            toolDomain,
            activeDomain: this.activeDomain,
            reasoning: `Cross-domain: ${toolDomain} tool in ${this.activeDomain} context â€” dispatching to worker`
        };
    }

    /**
     * Legacy compatibility â€” isToolAllowed always returns true now.
     * Kimi can reach any limb.
     */
    isToolAllowed(_toolName: string): boolean {
        return true;
    }

    /**
     * Legacy compatibility â€” assertToolAllowed is now a no-op.
     * Use dispatchCheck() for routing decisions instead.
     */
    assertToolAllowed(_toolName: string): void {
        // Wait/pass model: never blocks. Kimi is the brain.
    }

    getActiveDomain(): SovereignDomain | null {
        return this.activeDomain;
    }

    getAllowedDomains(): ReadonlySet<SovereignDomain> {
        // All domains are reachable â€” Kimi dispatches, workers execute
        return new Set(Object.values(SovereignDomain));
    }

    getTransitionHistory(): readonly DomainTransition[] {
        return this.transitionHistory;
    }

    getLockDepth(): number {
        return this.lockDepth;
    }
}
