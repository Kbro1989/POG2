import {
    WorldAnchor,
    PhaseTransition,
    PortalDefinition
} from './types.js';
import { RSCDataLoader } from './RSCDataLoader.js';
import { RS3ObjectDecoder } from './RS3ObjectDecoder.js';
import { UnifiedPortalRegistry } from './UnifiedPortalRegistry.js';
import { InterfaceRuntimeLimb } from '../limbs/spatial/InterfaceRuntimeLimb.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('SovereignPortalBridge');

export class SovereignPortalBridge {
    constructor(
        private rscLoader: RSCDataLoader,
        private rs3Decoder: RS3ObjectDecoder,
        private registry: UnifiedPortalRegistry
    ) {}

    /**
     * Resolves a transition based on a world anchor and an intended action.
     * Implements the a-Sovereign "Single-Step Cross-Era" simulation model.
     */
    public async resolveTransition(
        anchor: WorldAnchor,
        action: string
    ): Promise<PhaseTransition | null> {
        logger.info(`[BRIDGE] Resolving transition for ${anchor.world} @ (${anchor.x},${anchor.y},${anchor.plane}) via action: ${action}`);

        // 1. Find portal in registry
        const portal = this.registry.find(anchor, action);
        if (!portal) {
            logger.debug(`[BRIDGE] No portal found matching anchor and action.`);
            return null;
        }

        // 2. Validate via appropriate mechanism (Sovereign Logic Gate)
        if (portal.validationScript) {
            logger.info(`[BRIDGE] Executing validation gate (Script ${portal.validationScript})...`);
            try {
                await InterfaceRuntimeLimb.getInstance().runScript(portal.validationScript);
            } catch (e: any) {
                logger.warn(`[BRIDGE] Validation failed or interpreter errored: ${e.message}. Continuing in simulation mode.`);
            }
        }

        // 3. Return resolved transition
        const transition: PhaseTransition = {
            source: anchor,
            destination: portal.destination,
            trigger: portal.triggerType,
            validation: portal.validationScript
        };

        logger.info(`[BRIDGE] Transition Resolved: ${anchor.world} → ${transition.destination.world} | Plane ${anchor.plane} → ${transition.destination.plane}`);
        return transition;
    }
}
