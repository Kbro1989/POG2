import { Coord, NPC, CombatantState, Item, Skill, SkillId, Wallet, Equipment, EquipmentSlot, GameState, SovereignAvatar as ISovereignAvatar } from './models.js';
import { DirectionalPathfinder } from '../limbs/spatial/DirectionalPathfinder.js';
import { AdrenalineStateMachine } from '../limbs/combat/AdrenalineStateMachine.js';

export enum SkillRelevance {
    COMBAT_DIRECT = 'combat_direct',     // Affects rotation/damage
    COMBAT_INDIRECT = 'combat_indirect', // Affects preparation/validation
    NON_COMBAT = 'non_combat',           // Ignored by combat engine
}

export const SKILL_RELEVANCE_MAP: Record<number, SkillRelevance> = {
    [SkillId.ATTACK]: SkillRelevance.COMBAT_DIRECT,
    [SkillId.STRENGTH]: SkillRelevance.COMBAT_DIRECT,
    [SkillId.DEFENCE]: SkillRelevance.COMBAT_DIRECT,
    [SkillId.RANGED]: SkillRelevance.COMBAT_DIRECT,
    [SkillId.MAGIC]: SkillRelevance.COMBAT_DIRECT,
    [SkillId.CONSTITUTION]: SkillRelevance.COMBAT_DIRECT,
    [SkillId.PRAYER]: SkillRelevance.COMBAT_DIRECT,
    [SkillId.SUMMONING]: SkillRelevance.COMBAT_DIRECT,
    [SkillId.NECROMANCY]: SkillRelevance.COMBAT_DIRECT,
    [SkillId.HERBLORE]: SkillRelevance.COMBAT_INDIRECT,
    [SkillId.SLAYER]: SkillRelevance.COMBAT_INDIRECT,
    [SkillId.AGILITY]: SkillRelevance.COMBAT_INDIRECT,
    [SkillId.SMITHING]: SkillRelevance.COMBAT_INDIRECT,
    [SkillId.INVENTION]: SkillRelevance.COMBAT_INDIRECT,
    [SkillId.ARCHAEOLOGY]: SkillRelevance.COMBAT_INDIRECT,
    [SkillId.DIVINATION]: SkillRelevance.COMBAT_INDIRECT,
    [SkillId.RUNECRAFTING]: SkillRelevance.COMBAT_INDIRECT,
    // Remainder non-combat
};

export class SovereignAvatarEntity implements NPC, CombatantState, ISovereignAvatar {
    public id: number = -1; // Local player ID proxy
    public name: string = 'Sovereign';
    public username: string;
    public x: number;
    public y: number;
    public plane: number;
    public coord: Coord;
    public metadata: Record<string, any> = {};
    // Combat State Machine
    public combatEngine: AdrenalineStateMachine;
    public animationId: number = -1;

    // Live Bridge (Phase 112)
    public onStateChange?: (type: string, delta: any) => void;
    private subscribers: Map<string, Set<(delta: any) => void>> = new Map();

    // Global State Bus (Phase 11)
    public state: GameState;
    
    // Persistent Organism State
    public inventory: (Item | null)[]; // Fixed 28 slots
    public bank: Item[];
    public wallet: Wallet;
    public equipment: Equipment;
    public skills: Record<number, Skill>;
    public quests: { points: number; completedCount: number; quests: Record<number, any> }; // QuestState
    public achievements: { points: number; completed: Record<string, boolean> };
    
    public appearanceEra: 'pre_avatar' | 'transitional' | 'post_avatar' = 'post_avatar';
    
    public get appearance() {
        const bt = this.visualState.morphology.bodyType;
        return {
            gender: bt === 'refresh_female' ? 'female' as const
                  : bt === 'classic' ? 'classic' as const
                  : 'male' as const,
            mode: bt === 'classic' ? 'classic' : 'beta',
            bodyType: bt,
        };
    }
    
    // Sovereign Rendering State
    public visualState: {
        // From AvatarStateLimb
        skinRgb: number;        // Enum 1195 lookup
        hairRgb: number;        // Enum 1195 lookup  
        bodyKit: number;        // Appearance Kit model ID
        faceMorph: Float32Array; // Sub-morph weights
        
        // Avatar Refresh (Varp 5745, 5746, 524476)
        morphology: {
            // Varp 5745
            bodyBase: number;
            torsoLegsStyle: number;
            bodyType: 'classic' | 'refresh_male' | 'refresh_female';
            gameMode: number;
            oldHeadFallback: boolean;
            torsoOverride: boolean;
            
            // Varp 5746 (category indices)
            categoryIndices: {
                head: number; torso: number; legs: number;
                shoes: number; beard: number; skinMat: number; hairMat: number;
            };
            
            // Varp 524476 (color/style indices)
            appearanceIndices: {
                skinColor: number; hairColor: number; torsoColor: number;
                randomSeed: number; shoeColor: number;
            };
        };
        
        // From Wardrobe (1797)
        dgTheme: 'frozen' | 'furnished' | 'abandoned' | 'occult' | 'warped';
        dgSlots: boolean[];     // 5 slots unlocked bitmap
        
        // Dynamic animation/material states
        combatStance: 'melee' | 'ranged' | 'magic' | 'necromancy';
    } = {
        skinRgb: 12104087, // Default to a neutral skin tone from enum 1195
        hairRgb: 1907226,  // Default dark hair
        bodyKit: -1,
        faceMorph: new Float32Array(8),
        morphology: {
            bodyBase: 0, torsoLegsStyle: 0, bodyType: 'refresh_male', gameMode: 0,
            oldHeadFallback: false, torsoOverride: false,
            categoryIndices: { head: 0, torso: 0, legs: 0, shoes: 0, beard: 0, skinMat: 0, hairMat: 0 },
            appearanceIndices: { skinColor: 0, hairColor: 0, torsoColor: 0, randomSeed: 0, shoeColor: 0 }
        },
        dgTheme: 'frozen',
        dgSlots: [false, false, false, false, false],
        combatStance: 'melee'
    };

    public lastHub: string = 'Lumbridge';
    public lastDeathCoord: Coord | null = null;

    // Status Trackers
    public runEnergy: number;
    public lockTicks: number; // Ticks before they can act again
    public currentPath: Coord[] | null;
    public interactionState: 'IDLE' | 'MOVING' | 'READY' | 'EXECUTING' | 'COOLDOWN' = 'IDLE';
    public lastActionTick: number = 0;
    public pendingInteraction: { action: string; targetId: string } | null = null;
    public intent?: {
        action: string;
        targetId: number | string;
        tickStarted: number;
        contextHash: string;
        coord?: { x: number; y: number; plane: number };
        abilityId?: string;
        abilityName?: string;
    };

    // Combat State (Implements CombatantState)
    public currentHp: number;
    public adrenaline: number;
    public necrosisStacks: number;
    public residualSouls: number;
    public bloodlustStacks: number; // March 2026 Melee Mechanics
    public animaCharged: boolean; // March 2026 Magic Mechanics
    public searingWindsTicksRemaining: number; // March 2026 Ranged Mechanics
    public shadowImbuedTicksRemaining: number; // March 2026 Ranged Mechanics
    
    // Necromancy Specifics
    public conjureActive: { skeleton: boolean, zombie: boolean, ghost: boolean, phantom: boolean } = {
        skeleton: false, zombie: false, ghost: false, phantom: false
    };
    public ritualState: { soulsCaptured: number, corruptionLevel: number } = {
        soulsCaptured: 0, corruptionLevel: 0
    };

    public lastCombatTick: number;
    public cooldowns: Record<string, number>;
    
    // Sovereign Action Bar (Interface 1841/1840)
    public actionBarSlots: (string | null)[] = [
        'slice', 'fury', 'cleave', null,
        'assault', 'destroy', null, null,
        'meteor_strike', 'berserk', null, null,
        null, null
    ];

    constructor(username: string = 'Sovereign') {
        this.username = username;
        // Coordinates are no longer hardcoded here; they must be hydrated from sovereign_state.json
        this.coord = { x: 0, y: 0, plane: 0 }; 
        this.x = 0;
        this.y = 0;
        this.plane = 0;
        
        this.state = {
            plane: 0,
            npcMap: new Map(),
            npcSpatialIndex: new Map(),
            objectMap: new Map(),
            varps: new Map(),
            varcs: new Map(),
            varbits: new Map(),
            players: new Map(),
            messages: []
        };
        
        // Initialize 28 empty slots
        this.inventory = Array(28).fill(null);
        this.bank = [];
        this.wallet = {};
        this.equipment = {
            [EquipmentSlot.HEAD]: null,
            [EquipmentSlot.CAPE]: null,
            [EquipmentSlot.NECK]: null,
            [EquipmentSlot.WEAPON]: null,
            [EquipmentSlot.BODY]: null,
            [EquipmentSlot.SHIELD]: null,
            [EquipmentSlot.LEGS]: null,
            [EquipmentSlot.HANDS]: null,
            [EquipmentSlot.FEET]: null,
            [EquipmentSlot.RING]: null,
            [EquipmentSlot.AMMO]: null,
            [EquipmentSlot.AURA]: null,
            [EquipmentSlot.POCKET]: null
        };
        this.skills = {};
        this.quests = { points: 0, completedCount: 0, quests: {} };
        this.achievements = { points: 0, completed: {} };
        
        this.runEnergy = 10000;
        this.lockTicks = 0;
        this.currentPath = null;

        // Combat Initialization
        this.currentHp = 1000;
        this.adrenaline = 0;
        this.necrosisStacks = 0;
        this.residualSouls = 0;
        this.bloodlustStacks = 0;
        this.animaCharged = false;
        this.searingWindsTicksRemaining = 0;
        this.shadowImbuedTicksRemaining = 0;
        this.lastCombatTick = 0;
        this.cooldowns = {};
        
        this.combatEngine = new AdrenalineStateMachine('MELEE');
        this.combatEngine.on(event => {
            if (event.type === 'ADRENALINE_CHANGED') {
                this.adrenaline = event.to;
                this.emit('adrenaline_changed', { from: event.from, to: event.to });
            } else if (event.type === 'ABILITY_USED') {
                this.emit('ability_used', { ability: event.ability, damage: event.damage });
            }
        });
        
        this.initializeDefaultSkills();
    }

    /**
     * serializeState - Encodes the complete avatar state into a compact string.
     */
    public serializeState(): string {
        return JSON.stringify({
            coord: this.coord,
            inventory: this.inventory,
            skills: this.skills,
            quests: this.quests,
            achievements: this.achievements,
            wallet: this.wallet,
            equipment: this.equipment,
            bank: this.bank
        });
    }

    /**
     * injectState - Decodes and hydrates the avatar from a serialized state string.
     */
    public injectState(stateString: string): void {
        try {
            const data = JSON.parse(stateString);
            if (data.coord) {
                this.coord = data.coord;
                this.x = data.coord.x;
                this.y = data.coord.y;
                this.plane = data.coord.plane;
            }
            if (data.inventory) this.inventory = data.inventory;
            if (data.skills) this.skills = data.skills;
            if (data.quests) this.quests = data.quests;
            if (data.achievements) this.achievements = data.achievements;
            if (data.wallet) this.wallet = data.wallet;
            if (data.equipment) this.equipment = data.equipment;
            if (data.bank) this.bank = data.bank;
        } catch (e) {
            console.error('Failed to inject state:', e);
        }
    }
    
    public updateMorphology(state: any): void {
        if (state && state.morphology) {
            this.visualState.morphology = JSON.parse(JSON.stringify(state.morphology));
        }
    }

    /**
     * hydrate - Inject authoritative substrate data into the avatar.
     * This allows loading from public manifests like sovereign_entity_player.json.
     */
    public hydrate(data: any) {
        if (data.entity) {
            this.id = data.entity.npcId ?? this.id;
            this.name = data.entity.name ?? this.name;
            this.metadata.entityDefinition = data.entity;
        }
        if (data.geometry) {
            this.metadata.geometry = data.geometry;
        }
        if (data.skeleton) {
            this.metadata.skeleton = data.skeleton;
        }
        if (data.kinematics) {
            this.metadata.kinematics = data.kinematics;
        }
        
        // Mark Era transition
        if (this.appearanceEra === 'pre_avatar') {
            this.appearanceEra = 'transitional';
        }
    }

    public get maxHp(): number {
        const conSkill = this.skills[6]; // SkillId.CONSTITUTION = 6
        return (conSkill?.level || 10) * 100;
    }

    public get isDead(): boolean {
        return this.currentHp <= 0;
    }

    /**
     * applyDamage - Side-effect free HP reduction.
     * Higher level limbs handle death events.
     */
    public applyDamage(amount: number) {
        this.currentHp = Math.max(0, this.currentHp - amount);
    }

    public heal(amount: number) {
        this.currentHp = Math.min(this.maxHp, this.currentHp + amount);
    }

    /**
     * authenticDie - Selection of 3 most valuable items to keep.
     * Everything else is marked for dropping (Authentic Rule).
     */
    public authenticDie(): Item[] {
        const dropped: Item[] = [];
        
        // 1. Combine inventory and equipment
        const allItems: Item[] = [
            ...this.inventory.filter((i): i is Item => i !== null),
            ...Object.values(this.equipment).filter((i): i is Item => i !== null)
        ];

        // 2. Placeholder Valuer (Simple sort by ID for now, or just keep first 3)
        // Authentic: Keeps 3 most valuable. 
        // For grounding, we'll keep the first 3 items in the list.
        const sorted = allItems; // TODO: Implement ItemValue lookup from cache
        const kept = sorted.slice(0, 3);
        const toDrop = sorted.slice(3);

        // 3. Clear Inventory & Equipment
        this.inventory = this.inventory.map((item, idx) => idx < 3 ? item : null);
        Object.keys(this.equipment).forEach(slot => {
             this.setEquipmentSlot(slot as any, null);
        });

        this.lastDeathCoord = { ...this.coord };
        return toDrop;
    }

    public respawn() {
        // Map Hub Names to Anchors
        const hubs: Record<string, Coord> = {
            'Lumbridge': { x: 3138, y: 3202, plane: 0 },
            'Edgeville': { x: 3087, y: 3496, plane: 0 }
        };

        const target = hubs[this.lastHub] || hubs['Lumbridge'];
        this.coord = { ...target };
        this.x = target.x;
        this.y = target.y;
        this.plane = target.plane;
        this.heal(this.maxHp);
        this.currentHp = this.maxHp;
        this.lock(10); // Respawn daze
    }

    /**
     * adrenalinePercent - Returns the current adrenaline as a formatted string (e.g. "9.00%")
     */
    public get adrenalinePercent(): string {
        return ((this.adrenaline || 0) / 100).toFixed(2) + '%';
    }

    /**
     * addAdrenaline - Safely adds adrenaline with 100% (10000) clamping.
     */
    public addAdrenaline(amount: number) {
        this.adrenaline = Math.min(10000, (this.adrenaline || 0) + amount);
    }

    /**
     * consumeAdrenaline - Safely subtracts adrenaline, returning true if successful.
     */
    public consumeAdrenaline(amount: number): boolean {
        if ((this.adrenaline || 0) >= amount) {
            this.adrenaline = (this.adrenaline || 0) - amount;
            return true;
        }
        return false;
    }

    /**
     * executeAbility - Queues an ability intent for the SimulationHarness combat rotation engine to process.
     * The actual execution, damage calculation, and adrenaline mutation occurs during the 600ms tick.
     */
    public executeAbility(abilityId: string, targetId: number | string = 'Sovereign') {
        if (this.isBusy()) return false;
        
        this.intent = {
            action: 'execute_ability',
            targetId: targetId,
            abilityId: abilityId,
            tickStarted: 0,
            contextHash: `ability_${abilityId}_${Date.now()}`
        } as any;
        
        return true;
    }

    /**
     * setEquipmentSlot - Authoritative equipment update with viewport notification.
     */
    public setEquipmentSlot(slot: EquipmentSlot, item: Item | null) {
        const old = this.equipment[slot];
        this.equipment[slot] = item;
        this.emit('equipment_swap', {
            slot,
            oldId: old?.id ?? null,
            newId: item?.id ?? null
        });
    }

    private initializeDefaultSkills() {
        Object.values(SkillId).filter(v => typeof v === 'number').forEach(id => {
            const skillId = id as number;
            // ID 31 (Quest point) is not a skill with levels
            if (skillId === SkillId.QUEST_POINT) return;

            const name = SkillId[skillId];
            this.skills[skillId] = {
                id: skillId,
                name: name,
                level: skillId === SkillId.CONSTITUTION ? 10 : 1,
                xp: skillId === SkillId.CONSTITUTION ? 1154 : 0
            };
        });
    }


    /**
     * Finds the first empty slot in the 28-slot inventory.
     */
    public firstEmptySlot(): number {
        return this.inventory.findIndex(item => item === null);
    }

    /**
     * Adds an item to the inventory if space permits.
     */
    public addItem(item: Item): boolean {
        const slot = this.firstEmptySlot();
        if (slot === -1) return false;
        this.inventory[slot] = item;
        return true;
    }

    /**
     * Removes an item (relief of inventory) when banking or equipping.
     */
    public removeItem(slot: number): Item | null {
        if (slot < 0 || slot >= 28) return null;
        const item = this.inventory[slot];
        this.inventory[slot] = null;
        return item;
    }

    /**
     * Reads a varbit. If unset, returns 0.
     */
    public getVarbit(id: number): number {
        return this.state.varbits.get(id) ?? 0;
    }

    /**
     * Sets a varbit, triggering any necessary state checks.
     */
    public setVarbit(id: number, value: number) {
        this.state.varbits.set(id, value);
    }

    /**
     * Attempts to traverse to a target coordinate using the Quaternary Pathfinder.
     */
    public plotPath(
        targetX: number, 
        targetY: number, 
        pathfinder: DirectionalPathfinder,
        context: any, // GameState
        collisionMatrix?: Map<string, any>
    ): boolean {
        const start = this.coord;
        const end = { x: targetX, y: targetY, plane: this.coord.plane };
        
        try {
            const isPlayer = true; // For now, SovereignAvatars behave as players
            const path = pathfinder.findPath(start, end, context, isPlayer);
            if (path && path.length > 0) {
                if (path[0].x === this.coord.x && path[0].y === this.coord.y) {
                    path.shift();
                }
                this.currentPath = path;
                return true;
            } else if (path && path.length === 0) {
                // Already there.
                this.currentPath = [];
                return true;
            }
        } catch (error) {
            console.error('Failed to plot path:', error);
        }
        return false;
    }

    /**
     * To be called every 600ms by the GameplaySovereigntyLimb.
     * Processes movement along currentPath.
     */
    public processTick() {
        if (this.lockTicks > 0) {
            this.lockTicks--;
            return;
        }

        if (this.currentPath && this.currentPath.length > 0) {
            const nextStep = this.currentPath.shift()!;
            this.coord = { x: nextStep.x, y: nextStep.y, plane: this.coord.plane };
            this.x = this.coord.x;
            this.y = this.coord.y;
            this.plane = this.coord.plane;
            
            if (this.currentPath.length === 0) {
                this.currentPath = null;
                // Pending interaction evaluation happens securely in the SimulationHarness
            }
        }
    }

    /**
     * Lock the avatar for X ticks (e.g., performing an animation or busy).
     */
    public lock(ticks: number) {
        this.lockTicks = Math.max(this.lockTicks, ticks);
    }

    public isBusy(): boolean {
        return this.lockTicks > 0;
    }

    /**
     * subscribe - Register for specific state change events (e.g., 'teleport', 'equipment_swap')
     */
    public subscribe(type: string, callback: (delta: any) => void): () => void {
        if (!this.subscribers.has(type)) {
            this.subscribers.set(type, new Set());
        }
        this.subscribers.get(type)!.add(callback);
        return () => this.subscribers.get(type)!.delete(callback);
    }

    /**
     * emit - Internal helper to notify subscribers and the global callback.
     */
    public emit(type: string, delta: any) {
        if (this.onStateChange) {
            this.onStateChange(type, delta);
        }
        const set = this.subscribers.get(type);
        if (set) {
            set.forEach(cb => cb(delta));
        }
    }
}

