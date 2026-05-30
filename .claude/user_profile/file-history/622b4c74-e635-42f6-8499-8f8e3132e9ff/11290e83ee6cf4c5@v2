/**
 * GhostSplatHitmarkRegistry.ts
 *
 * Maps wiki hitmark sprite identifiers to combat state transitions
 * and volition signals for the GhostSplat Engine.
 *
 * Sovereign Substrate: Combat Feedback Layer
 * Cache Authority: D:\sovereign\atlas\wiki\cache\mechanics\hitsplat.json
 */

import { createLogger } from '../utils/logger.js';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const logger = createLogger('GhostSplatHitmarkRegistry');

export interface HitmarkTelemetry {
    type: 'damage' | 'heal' | 'poison' | 'reflect' | 'miss' | 'crit' | 'unknown';
    spriteId: string;      // e.g., "Hitsplat (poison).png"
    color: string;         // Parsed color code
    isPlayer: boolean;     // True if triggered by player, false if by NPC
    abilityTrigger?: string; // The specific ability that caused this hitmark
    volitionSignal: string;  // Routing hint for GhostSplatEngine
}

export class GhostSplatHitmarkRegistry {
    private static instance: GhostSplatHitmarkRegistry;
    private readonly CACHE_PATH = join('D:', 'sovereign', 'atlas', 'wiki', 'cache', 'mechanics', 'hitsplat.json');
    private hitmarkMap: Map<string, HitmarkTelemetry> = new Map();

    private constructor() {
        this.loadRegistry();
    }

    public static getInstance(): GhostSplatHitmarkRegistry {
        if (!this.instance) {
            this.instance = new GhostSplatHitmarkRegistry();
        }
        return this.instance;
    }

    private loadRegistry(): void {
        if (!existsSync(this.CACHE_PATH)) {
            logger.warn({ path: this.CACHE_PATH }, 'Hitsplat cache not found. Registry operating on empty map.');
            return;
        }

        try {
            const raw = readFileSync(this.CACHE_PATH, 'utf8');
            const data = JSON.parse(raw);

            // The cache is expected to be an array of hitmark objects
            if (Array.isArray(data)) {
                for (const entry of data) {
                    if (entry.spriteId) {
                        this.hitmarkMap.set(entry.spriteId, {
                            type: entry.type || 'unknown',
                            spriteId: entry.spriteId,
                            color: entry.color || '#FFFFFF',
                            isPlayer: entry.isPlayer ?? true,
                            abilityTrigger: entry.abilityTrigger,
                            volitionSignal: this.deriveVolitionSignal(entry)
                        });
                    }
                }
            }
            logger.info({ count: this.hitmarkMap.size }, 'GhostSplat Hitmark Registry loaded.');
        } catch (err) {
            logger.error({ err }, 'Failed to load GhostSplat Hitmark Registry.');
        }
    }

    private deriveVolitionSignal(entry: any): string {
        const type = entry.type || 'unknown';
        switch (type) {
            case 'poison': return 'SovereignSubstrate:AggressionSimulator → HealthMonitorLimb';
            case 'heal': return 'SovereignSubstrate:VitalitySustain → RecoveryLimb';
            case 'crit': return 'SovereignSubstrate:CombatRotationEngine → HighImpactSplat';
            case 'reflect': return 'SovereignSubstrate:GhostSplatEngine → VolitionFeedback';
            case 'miss': return 'SovereignSubstrate:CombatRotationEngine → AccuracyAdjustment';
            default: return 'SovereignSubstrate:GeneralCombat → StateTransition';
        }
    }

    /**
     * Resolve a sprite ID to its telemetry and volition signal.
     */
    public resolveHitmark(spriteId: string): HitmarkTelemetry | null {
        return this.hitmarkMap.get(spriteId) || null;
    }

    /**
     * Returns all registered hitmarks for a specific type.
     */
    public getHitmarksByType(type: string): HitmarkTelemetry[] {
        return Array.from(this.hitmarkMap.values()).filter(h => h.type === type);
    }
}
