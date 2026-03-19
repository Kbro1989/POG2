import { Result, ok, err } from '../../core/models.js';
import type { PedagogyProfile } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";
import { GameCacheLoader } from '../../../tmp_rsmv_inspect/src/cache/sqlite.js';
import { parse } from '../../../tmp_rsmv_inspect/src/opdecoder.js';
import { cacheMajors } from '../../../tmp_rsmv_inspect/src/constants.js';

const logger = createLogger('DynamicsLimb');

/**
 * DynamicsLimb - World Effect & Particle Deconstruction
 * Responsible for parsing Archive 21 (SpotAnims) to understand
 * how temporary 3D effects are orchestrated.
 */
export class DynamicsLimb {
    private loader: GameCacheLoader;

    constructor() {
        this.loader = new GameCacheLoader();
    }

    /**
     * Extracts a pedagogical profile for a specific world effect (SpotAnim).
     */
    public async extractDynamics(spotAnimId: number): Promise<Result<PedagogyProfile>> {
        logger.info({ spotAnimId }, 'Extracting Dynamic Profile');

        try {
            const buffer = await this.loader.getFile(cacheMajors.spotanims, spotAnimId);
            if (!buffer) return err(new Error(`SpotAnim ${spotAnimId} not found in cache.`));

            const spotAnim = parse.spotAnims.read(buffer, this.loader);

            const profile: PedagogyProfile = {
                id: spotAnimId.toString(),
                name: `SpotAnim_${spotAnimId}`,
                type: 'DYNAMIC',
                metrics: {
                    polyCount: 0, // Indirect (via modelId)
                    vertexCount: 0,
                    boneCount: 0, // Indirect (via animationId)
                    materialComplexity: spotAnim.replace_materials?.length || 0,
                    rigLogic: spotAnim.sequence ? 'SKELETAL' : 'STATIC'
                },
                semantics: {
                    role: `Dynamic world effect link. Mesh: ${spotAnim.model}. Sequence: ${spotAnim.sequence}.`,
                    intent: 'world_event_particle_template'
                },
                timestamp: Date.now()
            };

            return ok(profile);
        } catch (e) {
            logger.error({ spotAnimId, error: (e as Error).message }, 'Dynamic extraction failed');
            return err(new Error(`Dynamic extraction failed: ${(e as Error).message}`));
        }
    }

    public close(): void {
        this.loader.close();
    }
}
