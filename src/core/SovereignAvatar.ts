import { Coord, Direction } from './models.js';
import { DirectionalPathfinder } from '../limbs/spatial/DirectionalPathfinder.js';

export class SovereignAvatar {
    public username: string;
    public coord: Coord;
    public varbits: Map<number, number>;
    public inventory: Array<{ id: number; amount: number }>;
    public skills: Map<string, { level: number; xp: number }>;
    
    // Status Trackers
    public runEnergy: number;
    public lockTicks: number; // Ticks before they can act again
    public currentPath: Coord[] | null;

    constructor(username: string = 'Sovereign') {
        this.username = username;
        this.coord = { x: 3200, y: 3200, plane: 0 }; // Default Lumbridge-ish 
        this.varbits = new Map();
        this.inventory = [];
        this.skills = new Map();
        
        this.runEnergy = 10000; // 100.00%
        this.lockTicks = 0;
        this.currentPath = null;
        
        this.initializeDefaultSkills();
    }

    private initializeDefaultSkills() {
        const standardSkills = ["attack", "defence", "strength", "hitpoints", "ranged", "prayer", "magic", "cooking", "woodcutting", "fletching", "fishing", "firemaking", "crafting", "smithing", "mining", "herblore", "agility", "thieving", "slayer", "farming", "runecrafting", "hunter", "construction", "summoning", "dungeoneering", "divination", "invention", "archaeology", "necromancy"];
        for (const skill of standardSkills) {
            this.skills.set(skill, { level: skill === 'hitpoints' ? 10 : 1, xp: skill === 'hitpoints' ? 1154 : 0 });
        }
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
        collisionMatrix: Map<string, any>
    ): Promise<boolean> {
        const start = this.coord;
        const end = { x: targetX, y: targetY, plane: this.coord.plane };
        
        try {
            const path = await pathfinder.findPath(start, end, context);
            if (path && path.length > 0) {
                // remove the first element if it's the current coordinate
                if (path[0].x === this.coord.x && path[0].y === this.coord.y) {
                    path.shift();
                }
                this.currentPath = path;
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

        // Handle path traversal
        if (this.currentPath && this.currentPath.length > 0) {
            // Player walks 1 tile per tick, or 2 if running. 
            // For now, simple 1 tile walk per tick.
            const nextStep = this.currentPath.shift()!;
            this.coord = { x: nextStep.x, y: nextStep.y, plane: this.coord.plane };
            
            if (this.currentPath.length === 0) {
                this.currentPath = null;
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
