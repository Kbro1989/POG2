/**
 * GeApi.ts
 *
 * High-fidelity interface for the RuneScape Grand Exchange.
 * Implements a dual-source strategy: Weird Gloop (Primary) -> Jagex Proxy (Fallback).
 *
 * Weird Gloop: CORS-friendly, fast, real-time mid-prices.
 * Jagex Proxy: Official data, required for full item details (members, etc).
 */

import { ApiThrottle } from './ApiThrottle.js';
import { createLogger } from './logger.js';

const logger = createLogger('GeApi');

// ═══════════════════════════════════════════════════════
// Configuration & Interfaces
// ═══════════════════════════════════════════════════════

const WG_BASE = 'https://api.weirdgloop.org/exchange/history/rs';
const JAGEX_PROXY_BASE = 'https://multiplayer-globe-pog2.kristain33rs.workers.dev/api/ge';
const USER_AGENT = 'POG2-Sovereign/1.0 (GE Intelligence Engine; RS3 price enrichment; admin@pog2.internal; +https://github.com/Kbro1989/POG2)';

export interface GePrice {
    itemId: number;
    price: number;
    timestamp: number;
    source: 'weirdgloop' | 'jagex';
}

export interface GeItemDetails {
    id: number;
    name: string;
    members: boolean;
    current: {
        price: number;
        trend: 'rising' | 'falling' | 'neutral';
    };
    day30: {
        change: number;
        trend: 'rising' | 'falling' | 'neutral';
    };
}

export interface GeHistory {
    daily: Array<{ timestamp: number; price: number }>;
    average: Array<{ timestamp: number; price: number }>;
}

// ═══════════════════════════════════════════════════════
// GeApi Implementation
// ═══════════════════════════════════════════════════════

export class GeApi {
    private static throttle = ApiThrottle.getInstance();

    /**
     * Fetch the most recent price for an item.
     * Primary: Weird Gloop (CORS-friendly). Fallback: Jagex Proxy.
     */
    public static async getLatestPrice(itemId: number): Promise<GePrice | null> {
        // 1. Try Weird Gloop first
        try {
            await this.throttle.acquire('weirdgloop');
            const url = `${WG_BASE}/latest?id=${itemId}`;
            const res = await fetch(url, {
                headers: { 'User-Agent': USER_AGENT },
                signal: AbortSignal.timeout(5000)
            });

            if (res.ok) {
                const data = await res.json() as any;
                // Weird Gloop /latest returns { "itemId": { id, name, price, trend } }
                const item = data?.[itemId];
                if (item && typeof item.price === 'number') {
                    return {
                        itemId: item.id || itemId,
                        price: item.price,
                        timestamp: Date.now(),
                        source: 'weirdgloop'
                    };
                }

                // Fallback check for wrapped format in case of API change
                if (data?.data && Array.isArray(data.data)) {
                    const wrappedItem = data.data.find((i: any) => i.id === itemId);
                    if (wrappedItem && typeof wrappedItem.price === 'number') {
                        return {
                            itemId,
                            price: wrappedItem.price,
                            timestamp: Date.now(),
                            source: 'weirdgloop'
                        };
                    }
                }
            }
        } catch (err) {
            logger.debug({ itemId, err }, 'Weird Gloop latest price fetch failed, falling back to Jagex.');
        }

        // 2. Fallback to Jagex via Proxy
        try {
            await this.throttle.acquire('ge');
            const url = `${JAGEX_PROXY_BASE}/detail.json?item=${itemId}`;
            const res = await fetch(url, {
                headers: { 'User-Agent': USER_AGENT },
                signal: AbortSignal.timeout(10000)
            });

            if (res.ok) {
                const data = await res.json() as any;
                if (data?.item) {
                    return {
                        itemId,
                        price: this.parsePrice(data.item.current.price),
                        timestamp: Date.now(),
                        source: 'jagex'
                    };
                }
            }
        } catch (err) {
            logger.error({ itemId, err }, 'Both GE price sources failed.');
        }

        return null;
    }

    /**
     * Fetch comprehensive item details.
     * Primarily uses Jagex Proxy as Weird Gloop only provides pricing.
     */
    public static async getItemDetails(itemId: number): Promise<GeItemDetails | null> {
        await this.throttle.acquire('ge');

        const url = `${JAGEX_PROXY_BASE}/detail.json?item=${itemId}`;
        try {
            const res = await fetch(url, {
                headers: { 'User-Agent': USER_AGENT },
                signal: AbortSignal.timeout(10000)
            });

            if (!res.ok) return null;

            const data = await res.json() as any;
            if (!data?.item) return null;

            const item = data.item;
            return {
                id: item.id,
                name: item.name,
                members: item.members === 'true' || item.members === true,
                current: {
                    price: this.parsePrice(item.current.price),
                    trend: this.normalizeTrend(item.current.trend)
                },
                day30: {
                    change: this.parsePercentage(item.day30.change),
                    trend: this.normalizeTrend(item.day30.trend)
                }
            };
        } catch (err) {
            logger.error({ itemId, err }, 'Failed to fetch GE item details.');
            return null;
        }
    }

    /**
     * Fetch 180-day price history.
     * Primary: Weird Gloop. Fallback: Jagex Proxy.
     */
    public static async getHistoricalData(itemId: number): Promise<GeHistory | null> {
        // Try Weird Gloop
        try {
            await this.throttle.acquire('weirdgloop');
            const url = `${WG_BASE}/180?id=${itemId}`;
            const res = await fetch(url, {
                headers: { 'User-Agent': USER_AGENT },
                signal: AbortSignal.timeout(10000)
            });

            if (res.ok) {
                const data = await res.json() as any;
                // Weird Gloop /180 returns { daily: { ts: price }, average: { ts: price } }
                if (data && data.daily) {
                    const daily = Object.entries(data.daily)
                        .map(([ts, price]) => ({ timestamp: parseInt(ts), price: price as number }))
                        .sort((a, b) => a.timestamp - b.timestamp);

                    const average = data.average
                        ? Object.entries(data.average).map(([ts, price]) => ({ timestamp: parseInt(ts), price: price as number }))
                        : [];

                    return { daily, average };
                }
            }
        } catch (err) {
            logger.debug({ itemId, err }, 'Weird Gloop history failed, trying Jagex.');
        }

        // Fallback to Jagex Proxy
        try {
            await this.throttle.acquire('ge');
            const url = `${JAGEX_PROXY_BASE}/graph.json?item=${itemId}`;
            const res = await fetch(url, {
                headers: { 'User-Agent': USER_AGENT },
                signal: AbortSignal.timeout(10000)
            });

            if (!res.ok) return null;

            const data = await res.json() as any;
            if (!data?.daily) return null;

            const daily = Object.entries(data.daily)
                .map(([ts, price]) => ({ timestamp: parseInt(ts), price: price as number }))
                .sort((a, b) => a.timestamp - b.timestamp);

            const average = data.average
                ? Object.entries(data.average).map(([ts, price]) => ({ timestamp: parseInt(ts), price: price as number }))
                : [];

            return { daily, average };
        } catch (err) {
            logger.error({ itemId, err }, 'Both GE history sources failed.');
        }

        return null;
    }

    // ── Utility Methods ──────────────────────────────────

    /**
     * Parses GE price strings (e.g., "5.2m", "1,234") into raw integers.
     */
    public static parsePrice(priceStr: string): number {
        if (!priceStr) return 0;
        const cleaned = priceStr.replace(/,/g, '').toLowerCase().trim();

        if (cleaned.endsWith('k')) return Math.floor(parseFloat(cleaned) * 1000);
        if (cleaned.endsWith('m')) return Math.floor(parseFloat(cleaned) * 1000000);
        if (cleaned.endsWith('b')) return Math.floor(parseFloat(cleaned) * 1000000000);

        const val = parseFloat(cleaned);
        return isNaN(val) ? 0 : Math.floor(val);
    }

    private static parsePercentage(pctStr: string): number {
        if (!pctStr) return 0;
        const val = parseFloat(pctStr.replace('%', ''));
        return isNaN(val) ? 0 : val;
    }

    private static normalizeTrend(trend: string): 'rising' | 'falling' | 'neutral' {
        const t = trend.toLowerCase();
        if (t.includes('positive') || t.includes('rising')) return 'rising';
        if (t.includes('negative') || t.includes('falling')) return 'falling';
        return 'neutral';
    }
}

