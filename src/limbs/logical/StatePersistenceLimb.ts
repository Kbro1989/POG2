/**
 * StatePersistenceLimb.ts
 *
 * Orchestrates gameplay progress snapshots by mapping current entity state
 * (GhostSplat targets, active pathfinding) against authoritative definitions
 * from ItemBook and AbilityBook.
 *
 * Sovereign Substrate: Gameplay State Persistence
 */

import { PlayerStateExporter } from '../../utils/PlayerStateExporter.js';
import { ItemBook } from '../../engines/gameplay/ItemBook.js';
import { AbilityBook } from '../../engines/gameplay/AbilityBook.js';
import { createLogger } from '../../utils/logger.js';
import { HydratedPlayerConfig } from '../../engines/gameplay/PlayerStateHydrator.js';
import { CanonicalClock } from '../../utils/CanonicalClock.js';

const logger = createLogger('StatePersistenceLimb');

export class StatePersistenceLimb {
    private static instance: StatePersistenceLimb;

    private constructor() {}

    public static getInstance(): StatePersistenceLimb {
        if (!this.instance) {
            this.instance = new StatePersistenceLimb();
        }
        return this.instance;
    }

    /**
     * Captures a gameplay snapshot.
     * Maps actionables/IDs to ItemBook/AbilityBook definitions to ensure 
     * saved state is grounded in current substrate reality.
     */
    public async captureSnapshot(playerState: any, activeTargets: string[]): Promise<string> {
        const itemBook = ItemBook.getInstance();
        const abilityBook = AbilityBook.getInstance();

        // 1. Resolve relative entity metadata
        const resolvedEquipment = Object.fromEntries(
            Object.entries(playerState.equipment).map(([slot, id]) => [slot, itemBook.get(id as number)?.name || 'Unknown'])
        );

        // 2. Validate Actionables
        const resolvedActions = playerState.actionBarSlots.map((id: string) => 
            abilityBook.get(id)?.name || 'Unknown'
        );

        // 3. Hydrate state structure
        const config: HydratedPlayerConfig = {
            spawnCoord: playerState.position,
            combatStyle: playerState.style,
            actionBarSlots: playerState.actionBarSlots,
            currentHp: playerState.hp,
            maxHp: playerState.maxHp,
            adrenaline: playerState.adrenaline,
            prayer: playerState.prayer,
            equipment: playerState.equipment,
            skills: playerState.skills,
            weaponTier: itemBook.getWeaponScalar(playerState.equipment.weapon || 0),
            savedAtTick: CanonicalClock.getInstance().getGameTick()
        };

        // 4. Export to canonical string format
        const snapshot = PlayerStateExporter.serialize(config);
        
        logger.info({ tick: config.savedAtTick, targets: activeTargets.length }, 'Gameplay snapshot captured.');
        return snapshot;
    }
}
