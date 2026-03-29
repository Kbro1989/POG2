import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from "../../utils/logger.js";
import { getSovereignRoot } from '../../utils/SovereignPathResolver.js';
import { Result, ok, err, VarbitSnapshot, CompositeCondition, GameState, SpatialSideEffect } from '../../core/models.js';

const logger = createLogger('MechanicalSovereigntyLimb');

export interface MechanicalLogicArtifact {
    region: string;
    metadata: any;
    sarcophagi?: any[];
    state_machines?: {
        [key: string]: any;
    };
    loot_chest?: any;
    rules?: any[]; // Array of general rules (e.g. for dynamic spatial effects)
}

export class MechanicalSovereigntyLimb {
    private readonly logicDir: string;
    private loadedLogic: Map<string, MechanicalLogicArtifact> = new Map();

    constructor() {
        this.logicDir = path.join(getSovereignRoot(), 'atlas', 'logic');
    }

    /**
     * initialize - Prepares the mechanical substrate.
     */
    public async initialize(): Promise<Result<boolean>> {
        try {
            logger.info({ dir: this.logicDir }, 'Initializing MechanicalSovereigntyLimb...');
            
            if (!fs.existsSync(this.logicDir)) {
                fs.mkdirSync(this.logicDir, { recursive: true });
                logger.warn('Mechanical Atlas directory missing. Created blank substrate.');
            }

            // Auto-load Barrows if synthesized
            await this.loadLogic('barrows');
            
            // Auto-load Global Logic for Dynamic Spatial Effects
            await this.loadLogic('follower');
            await this.loadLogic('object');
            
            logger.info(`MechanicalSovereigntyLimb active with ${this.loadedLogic.size} regions loaded.`);
            return ok(true);
        } catch (error) {
            logger.error({ error }, 'Failed to initialize MechanicalSovereigntyLimb.');
            return err(error as Error);
        }
    }

    /**
     * loadLogic - Ingests a specific region's mechanical rules.
     */
    public async loadLogic(name: string): Promise<Result<void>> {
        let filename = name;
        if (!filename.endsWith('.json')) {
            filename = `${name}_logic.json`;
        }

        const fullPath = path.join(this.logicDir, filename);
        if (!fs.existsSync(fullPath)) {
            return err(new Error(`Mechanical logic file not found: ${fullPath}`));
        }

        try {
            const data = JSON.parse(fs.readFileSync(fullPath, 'utf8')) as MechanicalLogicArtifact;
            this.loadedLogic.set(data.region.toLowerCase(), data);
            logger.info({ region: data.region }, 'Ingested Mechanical Sovereignty Artifact.');
            return ok(undefined);
        } catch (error) {
            logger.error({ error, filename }, 'Failed to parse mechanical artifact.');
            return err(error as Error);
        }
    }

    /**
     * getSpawningRule - Resolves the spawning logic for a specific object interaction.
     */
    public getSpawningRule(objectId: number, region: string = 'barrows'): Result<any> {
        const logic = this.loadedLogic.get(region.toLowerCase());
        if (!logic || !logic.sarcophagi) {
            return err(new Error(`No logic found for region: ${region}`));
        }

        const sarcophagus = logic.sarcophagi.find(s => s.object_id === objectId);
        if (!sarcophagus) {
            return err(new Error(`No spawning rule for Object ID: ${objectId} in ${region}`));
        }

        return ok(sarcophagus);
    }

    /**
     * resolveStateTransition - Evaluates how a varbit change affects the mechanical world.
     */
    public resolveStateTransition(varbitId: number, value: number, region: string = 'barrows'): Result<any> {
        const logic = this.loadedLogic.get(region.toLowerCase());
        if (!logic || !logic.state_machines) {
            return err(new Error(`No state machines found for region: ${region}`));
        }

        const killStates = logic.state_machines.brother_kill_states;
        const entry = killStates[varbitId.toString()];
        
        if (!entry) {
            return err(new Error(`No state transition mapped to Varbit: ${varbitId}`));
        }

        return ok({
            varbit: varbitId,
            value,
            effect: entry.description || 'Unknown mechanical effect'
        });
    }

    /**
     * evaluateLootLogic - Checks if the requirements for loot are met.
     */
    public evaluateLootLogic(chestId: number, region: string = 'barrows'): Result<any> {
        const logic = this.loadedLogic.get(region.toLowerCase());
        if (!logic || !logic.loot_chest || logic.loot_chest.object_id !== chestId) {
            return err(new Error(`No loot logic for Chest ID: ${chestId} in ${region}`));
        }

        return ok(logic.loot_chest.unlock_condition);
    }

    /**
     * getSpatialSideEffects - Evaluates if an entity has specific spatial side effects (e.g. blocking collision)
     * based on the current game state.
     */
    public async getSpatialSideEffects(
        entityId: number,
        context: GameState
    ): Promise<SpatialSideEffect | null> {
        for (const logic of this.loadedLogic.values()) {
            if (logic.rules) {
                const rule = logic.rules.find(r => r.entity_id === entityId);
                if (rule && rule.spatial_side_effects) {
                    const sideEffect = rule.spatial_side_effects as SpatialSideEffect;
                    
                    if (sideEffect.condition) {
                        const met = await this.evaluateStringCondition(sideEffect.condition, context);
                        if (!met) return null;
                    }
                    
                    return sideEffect;
                }
            }
        }
        return null;
    }

    /**
     * evaluateCompositeCondition - Evaluates a set of conditions using AND/OR logic.
     */
    public async evaluateCompositeCondition(
        condition: CompositeCondition,
        context: GameState
    ): Promise<boolean> {
        if (condition.type === 'composite_and') {
            for (const cond of condition.conditions) {
                const met = await this.evaluateStringCondition(cond, context);
                if (!met) return false;
            }
            return true;
        }
        if (condition.type === 'composite_or') {
            for (const cond of condition.conditions) {
                const met = await this.evaluateStringCondition(cond, context);
                if (met) return true;
            }
            return false;
        }
        return false;
    }

    /**
     * evaluateStringCondition - Parses and evaluates a string-based condition.
     * Supports varbits and basic functional checks.
     */
    public async evaluateStringCondition(
        condition: string,
        context: GameState
    ): Promise<boolean> {
        // Varbit matching: varbit_1234 == 1
        const varbitMatch = condition.match(/varbit_(\d+)\s*(==|!=|<|>|<=|>=)\s*(\d+)/);
        if (varbitMatch) {
            const [_, idStr, operator, valStr] = varbitMatch;
            const id = parseInt(idStr);
            const target = parseInt(valStr);
            const actual = context.varbits.get(id) || 0;
            switch (operator) {
                case '==': return actual === target;
                case '!=': return actual !== target;
                case '<': return actual < target;
                case '>': return actual > target;
                case '<=': return actual <= target;
                case '>=': return actual >= target;
            }
        }

        // Inventory matching: has_item(12519) == true
        const itemMatch = condition.match(/has_item\((\d+)\)\s*==\s*(true|false)/);
        if (itemMatch) {
            const [_, idStr, stateStr] = itemMatch;
            const itemId = parseInt(idStr);
            const target = stateStr === 'true';
            const has = context.playerInventory.includes(itemId);
            return has === target;
        }

        // Functional check matching: is_follower_active(player, 7015) == true
        // (For now, treat as successful if item is in inventory or npc is near?) 
        // Simplified heuristic for Phase 4
        if (condition.includes('is_follower_active')) {
            const match = condition.match(/is_follower_active\(.*,\s*(\d+)\)\s*==\s*true/);
            if (match) {
                const entityId = parseInt(match[1]);
                // Heuristic: if npc is in the spatial index on the current plane, it's active
                for (const npcs of context.npcSpatialIndex.values()) {
                    if (npcs.some(n => n.id === entityId)) return true;
                }
            }
            return false;
        }

        return false;
    }

    public healthCheck(): { online: boolean; details: string } {
        const count = this.loadedLogic.size;
        return {
            online: true,
            details: `Mechanical Sovereignty: ${count} regions loaded. (${[...this.loadedLogic.keys()].join(', ')})`
        };
    }
}
