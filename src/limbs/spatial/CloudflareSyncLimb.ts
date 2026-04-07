import { createLogger } from '../../utils/logger.js';

const logger = createLogger('CloudflareSyncLimb');

export interface VisualStateOverride {
    modelId: string;
    colorModHex: string;
}

/**
 * CloudflareSyncLimb acts as the Neurological Bridge.
 * It transmits exact-matching POG2 game-states (varbits, state transitions) 
 * directly to the edge deployment / KV stores to visually mutate the loaded 3D dashboard.
 */
export class CloudflareSyncLimb {
    private endpoint: string;

    constructor(edgeUrl: string = 'http://127.0.0.1:8787') {
        this.endpoint = edgeUrl;
    }

    /**
     * Pushes a direct visual override to the 3D dashboard.
     */
    public async postVisualState(override: VisualStateOverride): Promise<boolean> {
        try {
            const res = await fetch(`${this.endpoint}/api/modifications`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(override)
            });

            if (!res.ok) {
                logger.warn({ status: res.status }, `Failed to sync visual state for model ${override.modelId}`);
                return false;
            }

            logger.info({ override }, `Cloudflare Edge sync successful for model ${override.modelId}`);
            return true;
        } catch (error) {
            logger.error({ error }, 'Cloudflare Worker is offline or unreachable. Is wrangler dev running?');
            return false;
        }
    }

    /**
     * Listens to exact-matching state transitions from the JsonLogicInterpreter
     * and maps semantic states to aesthetic 3D colors on the edge dashboard.
     */
    public async broadcastStateTransition(logicName: string, stateName: string): Promise<void> {
        logger.info(`Broadcasting logical state transition [${logicName} -> ${stateName}] to Edge...`);
        
        let colorHex = '#ffffff'; // Default neutral

        // EXACT MATCHING COLOR THEORIES
        // Since we currently have KBD geometries loaded, we map logic states to its visual aura.
        if (stateName.toLowerCase().includes('enraged') || stateName.toLowerCase().includes('combat')) {
            colorHex = '#ff1100'; // Aggressive Red
        } else if (stateName.toLowerCase().includes('shield')) {
            colorHex = '#00f7ff'; // Protective Cyan
        } else if (stateName.toLowerCase().includes('poison') || stateName.toLowerCase().includes('disease')) {
            colorHex = '#1eff00'; // Toxic Green
        } else if (stateName.toLowerCase().includes('amlodd') || stateName.toLowerCase().includes('shadow')) {
            colorHex = '#8400ff'; // Shadow Magic Purple
        } else if (stateName.toLowerCase().includes('cadarn')) {
            colorHex = '#ffbb00'; // Ranged/Melee Bronze
        } else if (stateName.toLowerCase().includes('rest')) {
            colorHex = '#4a6b8c'; // Dormant Blue
        }

        // We arbitrarily target the primary KBD geometry for this proof-of-concept
        // In a fully meshed system, `logicName` would map directly to `modelId`.
        const bridgeModel = 'kbd_native_single';

        await this.postVisualState({
            modelId: bridgeModel,
            colorModHex: colorHex
        });
    }
}
