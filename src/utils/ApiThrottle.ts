/**
 * ApiThrottle.ts
 *
 * Shared rate-limiting utility for RS3 official APIs.
 * Prevents 429 (Too Many Requests) errors by implementing a Token Bucket algorithm
 * per API domain.
 */

import { createLogger } from './logger.js';

const logger = createLogger('ApiThrottle');

/**
 * TokenBucket implementation for precision rate limiting.
 */
class TokenBucket {
    private tokens: number;
    private lastRefill: number;
    private readonly capacity: number;
    private readonly refillRate: number; // tokens per millisecond
    private retryAfterUntil: number = 0;

    constructor(capacity: number, refillPeriodMs: number) {
        this.capacity = capacity;
        this.refillRate = capacity / refillPeriodMs;
        this.tokens = capacity;
        this.lastRefill = Date.now();
    }

    async consume(amount: number = 1): Promise<void> {
        while (true) {
            const now = Date.now();

            // Check for active Retry-After block
            if (now < this.retryAfterUntil) {
                const waitTime = this.retryAfterUntil - now;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            const delta = now - this.lastRefill;

            // Refill tokens based on elapsed time
            this.tokens = Math.min(this.capacity, this.tokens + delta * this.refillRate);
            this.lastRefill = now;

            if (this.tokens >= amount) {
                this.tokens -= amount;
                return;
            }

            // Wait until enough tokens are available
            const waitTime = (amount - this.tokens) / this.refillRate;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    public setRetryAfter(seconds: number): void {
        this.retryAfterUntil = Date.now() + (seconds * 1000);
    }
}

export class ApiThrottle {
    private static instance: ApiThrottle;
    private readonly buckets: Map<string, TokenBucket> = new Map();

    private constructor() {
        // Jagex Observed Rate Limits
        this.buckets.set('ge', new TokenBucket(100, 60 * 1000));        // 100 req/min
        this.buckets.set('bestiary', new TokenBucket(50, 60 * 1000));    // 50 req/min
        this.buckets.set('weirdgloop', new TokenBucket(100, 60 * 1000));    // 100 req/min
        this.buckets.set('hiscores', new TokenBucket(300, 60 * 1000)); // 300 req/min
        this.buckets.set('runemetrics', new TokenBucket(100, 60 * 1000)); // 100 req/min
        this.buckets.set('wiki', new TokenBucket(40, 60 * 1000));       // 40 req/min (~1.5s interval)

    }

    public static getInstance(): ApiThrottle {
        if (!this.instance) {
            this.instance = new ApiThrottle();
        }
        return this.instance;
    }

    /**
     * Requests permission to call a specific API domain.
     * @param domain The API bucket to use ('ge', 'bestiary', 'hiscores', 'runemetrics', 'wiki').
     */
    public async acquire(domain: string): Promise<void> {
        const bucket = this.buckets.get(domain);
        if (!bucket) {
            logger.warn({ domain }, 'Unknown API domain requested. Using default wiki bucket.');
            return this.acquire('wiki');
        }
        await bucket.consume();
    }

    /**
     * Reports a 429 Retry-After signal from a remote server.
     * @param domain The API bucket to throttle.
     * @param seconds The number of seconds to wait before resuming.
     */
    public reportRetryAfter(domain: string, seconds: number): void {
        const bucket = this.buckets.get(domain);
        if (bucket) {
            logger.warn({ domain, seconds }, 'Applying Retry-After throttle from server.');
            bucket.setRetryAfter(seconds);
        }
    }
}

