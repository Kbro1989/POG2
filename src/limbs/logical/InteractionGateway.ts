import { GameState, NPC, SovereignAvatar } from '../../core/models.js';
import { SovereignAvatarEntity } from '../../core/SovereignAvatar.js';
import { GameplaySovereigntyLimb } from '../spatial/GameplaySovereigntyLimb.js';
import { TeleportGrounding } from '../spatial/TeleportGrounding.js';
import { ServerLogicRegistry, LogicalSignature } from '../../engines/gameplay/ServerLogicRegistry.js';
import { SovereignVocabularyLimb, InteractionCategory } from './SovereignVocabularyLimb.js';
import { VarbitSovereigntyLimb } from '../spatial/VarbitSovereigntyLimb.js';
import { ExtrasOracle } from './ExtrasOracle.js';
import { ClueLogicLimb } from './ClueLogicLimb.js';
import { WorldForensicsLimb } from '../spatial/WorldForensicsLimb.js';
import { createLogger } from '../../utils/logger.js';
import { getInteractionResult, isTransversal } from '../../forensics/ObjectBinaryStore.js';

const logger = createLogger('InteractionGateway');

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

    public async evaluateInteraction(source: SovereignAvatar | NPC, action: string, targetId: string, state: GameState, activeModule: any): Promise<string[]> {
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
        const isObject = targetId.startsWith('obj_');
        const isUI = targetId.startsWith('ui_') || targetId.includes(':');
        
        let target: any = null;
        let numericId = 0;

        if (isUI && (action.toUpperCase() === 'SEARCH' || action.toUpperCase() === 'TYPESTRING')) {
            return this.evaluateSearchIntent(source, targetId, action, state);
        }

        if (isItem) {
            // Expected format: item_<x>_<y>_<id>
            const parts = targetId.split('_');
            if (parts.length >= 4) {
                const ix = parseInt(parts[1], 10);
                const iy = parseInt(parts[2], 10);
                numericId = parseInt(parts[3], 10);
                
                // Locate item on the ground
                const key = `${ix}_${iy}`;
                const itemsOnTile = state.groundItems?.get(key) || [];
                const foundItem = itemsOnTile.find(i => i.id === numericId);
                
                if (foundItem) {
                    target = { ...foundItem, x: ix, y: iy, type: 'item' };
                }
            }
        } else {
            numericId = parseInt(targetId.replace('npc_', '').replace('obj_', ''), 10);
            target = state.npcMap.get(numericId) || state.objectMap.get(numericId);
        }

        if (!target) return [];

        // 1b. AUTHORITATIVE MORPHISM RESOLUTION (Phase 13)
        let activeId = numericId;
        if (isObject) {
            const varbitLimb = VarbitSovereigntyLimb.getInstance();
            const forensics = WorldForensicsLimb.getInstance();
            const def = await forensics.getObjectDefinition(numericId);
            activeId = varbitLimb.resolveCurrentObjectIdFromDef(def, state);
            if (activeId !== numericId) {
                const manifestedDef = await forensics.getObjectDefinition(activeId);
                target = { ...target, id: activeId, name: manifestedDef.name, actions: manifestedDef.actions };
                logger.info({ original: numericId, manifested: activeId }, '[InteractionGateway] Target morphed via Varbit/Varp.');
            }
        }

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

        if (isItem) {
            if (action.toUpperCase() === 'PICKUP' || action.toUpperCase() === 'TAKE') {
                const key = `${target.x}_${target.y}`;
                const itemsOnTile = state.groundItems?.get(key) || [];
                const idx = itemsOnTile.findIndex((i: any) => i.id === target.id);
                if (idx > -1) {
                    const pickedUp = itemsOnTile.splice(idx, 1)[0];
                    if (itemsOnTile.length === 0) {
                        state.groundItems!.delete(key);
                    }
                    
                    if ('inventory' in source && (source as any).inventory && 'addItem' in source) {
                        const added = (source as any).addItem(pickedUp);
                        if (added) {
                            events.push(`[System] You picked up: ${pickedUp.itemName || 'Item ' + pickedUp.id}`);
                        } else {
                            // Inventory full, put it back
                            itemsOnTile.splice(idx, 0, pickedUp);
                            state.groundItems!.set(key, itemsOnTile);
                            events.push(`[System] Your inventory is too full to pick that up.`);
                        }
                    }
                }
            }
            source.interactionState = 'COOLDOWN';
            return events;
        }

        // 3. MORPHISM INTEGRITY CHECK
        const manifestedDef = await WorldForensicsLimb.getInstance().getObjectDefinition(activeId);
        logger.info({ targetId, activeId, actions: manifestedDef.actions }, 'Authoritative Morphism Integrity Check');
        
        if (manifestedDef.actions && !manifestedDef.actions.includes(action)) {
            logger.warn({ action, targetId, manifestedId: activeId }, 'Interaction Gateway - Manifested action set mismatch. Rejecting.');
            return ['ACTION_STATE_GATED_REJECT'];
        }

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

        // 6.5 FORENSIC OBJECT INTERACTION & AUTHORITATIVE MORPHISM
        const rootDef = await WorldForensicsLimb.getInstance().getObjectDefinition(numericId);
        const varbitLimb = VarbitSovereigntyLimb.getInstance();

        if (rootDef.varbitId !== undefined && rootDef.varbitId !== -1 && rootDef.transforms) {
            // Authoritative Cache-driven Varbit Toggle
            const currentVal = varbitLimb.resolveVarbitValue(rootDef.varbitId, state);
            let nextVal = (currentVal + 1) % rootDef.transforms.length;
            
            // Skip invalid transforms (-1)
            let safeCounter = 0;
            while (rootDef.transforms[nextVal] === -1 && safeCounter < rootDef.transforms.length) {
                nextVal = (nextVal + 1) % rootDef.transforms.length;
                safeCounter++;
            }

            await varbitLimb.setVarbit(rootDef.varbitId, nextVal, state);
            events.push(`[InteractionGateway] 🧬 Genome Morph: Toggled Varbit ${rootDef.varbitId} from ${currentVal} to ${nextVal} for ${target.name}.`);
        } else {
            // Fallback to legacy forensic mappings for non-varbit transitions
            const forensicPair = getInteractionResult(activeId);
            if (forensicPair) {
                if (forensicPair.type === 'DOOR') {
                    const manifestedDef = await WorldForensicsLimb.getInstance().getObjectDefinition(forensicPair.resultId);
                    state.objectMap.set(numericId, { 
                        ...target, 
                        id: forensicPair.resultId, 
                        name: manifestedDef.name,
                        actions: manifestedDef.actions 
                    });
                    events.push(`[InteractionGateway] Door opened via legacy override: ${target.name} (ID ${activeId}) -> ${manifestedDef.name} (ID ${forensicPair.resultId})`);
                } else if (forensicPair.type === 'LADDER' || forensicPair.type === 'CAVE' || forensicPair.type === 'PORTAL') {
                    // Plane Transition Logic
                    const isUp = forensicPair.action.toLowerCase().includes('up');
                    const isDown = forensicPair.action.toLowerCase().includes('down') || forensicPair.type === 'CAVE';
                    
                    if (isUp) {
                        source.coord.plane = Math.min(3, source.coord.plane + 1);
                        events.push(`[InteractionGateway] Climbing UP to plane ${source.coord.plane}.`);
                    } else if (isDown) {
                        source.coord.plane = Math.max(0, source.coord.plane - 1);
                        events.push(`[InteractionGateway] Climbing DOWN to plane ${source.coord.plane}.`);
                    }
                }
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

    public handleDialogueScript(scriptId: number, avatar: SovereignAvatar): string[] {
        if (scriptId === 10905) {
            avatar.metadata = avatar.metadata || {};
            avatar.metadata.surveyCompleted = true;
            return ['[Dialogue] You have completed the Sovereign Beta survey. Thank you!'];
        }
        return [];
    }

    public async handleMasterInteraction(payload: any, state: GameState, avatar: SovereignAvatar): Promise<void> {
        logger.info({ payload }, '[InteractionGateway] Authoritative Master Interaction script intercepted.');
        if (payload && payload.action && payload.targetId) {
            await this.evaluateInteraction(avatar, payload.action, payload.targetId, state, null);
        }
    }

    /**
     * evaluateSearchIntent - Handles 'TypeString' and 'Search' pulses targeted at specific UI components.
     * Maps intent-to-search to the precise UI component IDs bound to varbit 28556.
     */
    private evaluateSearchIntent(source: SovereignAvatar | NPC, targetComponentId: string, action: string, state: GameState): string[] {
        const events: string[] = [];
        
        // Strip ui_ prefix if present
        const componentId = targetComponentId.replace('ui_', '');

        // Interfaces known for Search:
        // 703 (Grand Exchange)
        // 1420 (Bank / General Search)
        const interfaceId = componentId.split(':')[0];
        if (interfaceId !== '703' && interfaceId !== '1420' && interfaceId !== '11' && interfaceId !== '91' && interfaceId !== '658' && interfaceId !== '1851') {
             // 11, 91, 658, 1851 are from script_28556_resolution.json
             return [`[InteractionGateway] Rejecting search. Component ${componentId} is not bound to a known search context.`];
        }

        // Search Varbit is 28556 (Global Search State Flag)
        const searchVarbitId = 28556;
        const varbitLimb = VarbitSovereigntyLimb.getInstance();
        
        // 1 = Active Search, 0 = Inactive
        varbitLimb.setVarbit(searchVarbitId, 1, state);
        
        // Attach the query to the avatar's metadata for the UI substrate to read.
        // We use the 'action' or a specific query property if we want, but since action might be SEARCH,
        // we'll assume the intent stores the actual query string.
        let query = action;
        if (source.intent && (source.intent as any).query) {
            query = (source.intent as any).query;
        }

        source.metadata = source.metadata || {};
        source.metadata.activeSearchQuery = query;
        source.metadata.activeSearchComponent = componentId;
        source.metadata.searchActive = true;
        
        source.interactionState = 'COOLDOWN';
        events.push(`[InteractionGateway] 🔍 Search Intent Processed -> Component: ${componentId} | Query: '${query}'. Varbit 28556 activated.`);
        
        return events;
    }
}

