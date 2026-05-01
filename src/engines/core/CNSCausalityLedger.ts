import { createLogger } from '../../utils/logger.js';
import { createHash, createHmac } from 'crypto';
import { RegistryB } from '../../core/RegistryB.js';
import { rsmvBridge } from '../../utils/RSMVBridge.js';
import { TruthClass } from '../../core/models.js';
import { EpistemicValidator } from './EpistemicValidator.js';
import type { CausalEvidence, CausalTrace, LearningTrace, EventOutcome, SignalSource, EventSource, TickEvent, RetryPolicy, TileLock } from '../../core/models.js';

const logger = createLogger('CNSCausalityLedger');

export interface ValidationResult {
  readonly outcome: EventOutcome;
  readonly outputs?: any;
  readonly warnings?: readonly string[];
  readonly signals: readonly CausalEvidence[];
  readonly metadata?: Record<string, any>;
}

/**
 * CNSCausalityLedger
 * Deterministic double-buffered ledger for tick accountability.
 */
export class CNSCausalityLedger {
    private static instance: CNSCausalityLedger | undefined;
    private currentTick = 0;
    private currentTickEvents: TickEvent[] = [];
    private history: Map<number, readonly TickEvent[]> = new Map();
    private activeLocks: Map<string, TileLock> = new Map();
    private lastEventHash: string | undefined;

    private constructor() {
        if (CNSCausalityLedger.instance) {
            throw new Error('Singleton violation: use CNSCausalityLedger.getInstance()');
        }
    }

    public static getInstance(): CNSCausalityLedger {
        if (!this.instance) {
            this.instance = new CNSCausalityLedger();
        }
        return this.instance;
    }

    public static resetInstance(): void {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('resetInstance is forbidden in production');
        }
        this.instance = undefined;
    }

    public getCurrentTick(): number {
        return this.currentTick;
    }

    /**
     * record - Atomic commit of a validated event to the ledger.
     * Uses Causal Signal Reduction to derive final state.
     */
    public record(event: TickEvent): void {
        const validation = this.validateCausality(event);
        
        // Signal Accumulation
        const signals = [...(event.signals || []), ...validation.signals];
        
        // Signal Reduction (Pure Resolution)
        const { outcome, resolutionIndex } = this.reduceSignals(signals, event.outcome);

        // Atomic Apply (Immutable pattern)
        const partial: TickEvent = {
            ...event,
            outcome,
            signals,
            resolutionPointIndex: resolutionIndex,
            outputs: { ...(event.outputs || {}), ...(validation.outputs || {}) }
        };

        const finalizedEvent = this.sealEvent(partial);
        this.lastEventHash = finalizedEvent.hash;

        // Final Provenance Enforcement
        EpistemicValidator.getInstance().enforceProvenance(finalizedEvent, TruthClass.CAUSAL);

        this.currentTickEvents.push(finalizedEvent);
        
        // Log warnings if any
        if (validation.warnings) {
            validation.warnings.forEach(w => logger.warn({ eventId: event.id }, w));
        }
    }

    /**
     * getTickTrace - Retrieves the full causal trace for a specific event ID.
     */
    public getTickTrace(eventId: string): CausalTrace | undefined {
        const event = this.currentTickEvents.find(e => e.id === eventId);
        if (!event) return undefined;

        return {
            eventId: event.id,
            tick: event.tick,
            signals: event.signals || [],
            resolvedOutcome: event.outcome!,
            resolutionPointIndex: event.resolutionPointIndex
        };
    }

    /**
     * reduceSignals - The Deterministic Truth Arbiter.
     * Returns the outcome and the index of the signal that finalized it.
     */
    private reduceSignals(signals: CausalEvidence[], externalOutcome?: EventOutcome): { outcome: EventOutcome; resolutionIndex?: number } {
        // 1. Check for Spatial Blockers (Highest Priority)
        const spatialIndex = signals.findIndex(s => s.source === "SPATIAL" && s.severity === "BLOCKER");
        if (spatialIndex !== -1) {
            return { outcome: "REJECTED_COLLISION", resolutionIndex: spatialIndex };
        }

        // 2. Check for Policy/Authority Blockers
        const policyIndex = signals.findIndex(s => s.source === "POLICY" && s.severity === "BLOCKER");
        if (policyIndex !== -1) {
            return { outcome: "REJECTED_AUTHORITY", resolutionIndex: policyIndex };
        }

        // 3. Respect External Rejections (If not already blocked)
        if (externalOutcome && externalOutcome !== "SUCCESS") {
            return { outcome: externalOutcome };
        }

        // 4. Default to Success if no blockers exist
        return { outcome: "SUCCESS" };
    }

    /**
     * compileLearningTrace - PURE Transform: Projects machine-truth signals into a human/agent-readable summary.
     * NO INFERENCE ALLOWED. Just mapping resolution indices to descriptions.
     */
    public compileLearningTrace(event: TickEvent): LearningTrace {
        const signals = event.signals || [];
        const resolutionSignal = event.resolutionPointIndex !== undefined ? signals[event.resolutionPointIndex] : null;
        
        const causalChain = signals.map((s, idx) => `[${idx}] ${s.source} - ${s.code}: ${s.description}`);
        
        let summary = `Event ${event.action} resolved to ${event.outcome}.`;
        if (resolutionSignal) {
            summary += ` Finalized at signal [${event.resolutionPointIndex}] (${resolutionSignal.code}).`;
        }

        return {
            eventId: event.id,
            summary,
            causalChain,
            primaryDrivers: resolutionSignal ? [resolutionSignal.description] : []
        };
    }

    /**
     * validateCausality - PURE Phase: Bridges the C3 Gap by grounding tick events in B-side mechanical truth.
     * No mutation allowed. Returns CausalEvidence signals.
     */
    public validateCausality(event: TickEvent): ValidationResult {
        const registry = RegistryB.getInstance();
        const warnings: string[] = [];
        const signals: CausalEvidence[] = [];
        
        let outputs: any = {};

        // 1. Resolve Spatial Anchor
        const coord = event.coord;
        if (!coord) return { outcome: "SUCCESS", signals: [], outputs: {} };

        const mx = coord.x >> 6;
        const my = coord.y >> 6;
        const anchor = `m_${mx}_${my}`;

        // 2. Authorization Registry Check
        if (!registry.isActionAuthorized(event.action)) {
            signals.push({
                source: "POLICY",
                code: "UNAUTHORIZED_ACTION",
                description: `Action ${event.action} not authorized by RegistryB.`,
                severity: "BLOCKER"
            });
        }

        // 3. Fetch Fragment Mechanical Rules
        const logic = registry.getFragmentLogic(anchor);
        if (!logic) {
            signals.push({
                source: "DOMAIN",
                code: "MISSING_FRAGMENT_LOGIC",
                description: `No mechanical logic fragment found for anchor ${anchor}`,
                severity: "WARNING"
            });
            warnings.push(`No mechanical logic fragment found for anchor ${anchor}`);
        }

        // 4. Cross-reference Event Action
        const targetId = event.inputs?.targetId || event.inputs?.objectId || event.inputs?.npcId;

        if (targetId && logic && logic.rules) {
            const hasRule = logic.rules.includes(targetId);
            if (!hasRule && event.source === "AI") {
                signals.push({
                    source: "DOMAIN",
                    code: "UNGROUNDED_AI_INTERACTION",
                    description: `AI event targeting grounded entity ${targetId} without mechanical rule stub in ${anchor}.`,
                    severity: "WARNING"
                });
                warnings.push(`AI event targeting grounded entity ${targetId} without mechanical rule stub in ${anchor}.`);
            }
        }

        // 5. Handle Authoritative Examination (Pure Resolve)
        if (event.action === "EXAMINE") {
            const type = event.inputs?.type as any;
            if (type && targetId) {
                const examine = registry.getExamine(type, targetId);
                outputs = { ...outputs, examine };
            } else {
                signals.push({
                    source: "POLICY",
                    code: "MALFORMED_EXAMINE",
                    description: "Examine action missing type or targetId.",
                    severity: "BLOCKER"
                });
                warnings.push("Examine action missing type or targetId.");
            }
        }

        // Preliminary outcome for the validate phase itself
        const outcome = signals.some(s => s.severity === "BLOCKER") ? "REJECTED_AUTHORITY" : "SUCCESS";

        return { outcome, outputs, warnings, signals };
    }

    public getTickEvents(tick: number): readonly TickEvent[] | undefined {
        return this.history.get(tick);
    }

    public getActiveLocks(): Map<string, TileLock> {
        return this.activeLocks;
    }

    public setTileLock(key: string, lock: Omit<TileLock, 'tick'>): void {
        this.activeLocks.set(key, {
            ...lock,
            tick: this.currentTick
        });
    }

    public clearLocks(): void {
        this.activeLocks.clear();
    }

    /**
     * commitTick - Finalize the active frame and increment tick counter.
     */
    public commitTick(): void {
        this.history.set(this.currentTick, [...this.currentTickEvents]);
        
        // Log final resolution for the tick
        this.logTick(this.currentTick, this.currentTickEvents);

        this.currentTickEvents = [];
        this.activeLocks.clear();
        this.currentTick++;
    }

    private logTick(tick: number, events: readonly TickEvent[]): void {
        if (events.length === 0) return;

        logger.info(`\n[TICK ${tick}]`);
        for (const e of events) {
            const coord = e.coord
                ? `(${e.coord.x},${e.coord.y},${e.coord.plane})`
                : "";
            logger.info(`${e.source} -> ${e.action} ${coord} -> ${e.outcome} [${e.hash?.substring(0, 8)}]`);
        }
    }

    /**
     * sealEvent - Cryptographic signature of event integrity.
     * Enforces deterministic serialization to ensure hash stability.
     * Anchored to Substrate Version (RSMV) and signed via HMAC.
     * 
     * TIER PROMOTION: EXECUTION -> CAUSAL
     */
    private sealEvent(event: TickEvent): TickEvent {
        const validator = EpistemicValidator.getInstance();
        
        // 1. Transition Enforcement
        const targetClass = TruthClass.CAUSAL;
        const isValid = validator.validateTransition(event.truthClass, targetClass);
        const finalClass = isValid ? targetClass : TruthClass.ANOMALY;

        // 2. Capture Substrate Anchor
        const anchor = rsmvBridge.isOnline ? 'RS3_CACHE_V2' : 'OFFLINE_SIM';

        // 3. Deterministic Payload Construction
        const payload = JSON.stringify(event, Object.keys(event).sort());
        
        // 4. Authority Signing
        const secret = process.env.SOVEREIGN_ROOT_SECRET || 'TEMPORARY_FALLBACK_KEY';
        
        const hash = createHash('sha256')
            .update(payload)
            .update(this.lastEventHash || 'GENESIS')
            .digest('hex');

        const signature = createHmac('sha256', secret)
            .update(hash)
            .update(anchor)
            .digest('hex');

        return {
            ...event,
            truthClass: finalClass,
            hash,
            parentHash: this.lastEventHash,
            signature,
            substrateAnchor: anchor
        };
    }
}
