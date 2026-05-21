/**
 * StateMocks.ts
 * 
 * Provides deterministic mock states for the 2026 Beta environment.
 * Used for bypassing network-dependent state checks.
 */

import { BetaVars } from '../../core/beta_constants.js';

export const BetaStateMocks = {
    /**
     * getLobbyState
     * Returns the required Varps/Varbits for an instant "Play Now" transition.
     */
    getLobbyState: () => ({
        varbits: {
            [BetaVars.VARBIT_IMPORT_SAVE_STALL]: 0,
        },
        varps: {
            [BetaVars.VARP_BETA_ACTIVE]: 1,
        }
    }),

    /**
     * getCombatState
     * Returns a high-adrenaline state for ability rotation testing.
     */
    getCombatState: () => ({
        adrenaline: 10000, // 100%
        cooldowns: {},
        necrosisStacks: 12
    }),

    /**
     * getPeacefulState
     * Returns a zero-adrenaline, non-combat state to ensure "Peaceful" animations.
     * Prevents the "Arms Lock-up" bug in the 2026 Beta.
     */
    getPeacefulState: () => ({
        adrenaline: 0,
        inCombat: false,
        lastCombatTick: -100,
        stance: 'PEACEFUL'
    })
};

