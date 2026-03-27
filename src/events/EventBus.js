import { v7 as uuidv7 } from 'uuid';
/**
 * EventBus - The non-blocking backbone of the Phase 14.5 architecture.
 * Decouples synchronous disk storage from the `TaskScheduler`.
 */
export class EventBus {
    static instance;
    handlers = new Map();
    globalHandlers = [];
    constructor() { }
    static getInstance() {
        if (!EventBus.instance) {
            EventBus.instance = new EventBus();
        }
        return EventBus.instance;
    }
    /**
     * Pushes an event to the bus immediately.
     * Uses Node's `setImmediate` to guarantee the current V8 execution thread
     * never blocks on downstream event processing (like fs.writeFile).
     */
    publish(event) {
        const fullEvent = {
            ...event,
            id: event.id || uuidv7(),
            timestamp: event.timestamp || Date.now()
        };
        const subs = this.handlers.get(fullEvent.type) || [];
        for (const handler of subs) {
            setImmediate(() => handler(fullEvent));
        }
        // Dispatch to universal listeners (like GlobeStateLimb)
        for (const handler of this.globalHandlers) {
            setImmediate(() => handler(fullEvent));
        }
        return fullEvent.id;
    }
    /**
     * Subscribes a processor to all event types.
     */
    subscribeAll(handler) {
        this.globalHandlers.push(handler);
    }
    /**
     * Subscribes a processor to a specific event type.
     */
    subscribe(type, handler) {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, []);
        }
        this.handlers.get(type).push(handler);
    }
}
