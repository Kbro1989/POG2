import { SovereignDomain } from '../types/SovereignDomain.js';

export class UsageTracker {
    private static instance: UsageTracker;
    private usageMap: Map<SovereignDomain, Map<string, number>> = new Map();

    private constructor() {
        // Initialize map for all domains
        Object.values(SovereignDomain).forEach(domain => {
            this.usageMap.set(domain, new Map());
        });
    }

    public static getInstance(): UsageTracker {
        if (!UsageTracker.instance) {
            UsageTracker.instance = new UsageTracker();
        }
        return UsageTracker.instance;
    }

    public trackCall(domain: SovereignDomain, toolName: string): void {
        const domainMap = this.usageMap.get(domain);
        if (domainMap) {
            const count = domainMap.get(toolName) || 0;
            domainMap.set(toolName, count + 1);
        }
    }

    public getUsageStats(): Record<string, Record<string, number>> {
        const stats: Record<string, Record<string, number>> = {};
        for (const [domain, toolMap] of this.usageMap.entries()) {
            stats[domain] = Object.fromEntries(toolMap.entries());
        }
        return stats;
    }
}
