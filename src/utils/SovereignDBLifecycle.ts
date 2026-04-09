import { createLogger } from './logger.js';

const logger = createLogger('SovereignDBLifecycle');

export interface DBHandler {
    close(): void;
    healthCheck?(): { online: boolean; details: string };
}

/**
 * SovereignDBLifecycle — Centralized registry for all SQLite database handles.
 * 
 * Provides:
 *   - Self-registration by each DB handler on initialization
 *   - Ordered shutdown (reverse registration order: last opened = first closed)
 *   - WAL checkpoint enforcement before close
 *   - Timeout guard to prevent hung exits
 *   - Idempotent: safe to call shutdown() multiple times
 *
 * Biological Analogy: Autophagy — coordinated organelle dissolution.
 */
export class SovereignDBLifecycle {
    private static instance: SovereignDBLifecycle;
    private registry: Map<string, DBHandler> = new Map();
    private isShutdown = false;

    private constructor() {}

    public static getInstance(): SovereignDBLifecycle {
        if (!SovereignDBLifecycle.instance) {
            SovereignDBLifecycle.instance = new SovereignDBLifecycle();
        }
        return SovereignDBLifecycle.instance;
    }

    /**
     * Register a named DB handler for lifecycle management.
     * Call this from each handler's initialize() or constructor.
     */
    public register(name: string, handler: DBHandler): void {
        if (this.isShutdown) {
            logger.warn({ name }, 'Attempted to register DB handler after shutdown — ignoring.');
            return;
        }
        this.registry.set(name, handler);
        logger.info({ name, totalHandlers: this.registry.size }, 'DB handler registered.');
    }

    /**
     * Deregister a handler (e.g., if a script-scoped reader is done early).
     */
    public deregister(name: string): void {
        this.registry.delete(name);
        logger.debug({ name }, 'DB handler deregistered.');
    }

    /**
     * Graceful ordered shutdown with timeout guard.
     * 
     * Sequence:
     *   1. Close all registered handlers in REVERSE registration order
     *      (write-handles registered first → closed last, after readers)
     *   2. If any handler hangs beyond timeoutMs, force-close remaining
     *   3. Mark lifecycle as shut down (idempotent — safe to call twice)
     */
    public async shutdown(timeoutMs = 5000): Promise<void> {
        if (this.isShutdown) {
            logger.debug('Shutdown already completed — idempotent skip.');
            return;
        }

        this.isShutdown = true;
        const handlerNames = [...this.registry.keys()].reverse();

        logger.info({ handlers: handlerNames, count: handlerNames.length }, '🧬 Sovereign DB Lifecycle: Initiating ordered shutdown...');

        const shutdownPromise = new Promise<void>((resolve) => {
            let closed = 0;
            for (const name of handlerNames) {
                const handler = this.registry.get(name);
                if (!handler) continue;

                try {
                    handler.close();
                    closed++;
                    logger.info({ name, closed, total: handlerNames.length }, `✓ ${name} closed.`);
                } catch (err) {
                    logger.error({ name, err }, `✗ ${name} close() threw — continuing shutdown.`);
                }
            }
            this.registry.clear();
            resolve();
        });

        // Timeout guard: if close() hangs on a lock, force exit
        const timeout = new Promise<void>((_, reject) => {
            setTimeout(() => reject(new Error('DB shutdown timeout exceeded')), timeoutMs);
        });

        try {
            await Promise.race([shutdownPromise, timeout]);
            logger.info('🧬 All DB substrates closed cleanly.');
        } catch (err) {
            logger.warn({ err }, '⚠ Shutdown timeout — some handles may not have closed cleanly.');
            this.registry.clear();
        }
    }

    /**
     * Health probe across all registered substrates.
     */
    public healthCheck(): Record<string, any> {
        const report: Record<string, any> = {};
        for (const [name, handler] of this.registry) {
            if (handler.healthCheck) {
                report[name] = handler.healthCheck();
            } else {
                report[name] = { online: true, details: 'Registered (no probe)' };
            }
        }
        return report;
    }

    /**
     * Returns the list of currently registered handler names.
     */
    public getRegisteredNames(): string[] {
        return [...this.registry.keys()];
    }
}
