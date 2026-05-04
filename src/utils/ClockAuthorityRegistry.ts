/**
 * ClockAuthorityRegistry.ts — Temporal Consistency Boundary
 * 
 * Enforces a strict Directed Authority Graph for time.
 * Prevents subsystems from falling back to wall-clock time (`Date.now()`)
 * unless they are explicitly in the EXTERNAL domain.
 */

import { CanonicalClock } from './CanonicalClock.js';
import { createLogger } from './logger.js';

const logger = createLogger('ClockAuthorityRegistry');

export enum ClockDomain {
    SIMULATION,     // CanonicalClock (tick-based, causal)
    INFERENCE,      // ML traces, derived from tick + local offsets (stable ordering)
    OBSERVABILITY,  // Metrics/Logs, monotonic proxy
    EXTERNAL        // Real world interoperability (JSON logs, Date.now allowed)
}

export class ClockAuthorityRegistry {
    /**
     * Resolves time based on the requesting subsystem's domain.
     * 
     * @param domain The declared ClockDomain of the requesting subsystem
     * @param subsystem Name of the subsystem for trace logging
     * @returns The resolved timestamp suitable for that domain
     */
    public static resolveTime(domain: ClockDomain, subsystem: string): number {
        switch (domain) {
            case ClockDomain.SIMULATION:
                return CanonicalClock.getInstance().simulatedNow();
            
            case ClockDomain.INFERENCE:
                // Inference time is anchored to simulation but needs local ordering.
                // For now, it uses simulatedNow. We can offset this later if intra-tick ordering is required.
                return CanonicalClock.getInstance().simulatedNow();
            
            case ClockDomain.OBSERVABILITY:
                // Monotonic proxy, safe for diffing without breaking causal loops
                return CanonicalClock.getInstance().realElapsedInTick() + CanonicalClock.getInstance().simulatedNow();

            case ClockDomain.EXTERNAL:
                return Date.now(); // The only domain allowed to use true wall-clock

            default:
                throw new Error(`Temporal Authority Violation: Unknown domain requested by ${subsystem}`);
        }
    }

    /**
     * Resolves deterministic entropy, explicitly enforcing origin constraints.
     */
    public static resolveEntropy(domain: ClockDomain, subsystem: string) {
        if (domain === ClockDomain.EXTERNAL) {
            throw new Error(`Entropy Contamination: ${subsystem} (EXTERNAL) cannot pull seeded simulation entropy.`);
        }
        return CanonicalClock.getInstance().rng();
    }
}

