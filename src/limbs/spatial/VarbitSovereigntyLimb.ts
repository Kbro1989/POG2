import { GameState } from '../../core/models.js';
import { WorldForensicsLimb } from './WorldForensicsLimb.js';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('VarbitSovereigntyLimb');

/**
 * VarbitSovereigntyLimb - Neural Link for dynamic game state.
 * Resolves which state (models/collisions) of an object is currently manifested.
 */
export class VarbitSovereigntyLimb {
    private static instance: VarbitSovereigntyLimb;
    private forensics: WorldForensicsLimb;

    private constructor() {
        this.forensics = new WorldForensicsLimb();
    }

    public static getInstance(): VarbitSovereigntyLimb {
        if (!VarbitSovereigntyLimb.instance) {
            VarbitSovereigntyLimb.instance = new VarbitSovereigntyLimb();
        }
        return VarbitSovereigntyLimb.instance;
    }

    public async initialize(): Promise<void> {
        await this.forensics.initialize();
    }

    /**
     * resolveCurrentObjectId - Returns the active ObjectId based on current GameState.
     */
    public async resolveCurrentObjectId(originalId: number, gameState: GameState): Promise<number> {
        const def = await this.forensics.getObjectDefinition(originalId);

        if (!def.transforms || def.transforms.length === 0) {
            return originalId;
        }

        let index = -1;
        if (def.varbitId !== undefined && def.varbitId !== -1) {
            // Varbit takes precedence
            const value = gameState.varbits.get(def.varbitId) || 0;
            index = value;
        } else if (def.varpId !== undefined && def.varpId !== -1) {
            // Varp fallback
            const value = gameState.varbits.get(def.varpId) || 0; // In this system, varps are stored in the same map
            index = value;
        }

        if (index >= 0 && index < def.transforms.length) {
            const transformedId = def.transforms[index];
            if (transformedId !== -1) {
                return transformedId;
            }
        }

        return def.defaultTransformId !== undefined && def.defaultTransformId !== -1 
            ? def.defaultTransformId 
            : originalId;
    }

    public getForensics(): WorldForensicsLimb {
        return this.forensics;
    }
}
