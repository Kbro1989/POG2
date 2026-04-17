// src/core/EntityGhost.ts

import { Coord } from './models.js';

/**
 * EntityGhost - The predictive spatial projection of an entity.
 * Used by GhostSplatEngine to forecast positions and combat state.
 */
export interface EntityGhost {
    entityId: string;              // e.g. 'player_sovereign' or 'npc_42'
    projectedCoord: Coord;
    ticksAhead: number;
    confidence: number;            // 0.0 - 1.0
    combatState?: {
        hp: number;
        adrenaline?: number;
        prayerActive: boolean;
    };
    source: 'path_queue' | 'extrapolation' | 'intent' | 'offline_fallback';
}
