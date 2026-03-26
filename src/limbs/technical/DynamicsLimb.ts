import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const {  GameCacheLoader  } = require("../../../rsmv/src/cache/sqlite.js");
const {  parse  } = require("../../../rsmv/src/opdecoder.js");
const {  cacheMajors  } = require("../../../rsmv/src/constants.js");
import { Result, ok, err } from '../../core/models.js';
import type { PedagogyProfile } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";

import { TernaryRouter } from '../../routing/TernaryRouter.js';
import { VectorDB } from '../../utils/VectorDB.js';
import { ModelClient } from '../../clients/ModelClient.js';

const logger = createLogger('DynamicsLimb');

/**
 * DynamicsLimb - World Effect & Particle Deconstruction
 */
export class DynamicsLimb {
    private loader: any;
    private router: TernaryRouter;
    private vectorDB: VectorDB;

    constructor(router: TernaryRouter, vectorDB: VectorDB, private readonly client: ModelClient) {
        this.loader = new GameCacheLoader();
        this.router = router;
        this.vectorDB = vectorDB;
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const loaderHealth = !!this.loader;
        return {
            online: loaderHealth,
            details: `Dynamics: ${loaderHealth ? 'ONLINE' : 'OFFLINE'} (Archive 21 mapped)`
        };
    }

    public async extractDynamics(spotAnimId: number): Promise<Result<PedagogyProfile>> {
        const state = this.router.temporalState;
        logger.info({ spotAnimId, state }, 'Extracting Dynamic Profile');

        if (state === 'PAST') {
            const cached = this.vectorDB.queryLocal(`dynamic-${spotAnimId}`);
            if (cached.ok && cached.value) {
                return ok(cached.value.metadata as PedagogyProfile);
            }
        }

        try {
            const buffer = await this.loader.getFile(cacheMajors.spotanims, spotAnimId);
            if (!buffer) return err(new Error(`SpotAnim ${spotAnimId} not found in cache.`));

            const spotAnim = (parse as any).spotAnims.read(buffer, this.loader);

            const profile: PedagogyProfile = {
                id: spotAnimId.toString(),
                name: `SpotAnim_${spotAnimId}`,
                type: 'DYNAMIC',
                metrics: {
                    polyCount: 0,
                    vertexCount: 0,
                    boneCount: 0,
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
        if (this.loader && typeof this.loader.close === 'function') {
            this.loader.close();
        }
    }
}
