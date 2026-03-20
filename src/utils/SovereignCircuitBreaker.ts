import { createLogger } from './logger.js';
import { CircuitState } from '../core/models.js';

const logger = createLogger('SovereignCircuitBreaker');

export interface CircuitBreakerOptions {
    failureThreshold: number;
    resetTimeoutMs: number;
    name: string;
}

/**
 * SovereignCircuitBreaker - Metabolic Protection
 * Prevents system collapse during high-intensity operations (e.g. mass ingestion).
 * Automatically trips to 'OPEN' state if failures exceed threshold, 
 * allowing the system to fallback to 'GhostLimb' (minimalist) mode.
 */
export class SovereignCircuitBreaker {
    private state: CircuitState = CircuitState.Closed;
    private failureCount: number = 0;
    private lastFailureTime?: number;
    private readonly options: CircuitBreakerOptions;

    constructor(options: CircuitBreakerOptions) {
        this.options = options;
        logger.info({ name: options.name, threshold: options.failureThreshold }, 'Circuit Breaker initialized.');
    }

    public getState(): CircuitState {
        this.checkReset();
        return this.state;
    }

    public async wrap<T>(fn: () => Promise<T>, fallbackValue: T): Promise<T> {
        if (this.getState() === CircuitState.Open) {
            logger.warn({ name: this.options.name }, 'Circuit is OPEN. Executing GhostLimb fallback.');
            return fallbackValue;
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure(error as Error);
            return fallbackValue;
        }
    }

    private onSuccess(): void {
        if (this.state === CircuitState.HalfOpen) {
            logger.info({ name: this.options.name }, 'Circuit RESET to CLOSED.');
            this.state = CircuitState.Closed;
            this.failureCount = 0;
        }
    }

    private onFailure(error: Error): void {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        logger.error({ 
            name: this.options.name, 
            count: this.failureCount, 
            error: error.message 
        }, 'Execution failure recorded.');

        if (this.failureCount >= this.options.failureThreshold) {
            this.trip();
        }
    }

    private trip(): void {
        this.state = CircuitState.Open;
        logger.warn({ name: this.options.name }, 'Circuit TRIPPED to OPEN. Entering stabilization mode.');
    }

    private checkReset(): void {
        if (this.state === CircuitState.Open && this.lastFailureTime) {
            const elapsed = Date.now() - this.lastFailureTime;
            if (elapsed >= this.options.resetTimeoutMs) {
                this.state = CircuitState.HalfOpen;
                logger.info({ name: this.options.name }, 'Circuit entering HALF_OPEN (Testing Substrate).');
            }
        }
    }
}
