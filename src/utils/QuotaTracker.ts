import pino from 'pino';

const logger = pino({ name: 'QuotaTracker', base: { hostname: 'POG2' } });

// ═══ TYPES ═══

export type QuotaProvider = 'ollama' | 'cloudflare' | 'gemini' | 'huggingface' | 'fireworks' | 'openrouter';

export interface ProviderQuota {
    provider: QuotaProvider;
    dailyTokenCeiling: number;
    dailyRequestCeiling: number;
    tokensUsedToday: number;
    requestsToday: number;
    resetAtEpoch: number; // UTC midnight epoch ms
}

export interface QuotaHealth {
    provider: QuotaProvider;
    usedPct: number;           // 0-100
    exhausted: boolean;
    remaining: {
        tokens: number;
        requests: number;
    };
    ceiling: {
        tokens: number;
        requests: number;
    };
}

export interface QuotaState {
    quotas: Record<QuotaProvider, ProviderQuota>;
    lastUpdated: number;
}

// ═══ DEFAULT FREE-TIER CEILINGS ═══

const DEFAULT_CEILINGS: Record<QuotaProvider, { tokens: number; requests: number }> = {
    gemini:      { tokens: 1_000_000, requests: 1_500 },
    cloudflare:  { tokens: Infinity,  requests: 100_000 },
    huggingface: { tokens: Infinity,  requests: 1_000 },
    fireworks:   { tokens: 500_000,   requests: 500 },
    openrouter:  { tokens: 200_000,   requests: 200 },
    ollama:      { tokens: Infinity,  requests: Infinity }
};

// ═══ QUOTA TRACKER CORE ═══

/**
 * QuotaTracker — Sovereign FinOps Metabolic Budget.
 *
 * Tracks per-provider daily usage against free-tier ceilings.
 * Resets counters at UTC midnight. Fully offline-capable.
 * Persists via GlobeStateLimb (durable) or in-memory (local).
 *
 * Biological Role: Adrenal Gland — regulates resource expenditure
 * to prevent quota exhaustion across all cloud substrates.
 */
export class QuotaTracker {
    private quotas: Record<QuotaProvider, ProviderQuota>;

    constructor() {
        this.quotas = this.createDefaultQuotas();
    }

    private createDefaultQuotas(): Record<QuotaProvider, ProviderQuota> {
        const now = Date.now();
        const resetAt = this.getNextMidnightUTC();

        const result: Partial<Record<QuotaProvider, ProviderQuota>> = {};
        for (const [provider, ceiling] of Object.entries(DEFAULT_CEILINGS)) {
            result[provider as QuotaProvider] = {
                provider: provider as QuotaProvider,
                dailyTokenCeiling: ceiling.tokens,
                dailyRequestCeiling: ceiling.requests,
                tokensUsedToday: 0,
                requestsToday: 0,
                resetAtEpoch: resetAt
            };
        }
        return result as Record<QuotaProvider, ProviderQuota>;
    }

    private getNextMidnightUTC(): number {
        const now = new Date();
        const tomorrow = new Date(Date.UTC(
            now.getUTCFullYear(),
            now.getUTCMonth(),
            now.getUTCDate() + 1,
            0, 0, 0, 0
        ));
        return tomorrow.getTime();
    }

    // ═══ PUBLIC API ═══

    /**
     * Record usage from a model call.
     * Called by ModelClient after each successful/failed call.
     */
    recordUsage(provider: QuotaProvider, tokensUsed: number, requests: number = 1): void {
        this.resetIfNewDay();

        const quota = this.quotas[provider];
        if (!quota) return;

        quota.tokensUsedToday += tokensUsed;
        quota.requestsToday += requests;

        // Log warnings at threshold crossings
        const health = this.getQuotaHealth(provider);
        if (health.usedPct >= 90 && health.usedPct - ((tokensUsed / quota.dailyTokenCeiling) * 100) < 90) {
            logger.warn({ provider, usedPct: health.usedPct.toFixed(1) }, '⚠️ QUOTA CRITICAL: Provider approaching daily ceiling');
        } else if (health.usedPct >= 75 && health.usedPct - ((tokensUsed / quota.dailyTokenCeiling) * 100) < 75) {
            logger.info({ provider, usedPct: health.usedPct.toFixed(1) }, '🔶 QUOTA WARNING: Provider at 75% daily usage');
        }
    }

    /**
     * Get quota health for a single provider.
     */
    getQuotaHealth(provider: QuotaProvider): QuotaHealth {
        this.resetIfNewDay();

        const quota = this.quotas[provider];
        if (!quota) {
            return {
                provider,
                usedPct: 0,
                exhausted: false,
                remaining: { tokens: Infinity, requests: Infinity },
                ceiling: { tokens: Infinity, requests: Infinity }
            };
        }

        // Calculate usage percentage based on whichever resource is more constrained
        const tokenPct = quota.dailyTokenCeiling === Infinity
            ? 0
            : (quota.tokensUsedToday / quota.dailyTokenCeiling) * 100;

        const requestPct = quota.dailyRequestCeiling === Infinity
            ? 0
            : (quota.requestsToday / quota.dailyRequestCeiling) * 100;

        const usedPct = Math.max(tokenPct, requestPct);
        const tokensRemaining = quota.dailyTokenCeiling === Infinity
            ? Infinity
            : Math.max(0, quota.dailyTokenCeiling - quota.tokensUsedToday);

        const requestsRemaining = quota.dailyRequestCeiling === Infinity
            ? Infinity
            : Math.max(0, quota.dailyRequestCeiling - quota.requestsToday);

        return {
            provider,
            usedPct: Math.min(usedPct, 100),
            exhausted: tokensRemaining <= 0 || requestsRemaining <= 0,
            remaining: {
                tokens: tokensRemaining,
                requests: requestsRemaining
            },
            ceiling: {
                tokens: quota.dailyTokenCeiling,
                requests: quota.dailyRequestCeiling
            }
        };
    }

    /**
     * Get quota health for all providers.
     */
    getAllQuotaHealth(): QuotaHealth[] {
        return (Object.keys(this.quotas) as QuotaProvider[]).map(p => this.getQuotaHealth(p));
    }

    /**
     * Quick boolean check for TernaryRouter routing gates.
     */
    isProviderExhausted(provider: QuotaProvider): boolean {
        return this.getQuotaHealth(provider).exhausted;
    }

    /**
     * Check if provider is approaching exhaustion (>90% used).
     * Used by TernaryRouter for soft avoidance on non-critical tasks.
     */
    isProviderNearExhaustion(provider: QuotaProvider): boolean {
        return this.getQuotaHealth(provider).usedPct >= 90;
    }

    /**
     * Reset counters if we've passed UTC midnight.
     */
    resetIfNewDay(): void {
        const now = Date.now();
        for (const quota of Object.values(this.quotas)) {
            if (now >= quota.resetAtEpoch) {
                logger.info({ provider: quota.provider }, '🔄 Daily quota reset (UTC midnight)');
                quota.tokensUsedToday = 0;
                quota.requestsToday = 0;
                quota.resetAtEpoch = this.getNextMidnightUTC();
            }
        }
    }

    // ═══ PERSISTENCE ═══

    /**
     * Serialize state for GlobeStateLimb persistence.
     */
    serialize(): QuotaState {
        return {
            quotas: JSON.parse(JSON.stringify(this.quotas)),
            lastUpdated: Date.now()
        };
    }

    /**
     * Restore state from GlobeStateLimb or rolodex.json.
     */
    deserialize(state: QuotaState): void {
        if (!state?.quotas) return;

        for (const [provider, saved] of Object.entries(state.quotas)) {
            const existing = this.quotas[provider as QuotaProvider];
            if (existing && saved) {
                existing.tokensUsedToday = saved.tokensUsedToday ?? 0;
                existing.requestsToday = saved.requestsToday ?? 0;
                existing.resetAtEpoch = saved.resetAtEpoch ?? this.getNextMidnightUTC();
            }
        }

        // Immediately check for day rollover
        this.resetIfNewDay();
        logger.info({ providers: Object.keys(state.quotas).length }, '📊 Quota state restored from persistence');
    }

    // ═══ HEALTH PROBE ═══

    healthCheck(): { online: boolean; details: string } {
        const healths = this.getAllQuotaHealth();
        const exhaustedCount = healths.filter(h => h.exhausted).length;
        const nearExhaustionCount = healths.filter(h => h.usedPct >= 75 && !h.exhausted).length;

        const summaries = healths
            .filter(h => h.ceiling.tokens !== Infinity || h.ceiling.requests !== Infinity)
            .map(h => `${h.provider}:${h.usedPct.toFixed(0)}%`)
            .join(', ');

        return {
            online: true,
            details: exhaustedCount > 0
                ? `⚠️ ${exhaustedCount} provider(s) exhausted, ${nearExhaustionCount} near limit. [${summaries}]`
                : nearExhaustionCount > 0
                    ? `🔶 ${nearExhaustionCount} provider(s) near limit. [${summaries}]`
                    : `✅ All quotas healthy. [${summaries}]`
        };
    }
}
