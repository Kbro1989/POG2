import { ExtrasOracle } from './ExtrasOracle.js';

export interface ClueCoordinate {
    plane: number;
    x: number;
    y: number;
}

/**
 * ClueLogicLimb - Interpret bit-packed clue metadata and validate spatial requirements.
 * 
 * Provides high-fidelity logic forautonomous clue solving, 
 * interpreting packed coords and DBRow-based constraints.
 */
export class ClueLogicLimb {
    private static instance: ClueLogicLimb;
    private oracle: ExtrasOracle;

    private constructor() {
        this.oracle = ExtrasOracle.getInstance();
    }

    public static getInstance(): ClueLogicLimb {
        if (!ClueLogicLimb.instance) {
            ClueLogicLimb.instance = new ClueLogicLimb();
        }
        return ClueLogicLimb.instance;
    }

    /**
     * unpackCoordinate - Decodes the Jagex packed coordinate (Key 4682).
     * Format: plane << 28 | x << 14 | y
     */
    public unpackCoordinate(packed: number): ClueCoordinate {
        return {
            plane: (packed >> 28) & 0xF,
            x: (packed >> 14) & 0x3FFF,
            y: packed & 0x3FFF
        };
    }

    /**
     * isCorrectSpot - Validates if the given world position matches the clue target.
     * Includes "right level" checks.
     */
    public isCorrectSpot(itemId: number, currentPos: ClueCoordinate): boolean {
        const packed = this.oracle.getExtra(itemId, 4682);
        if (typeof packed !== 'number') return false;

        const target = this.unpackCoordinate(packed);
        
        // Exact match for dig/action
        const xMatch = Math.abs(currentPos.x - target.x) <= 1;
        const yMatch = Math.abs(currentPos.y - target.y) <= 1;
        const planeMatch = currentPos.plane === target.plane;

        return xMatch && yMatch && planeMatch;
    }

    /**
     * getClueType - Determines the clue difficulty/type via DBRow mapping (Key 2655).
     */
    public getClueType(itemId: number): string {
        const dbRow = this.oracle.getExtra(itemId, 2655);
        if (dbRow === 2353) return 'TREASURE_MAP';
        if (dbRow === 8792) return 'COORDINATE_CLUE';
        
        return 'UNKNOWN';
    }

    /**
     * handleAction - Execution logic for item-based actions (Key 528).
     */
    public async handleAction(itemId: number, actionName: string): Promise<string> {
        const hook = this.oracle.getActionHook(itemId);
        
        if (hook === 'Teleport') {
            return `TRANSVERSAL: Navigating to clue destination via ${actionName}.`;
        }
        
        if (hook === 'Swap clue') {
            return `MECHANICAL: Consuming globetrotter charges to reroll clue.`;
        }

        return `FORENSIC: ${actionName} initiated for item ${itemId}.`;
    }
}
