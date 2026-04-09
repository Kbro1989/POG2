import { GameState, NPC } from '../../core/models.js';
import { SovereignAvatar } from '../../core/SovereignAvatar.js';
import { GameplaySovereigntyLimb } from '../spatial/GameplaySovereigntyLimb.js';
import { TeleportGrounding } from '../spatial/TeleportGrounding.js';
import { ServerLogicRegistry, LogicalSignature } from '../../engines/gameplay/ServerLogicRegistry.js';
import { SovereignVocabularyLimb, InteractionCategory } from './SovereignVocabularyLimb.js';

export class InteractionGateway {
    private vocabLimb: SovereignVocabularyLimb;

    constructor() {
        this.vocabLimb = new SovereignVocabularyLimb();
    }

    /**
     * Checks if the source is adjacent to the target (8-way 1 tile proximity).
     */
    public isAdjacent(sourceX: number, sourceY: number, targetX: number, targetY: number): boolean {
        return Math.abs(sourceX - targetX) <= 1 && Math.abs(sourceY - targetY) <= 1;
    }

    /**
     * Evaluates a pending interaction when a path finishes.
     */
    public evaluateInteraction(source: SovereignAvatar | NPC, action: string, targetId: string, state: GameState, activeModule: any): string[] {
        const events: string[] = [];
        
        // 1. Resolve Target
        const numericId = parseInt(targetId.replace('npc_', '').replace('obj_', ''), 10);
        let target: any = state.npcMap.get(numericId) || state.objectMap.get(numericId);

        if (!target) {
            events.push(`[InteractionGateway] Target ${targetId} not found in reality.`);
            return events;
        }

        const sourceX = 'coord' in source ? source.coord.x : source.x;
        const sourceY = 'coord' in source ? source.coord.y : source.y;
        
        // 2. Validate Adjacency
        if (!this.isAdjacent(sourceX, sourceY, target.x, target.y)) {
            // Entities are too far apart
            return [];
        }

        // 3. Validate against authentic RS JSON structure extracted by the user (opcodes 0x1E - 0x22)
        // Authentic structures place string arrays into target.actions or target.entity.actions.
        if (target.actions || (target.entity && target.entity.actions)) {
            const validActions: string[] = target.actions || target.entity.actions;
            const normalizedTargetAction = validActions.map(a => this.vocabLimb.normalizeHandle(a));
            const requested = this.vocabLimb.normalizeHandle(action);
            
            if (!normalizedTargetAction.includes(requested)) {
                events.push(`[InteractionGateway] Rejecting action: '${action}'. Valid actions for ${target.name}: [${validActions.join(', ')}]`);
                // For Sovereign simulation context, we might bypass the rejection if it's admin/AI forced, 
                // but honoring the RS3 cache rules grounds the engine perfectly.
                return events;
            }
        }

        // 4. Route to Active Minigame/Module if applicable
        if (activeModule && typeof activeModule.onAction === 'function') {
            const moduleResponse = activeModule.onAction(action, state, source);
            if (moduleResponse) events.push(moduleResponse);
        } else {
            // 5. Fallback Universal Routing
            const category = this.vocabLimb.categorize(action);
            if (category === InteractionCategory.DIALOGUE) {
                events.push(`[InteractionGateway] ${source.name} attempts to talk with ${target.name}.`);
                // Placeholder: Here we would wake up the AI Strategic Thinker
            } else if (category === InteractionCategory.MECHANICAL) {
                // Determine if this mechanical object is mapped as a Teleport Actuator in the Server Logic config
                const numericTargetId = parseInt(target.id?.toString().replace('obj_', '') || targetId.replace('obj_', ''), 10);
                const mapping = ServerLogicRegistry.getMapping(16, numericTargetId);
                const isActuator = mapping?.signature === LogicalSignature.TELEPORT_ACTUATOR;

                const grounding = TeleportGrounding.getInstance();
                const dest = grounding.getObjectDest(numericTargetId);

                if (isActuator || dest) {
                    if (dest) {
                        if ('coord' in source) {
                            source.coord = dest; // Synchronous Space Warp
                            events.push(`[TELEPORT_ACTUATOR] WARP ⚡ ─ ${source.name} was injected into [${dest.x}, ${dest.y}, ${dest.plane}] via ${target.name}.`);
                        } else {
                            source.x = dest.x;
                            source.y = dest.y;
                            source.plane = dest.plane;
                            events.push(`[TELEPORT_ACTUATOR] NPC WARP ⚡ ─ ${source.name} shifted to [${dest.x}, ${dest.y}, ${dest.plane}].`);
                        }
                    } else {
                        events.push(`[TELEPORT_ACTUATOR] Path Gap ─ ${target.name} lacks synthesized coordinates. Grounding required.`);
                    }
                } else {
                    events.push(`[InteractionGateway] ${source.name} applied mechanical force to ${target.name}.`);
                }
            } else {
                events.push(`[InteractionGateway] Unhandled Action: ${action} on ${target.name}.`);
            }
        }
        
        return events;
    }
}
