import { GameState, NPC } from '../../core/models.js';
import { SovereignAvatar } from '../../core/SovereignAvatar.js';
import { GameplaySovereigntyLimb } from '../spatial/GameplaySovereigntyLimb.js';
import { TeleportGrounding } from '../spatial/TeleportGrounding.js';
import { ServerLogicRegistry, LogicalSignature } from '../../engines/gameplay/ServerLogicRegistry.js';
import { SovereignVocabularyLimb, InteractionCategory } from './SovereignVocabularyLimb.js';
import { ExtrasOracle } from './ExtrasOracle.js';
import { ClueLogicLimb } from './ClueLogicLimb.js';

export class InteractionGateway {
    private vocabLimb: SovereignVocabularyLimb;
    private extrasOracle: ExtrasOracle;
    private clueLimb: ClueLogicLimb;

    constructor() {
        this.vocabLimb = new SovereignVocabularyLimb();
        this.extrasOracle = ExtrasOracle.getInstance();
        this.clueLimb = ClueLogicLimb.getInstance();
    }

    /**
     * computeContextHash - Generates a fingerprint of the current state proximity.
     * Prevents interactions from firing if the world shifted significantly.
     */
    private computeContextHash(source: any, target: any, state: GameState): string {
        return `${source.x}_${source.y}_${target.x}_${target.y}_${state.tickNumber}`;
    }

    public isAdjacent(sourceX: number, sourceY: number, targetX: number, targetY: number): boolean {
        return Math.abs(sourceX - targetX) <= 1 && Math.abs(sourceY - targetY) <= 1;
    }

    public evaluateInteraction(source: SovereignAvatar | NPC, action: string, targetId: string, state: GameState, activeModule: any): string[] {
        const events: string[] = [];
        
        // 0. DETERMINISTIC STATE GUARD
        // Cooldown: 1 tick minimum between actions (600ms)
        if (source.lastActionTick && (state.tickNumber ?? 0) <= source.lastActionTick) {
            return [];
        }

        if (source.interactionState === 'EXECUTING' || source.interactionState === 'COOLDOWN') {
            return [];
        }

        // 1. Resolve Target
        const isItem = targetId.startsWith('item_');
        const numericId = parseInt(targetId.replace('npc_', '').replace('obj_', '').replace('item_', ''), 10);
        
        let target: any = isItem ? { id: numericId, name: `Item ${numericId}` } : (state.npcMap.get(numericId) || state.objectMap.get(numericId));
        if (!target) return [];

        const sourceX = source.coord.x;
        const sourceY = source.coord.y;
        
        // 2. ADJACENCY LOCK
        if (!this.isAdjacent(sourceX, sourceY, target.x, target.y)) {
            source.interactionState = 'MOVING';
            return [];
        }

        // 3. CONTEXT HASH VALIDATION (Intent Guard)
        const currentHash = this.computeContextHash(source, target, state);
        if (source.intent && source.intent.contextHash !== currentHash) {
             // If the intent is from a previous state/tick, re-verify or drop
             if ((state.tickNumber ?? 0) - (source.intent.tickStarted || 0) > 5) { // 3 second timeout
                 source.intent = undefined;
                 source.interactionState = 'IDLE';
                 return [`[InteractionGateway] Intent for ${target.name} expired or desynced.`];
             }
        }

        // 4. TRANSITION TO EXECUTING
        source.interactionState = 'EXECUTING';
        source.lastActionTick = state.tickNumber ?? 0;

        // 5. CACHE ACTION VERIFICATION
        if (target.actions || (target.entity && target.entity.actions)) {
            const validActions: string[] = target.actions || target.entity.actions;
            const normalizedTargetAction = validActions.map(a => this.vocabLimb.normalizeHandle(a));
            const requested = this.vocabLimb.normalizeHandle(action);
            
            if (!normalizedTargetAction.includes(requested)) {
                source.interactionState = 'COOLDOWN';
                return [`[InteractionGateway] Rejecting action: '${action}'. Valid for ${target.name}: [${validActions.join(', ')}]`];
            }
        }

        // 6. RESOLVE LOGICAL CONTEXT (0xF9)
        const logicCtx = this.extrasOracle.getLogicalContext(numericId);
        if (logicCtx.handler || Object.keys(logicCtx.extras).length > 0) {
            events.push(`[LogicBridge] Handing off ${action} on ${target.name} to ${logicCtx.handler || 'GenericInterpreter'}`);
            
            if (logicCtx.handler === 'ClueHandler' || this.vocabLimb.normalizeHandle(action) === 'dig') {
                const isMatch = this.clueLimb.isCorrectSpot(numericId, { x: sourceX, y: sourceY, plane: source.plane });
                if (isMatch) events.push(`[ClueLogicLimb] SUCCESS 🏆 ─ Treasures found at [${sourceX}, ${sourceY}].`);
                else events.push(`[ClueLogicLimb] Nothing interesting happens.`);
            }
        }

        // 7. MODULE ROUTING
        if (activeModule && typeof activeModule.onAction === 'function') {
            const moduleResponse = activeModule.onAction(action, state, source);
            if (moduleResponse) events.push(moduleResponse);
        }

        // 8. TELEPORT ACTUATOR SYNC
        const mapping = ServerLogicRegistry.getMapping(16, numericId);
        const grounding = TeleportGrounding.getInstance();
        const dest = grounding.getObjectDest(numericId);

        if (mapping?.signature === LogicalSignature.TELEPORT_ACTUATOR || dest) {
            if (dest) {
                source.coord = dest;
                events.push(`[WARP] ⚡ ${source.name} -> [${dest.x}, ${dest.y}] via ${target.name}.`);
            }
        }

        // 9. FINAL STATE TRANSITION
        source.interactionState = 'COOLDOWN';
        return events;
    }
}
