import { Coord, NPC, CombatantState, Item, Skill, SkillId, Wallet, Equipment, EquipmentSlot, GameState, SovereignAvatar as ISovereignAvatar } from './models.js';
import { DirectionalPathfinder } from '../limbs/spatial/DirectionalPathfinder.js';

export class SovereignAvatarEntity implements NPC, CombatantState, ISovereignAvatar {
    public id: number = -1; // Local player ID proxy
    public name: string = 'Sovereign';
    public username: string;
    public x: number;
    public y: number;
    public plane: number;
    public coord: Coord;
    public metadata: Record<string, any> = {};
    
    // Global State Bus (Phase 11)
    public state: GameState;
    
    // Persistent Organism State
    public inventory: (Item | null)[]; // Fixed 28 slots
    public bank: Item[];
    public wallet: Wallet;
    public equipment: Equipment;
    public skills: Record<number, Skill>;
    public quests: { points: number; completedCount: number; quests: Record<number, any> }; // QuestState
    
    public appearance?: {
        bodyColors: [number, number][];
        gender: 'male' | 'female';
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
    };

    // Combat State (Implements CombatantState)
    public currentHp: number;
    public adrenaline: number;
    public necrosisStacks: number;
    public residualSouls: number;
    public lastCombatTick: number;
    public cooldowns: Record<string, number>;

    constructor(username: string = 'Sovereign') {
        this.username = username;
        // Lumbridge Anchor: Region 49,50 (3138, 3202)
        this.coord = { x: 3138, y: 3202, plane: 0 }; 
        this.x = 3138;
        this.y = 3202;
        this.plane = 0;
        
        this.state = {
            plane: 0,
            npcMap: new Map(),
            npcSpatialIndex: new Map(),
            objectMap: new Map(),
            varps: new Map(),
            varcs: new Map(),
            varbits: new Map(),
            players: new Map()
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
        
        this.runEnergy = 10000; // 100.00%
        this.lockTicks = 0;
        this.currentPath = null;

        // Combat Initialization
        this.currentHp = 1000; // Default until initializeDefaultSkills runs
        this.adrenaline = 0;
        this.necrosisStacks = 0;
        this.residualSouls = 0;
        this.lastCombatTick = 0;
        this.cooldowns = {};
        
        this.initializeDefaultSkills();
        this.currentHp = this.maxHp; // Refine to actual grounded max
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
             this.equipment[slot] = null;
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
    public async plotPath(
        targetX: number, 
        targetY: number, 
        pathfinder: DirectionalPathfinder,
        context: any, // GameState
        collisionMatrix?: Map<string, any>
    ): Promise<boolean> {
        const start = this.coord;
        const end = { x: targetX, y: targetY, plane: this.coord.plane };
        
        try {
            const path = await pathfinder.findPath(start, end, context);
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
}

