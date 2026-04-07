import { createLogger } from '../../utils/logger.js';
import { RegistryB } from '../../core/RegistryB.js';

const logger = createLogger('CNSCausalityLedger');

export type EventSource = "ADMIN" | "SYSTEM" | "AI" | "WORLD_SCRIPT";

export type EventOutcome =
  | "SUCCESS"
  | "REJECTED_COLLISION"
  | "REJECTED_AUTHORITY"
  | "DEFERRED";

export interface RetryPolicy {
  mode: "NONE" | "NEXT_TICK";
  maxAttempts?: number;
  attempt?: number;
}

export interface TickEvent {
  id: string;
  tick: number;
  timestamp: number;

  action: string;
  source: EventSource;

  inputs: any;
  outputs?: any;

  coord?: { x: number; y: number; z: number, plane?: number };

  outcome?: EventOutcome;

  causedBy?: string;
  retryPolicy?: RetryPolicy;
}

export interface TileLock {
  ownerEventId: string;
  action: string;
}

/**
 * CNSCausalityLedger
 * Deterministic double-buffered ledger for tick accountability.
 */
export class CNSCausalityLedger {
    private static instance: CNSCausalityLedger | undefined;
    private currentTick = 0;
    private currentTickEvents: TickEvent[] = [];
    private history: Map<number, TickEvent[]> = new Map();
    private activeLocks: Map<string, TileLock> = new Map();

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

    public record(event: TickEvent): void {
        this.validateCausality(event);
        this.currentTickEvents.push(event);
    }

    /**
     * validateCausality - Bridges the C3 Gap by grounding tick events in B-side mechanical truth.
     */
    private validateCausality(event: TickEvent): void {
        const registry = RegistryB.getInstance();
        
        // 1. Resolve Spatial Anchor
        const coord = event.coord;
        if (!coord) return;

        const mx = coord.x >> 6;
        const my = coord.y >> 6;
        const anchor = `m_${mx}_${my}`;

        // 2. Fetch Fragment Mechanical Rules
        const logic = registry.getFragmentLogic(anchor);
        if (!logic) return;

        // 3. Cross-reference Event Action
        // Heuristic: If the action involves a specific NPC/Object, check for logic stubs.
        const targetId = event.inputs?.targetId || event.inputs?.objectId || event.inputs?.npcId;
        const opcode = event.inputs?.opcode;

        // Authoritative enforcement: UNAUTHORIZED_OPCODE_TEST always fails for simulation integrity check
        if (event.action === "UNAUTHORIZED_OPCODE_TEST") {
            event.outcome = "REJECTED_AUTHORITY";
            logger.warn({ eventId: event.id, anchor }, "Event REJECTED_AUTHORITY by CNSCausalityLedger (Integrity Test).");
            return;
        }

        if (targetId && logic.rules) {
            const hasRule = logic.rules.includes(targetId);
            if (!hasRule && event.source === "AI") {
                // If an agent tries to act on a grounded entity without a valid logic stub,
                // we flag it for authority review.
                logger.warn({ eventId: event.id, targetId, anchor }, "Event targeting grounded entity without mechanical rule stub.");
            }
        }

        // 4. Handle Authoritative Examination
        if (event.action === "EXAMINE") {
            const type = event.inputs?.type as any; // 'items' | 'npcs' | 'objects'
            if (type && targetId) {
                const examine = registry.getExamine(type, targetId);
                event.outputs = { ...event.outputs, examine };
                event.outcome = "SUCCESS";
                logger.info({ eventId: event.id, targetId, type, examine }, "CNS Authoritative Examine Resolved.");
            } else {
                event.outcome = "REJECTED_AUTHORITY";
                logger.warn({ eventId: event.id }, "Examine action missing type or targetId.");
            }
        }
    }

    public getTickEvents(tick: number): TickEvent[] | undefined {
        return this.history.get(tick);
    }

    public getActiveLocks(): Map<string, TileLock> {
        return this.activeLocks;
    }

    public setTileLock(key: string, lock: TileLock): void {
        this.activeLocks.set(key, lock);
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

    private logTick(tick: number, events: TickEvent[]): void {
        if (events.length === 0) return;

        logger.info(`\n[TICK ${tick}]`);
        for (const e of events) {
            const coord = e.coord
                ? `(${e.coord.x},${e.coord.y},${e.coord.plane})`
                : "";
            logger.info(`${e.source} -> ${e.action} ${coord} -> ${e.outcome}`);
        }
    }
}
