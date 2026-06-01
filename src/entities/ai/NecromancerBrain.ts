import { GameState, NPC, SovereignAvatar } from '../../core/models.js';
import { CombatLimb } from '../../limbs/spatial/CombatLimb.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('NecroBrain');

/**
 * NecromancerBrain - Decentralized Cognitive Delegate
 * Implements the 4-tick Magic rhythm from the Combat Modernisation patch.
 */
export class NecromancerBrain {
    private lastThinkTick: number = 0;
    private rhythmInterval: number = 4; // 4-tick (2.4s) standard Magic interval

    constructor(private readonly npc: NPC) {
        // Initialize NPC state if missing
        this.npc.adrenaline = this.npc.adrenaline || 0;
        this.npc.cooldowns = this.npc.cooldowns || {};
        this.npc.lastCombatTick = 0;
    }

    /**
     * think - Evaluates world state and injects intent into the NPC.
     * Called by GameplaySovereigntyLimb every heartbeat (600ms).
     */
    public think(tick: number, state: GameState, avatar: SovereignAvatar): void {
        // 1. Target Evaluation (Simple Aggro)
        const dist = Math.max(Math.abs(this.npc.x - avatar.x), Math.abs(this.npc.y - avatar.y));
        const AGGRO_RANGE = 10;

        if (dist > AGGRO_RANGE) {
            this.npc.interactionState = 'IDLE';
            return;
        }

        // 2. Rhythm Check (Modernized 4-tick Monster cadance)
        const ticksSinceLast = tick - (this.npc.lastCombatTick || 0);
        if (ticksSinceLast < this.rhythmInterval) {
            return; // Waiting for rhythm
        }

        // 3. Combat Logic
        const combatLimb = CombatLimb.getInstance();
        const abilityId = '1'; // 'Basic Attack' (Necro Bolt)
        
        const canCast = combatLimb.canCast(this.npc, avatar, abilityId, tick);

        if (canCast.success) {
            // FIRE: Inject combat intent
            this.npc.intent = {
                action: 'COMBAT_ABILITY',
                targetId: 'player', // Special ID for avatar
                tickStarted: tick,
                contextHash: `${this.npc.x},${this.npc.y}`
            };
            this.npc.interactionState = 'EXECUTING';
            logger.info({ npcId: this.npc.id, tick }, 'Necromancer injecting casting intent.');
        } else if (canCast.reason === 'Out of range') {
            // MOVE: Inject movement intent (intercept course)
            this.npc.interactionState = 'MOVING';
            // Pathing logic is handled by the authoritative GameplaySovereigntyLimb 
            // seeing the NPC target the avatar.
            this.npc.target = { x: avatar.x, y: avatar.y, plane: avatar.plane };
        }
    }
}

