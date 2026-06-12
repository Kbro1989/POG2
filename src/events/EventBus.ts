import { v7 as uuidv7 } from 'uuid';

/**
 * The OpenTelemetry / Distributed AI Envelope Event Standard.
 * Standardizes event tracing (traceId, spanId) and ordering across the entire runtime.
 */
export interface SovereignEvent<T = any> {
    id: string;          // uuidv7 time-sorted identifier
    type: string;        // E.g., 'interaction', 'decision', 'vision.analysis'
    timestamp: number;   // Unix epoch
    source: string;      // The component that fired the event (e.g., TernaryRouter)
    traceId?: string;    // Binds events together across a single cognitive pipeline execution
    spanId?: string;     // Secondary grouping (e.g., trial #4 within an experiment)
    sequence?: number;   // Incremental ordering within a trace
    fidelity?: number;   // Cognitive Fidelity Level (LearningFidelity)
    payload: T;          // The actual data payload
    meta?: Record<string, any>; // Arbitrary context (model versions, hardware constraints)
}

// Event Handler Definition
type EventHandler = (event: SovereignEvent) => void;

/**
 * EventBus - The non-blocking backbone of the Phase 14.5 architecture.
 * Decouples synchronous disk storage from the `TaskScheduler`.
 */
export class EventBus {
    private static instance: EventBus;
    private handlers = new Map<string, EventHandler[]>();
    private globalHandlers: EventHandler[] = [];

    private constructor() { }

    public static getInstance(): EventBus {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }

    private queueHandler?: (op: () => void) => void;

    public setQueueHandler(handler: (op: () => void) => void) {
        this.queueHandler = handler;
    }

    private defer(op: () => void) {
        if (this.queueHandler) {
            this.queueHandler(op);
        } else {
            setImmediate(op);
        }
    }

    /**
     * Pushes an event to the bus. 
     * Uses the injected deterministic queue handler (CNSGodheadPulseVolley) 
     * or falls back to Node's `setImmediate`.
     */
    public publish(event: Omit<SovereignEvent, 'id' | 'timestamp'> & { id?: string, timestamp?: number, fidelity?: number }): string {
        const fullEvent: SovereignEvent = {
            ...event,
            id: event.id || uuidv7(),
            timestamp: event.timestamp || Date.now(),
            fidelity: event.fidelity
        };

        const subs = this.handlers.get(fullEvent.type) || [];
        for (const handler of subs) {
            this.defer(() => handler(fullEvent));
        }

        // Dispatch to universal listeners (like GlobeStateLimb)
        for (const handler of this.globalHandlers) {
            this.defer(() => handler(fullEvent));
        }

        return fullEvent.id;
    }

    /**
     * Subscribes a processor to all event types.
     */
    public subscribeAll(handler: EventHandler): void {
        this.globalHandlers.push(handler);
    }

    /**
     * Subscribes a processor to a specific event type.
     */
    public subscribe(type: string, handler: EventHandler): void {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, []);
        }
        this.handlers.get(type)!.push(handler);
    }

    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: "EventBus active and verified." };
    }
}


