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

    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: 'Environment context bridge active.' };
    }
}
