import { type Result, ok } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('EnvironmentLimb');

/**
 * EnvironmentLimb - OS Context Bridge
 * Ingests OS environment variables and system context into the cognitive map.
 */
export class EnvironmentLimb {
    constructor() { }

    /**
     * getContext - Retrieves specific OS/ENV context.
     */
    public async getContext(key: string): Promise<Result<string | undefined>> {
        logger.info({ key }, 'Querying system environment substrate...');
        return ok(process.env[key]);
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        // Probe critical substrate variables
        const home = process.env.HOME || process.env.USERPROFILE;
        const online = !!home;
        return {
            online,
            details: `Environment: ${online ? 'ONLINE' : 'DEGRADED'} (Substrate root: ${home || 'UNKNOWN'})`
        };
    }
}

