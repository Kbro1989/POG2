import { Coord, Direction, Item, Skill, SkillId, Wallet, Equipment, EquipmentSlot, SovereignAvatar as ISovereignAvatar } from './models.js';
import { DirectionalPathfinder } from '../limbs/spatial/DirectionalPathfinder.js';

export class SovereignAvatar implements ISovereignAvatar {
    public username: string;
    public id: number = 0; // NPC ID 0 for player
    public name: string = 'Sovereign';
    public x: number;
    public y: number;
    public plane: number;
    public coord: Coord;
    public varbits: Map<number, number>;
    
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

    // Status Trackers
    public runEnergy: number;
    public lockTicks: number; // Ticks before they can act again
    public currentPath: Coord[] | null;
    public pendingInteraction: { action: string; targetId: string } | null = null;

    constructor(username: string = 'Sovereign') {
        this.username = username;
        this.coord = { x: 3200, y: 3200, plane: 0 }; // Default Lumbridge-ish 
        this.x = 3200;
        this.y = 3200;
        this.plane = 0;
        
        this.varbits = new Map();
        
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
        
        this.initializeDefaultSkills();
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
        return this.varbits.get(id) ?? 0;
    }

    /**
     * Sets a varbit, triggering any necessary state checks.
     */
    public setVarbit(id: number, value: number) {
        this.varbits.set(id, value);
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

