/**
 * SandboxBridge.ts
 * 
 * The authoritative interceptor suite for the POG2 sandbox.
 * Hooks into engine events (Scripts/Varps/Varbits) and routes them to local logic.
 */

import { createLogger } from '../../utils/logger.js';
import { BetaScripts } from '../../core/beta_constants.js';
import { InteractionGateway } from './InteractionGateway.js';
import { CombatRotationEngine } from '../../engines/gameplay/CombatRotationEngine.js';
import { DirectionalPathfinder } from '../spatial/DirectionalPathfinder.js';
import { GameState, SovereignAvatar, Coord } from '../../core/models.js';

const logger = createLogger('SandboxBridge');

export class SandboxBridge {
    private interaction: InteractionGateway;
    private combat: CombatRotationEngine;
    private pathfinder: DirectionalPathfinder;

    constructor(interaction: InteractionGateway, combat: CombatRotationEngine, pathfinder: DirectionalPathfinder) {
        this.interaction = interaction;
        this.combat = combat;
        this.pathfinder = pathfinder;
    }

    /**
     * onEngineEvent
     * Central dispatcher for intercepted engine scripts.
     */
    public async onEngineEvent(scriptId: number, payload: any, state: GameState, avatar: SovereignAvatar): Promise<void> {
        switch (scriptId) {
            case BetaScripts.MASTER_INTERACTION:
                await this.interaction.handleMasterInteraction(payload, state, avatar);
                break;
            case BetaScripts.MINIMAP_CLICK_HANDLER:
                const start = avatar.coord;
                const end = payload as Coord;
                avatar.currentPath = this.pathfinder.handleMinimapClick(start, end, state);
                break;
            case BetaScripts.ABILITY_DISPATCH_HANDSHAKE:
                const ctx = {
                    adrenaline: avatar.adrenaline || 0,
                    cooldowns: avatar.cooldowns || {},
                    coord: avatar.coord,
                    currentTick: state.tickNumber ?? 0,
                    gcdEndTick: avatar.metadata.gcdEndTick || 0,
                    channelEndTick: avatar.metadata.channelEndTick || 0,
                    combatStyle: avatar.metadata.combatStyle || 'melee',
                    archetype: avatar.metadata.combatArchetype || 'aggressive',
                    state: avatar as any
                };
                this.combat.handleAbilityDispatch(payload.abilityId, ctx);
                break;
            default:
                logger.debug({ scriptId }, 'Unhandled Engine Script Intercepted.');
        }
    }
}

