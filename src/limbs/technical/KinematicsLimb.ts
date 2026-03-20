import { Result, ok, err } from '../../core/models.js';
import type { PedagogyProfile } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";
import { GameCacheLoader } from '../../../tmp_rsmv_inspect/src/cache/sqlite.js';
import { parse } from '../../../tmp_rsmv_inspect/src/opdecoder.js';
import { cacheMajors } from '../../../tmp_rsmv_inspect/src/constants.js';

import { TernaryRouter } from '../../routing/TernaryRouter.js';
import { VectorDB } from '../../utils/VectorDB.js';

const logger = createLogger('KinematicsLimb');

/**
 * KinematicsLimb - Motion Deconstruction & Learning
 * Responsible for parsing Archive 25 (Sequences) to understand 
 * the structure of movement and skeletal physics.
 */
export class KinematicsLimb {
    private loader: GameCacheLoader;
    private router: TernaryRouter;
    private vectorDB: VectorDB;

    constructor(router: TernaryRouter, vectorDB: VectorDB) {
        this.loader = new GameCacheLoader();
        this.router = router;
        this.vectorDB = vectorDB;
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const loaderHealth = !!this.loader;
        return {
            online: loaderHealth,
            details: `Kinematics: ${loaderHealth ? 'ONLINE' : 'OFFLINE'} (Archive 25 mapped)`
        };
    }

    /**
     * Extracts a pedagogical profile for a specific animation sequence.
     */
    public async extractKinematics(sequenceId: number): Promise<Result<PedagogyProfile>> {
        const state = this.router.temporalState;
        logger.info({ sequenceId, state }, 'Extracting Kinematic Profile');

        if (state === 'PAST') {
            // Use cached vector embeddings (offline/Ghost mode)
            const cached = this.vectorDB.queryLocal(`kinematic-${sequenceId}`);
            if (cached.ok && cached.value) {
                logger.info({ sequenceId }, 'Retrieved Kinematic Profile from PAST substrate.');
                return ok(cached.value.metadata as PedagogyProfile);
            }
        }

        try {
            const buffer = await this.loader.getFile(cacheMajors.sequences, sequenceId);
            if (!buffer) return err(new Error(`Sequence ${sequenceId} not found in cache.`));

            const sequence = parse.sequences.read(buffer, this.loader);
            
            // Calculate metrics
            const frameCount = sequence.frames?.length || 0;
            let totalDuration = 0;
            const uniqueBones = new Set<number>();

            if (sequence.frames) {
                for (const frame of sequence.frames) {
                    totalDuration += (frame.framelength || 0) * 0.020; // 20ms steps
                }
            }

            // Note: In RS3, sequences reference Archive 0 frames or Archive 57/58/59 skeletons.
            // We'll perform a shallow check for now.
            const isSkeletal = sequence.skeletal_animation !== undefined;

            const profile: PedagogyProfile = {
                id: sequenceId.toString(),
                name: `Sequence_${sequenceId}`,
                type: 'KINEMATIC',
                metrics: {
                    polyCount: 0, // Animations don't have polys directly
                    vertexCount: 0,
                    boneCount: isSkeletal ? 100 : 20, // Heuristic or deep scan needed
                    materialComplexity: 0,
                    frameCount,
                    durationSeconds: parseFloat(totalDuration.toFixed(3)),
                    isSkeletal,
                    jointDensity: 0 // Deep skeletal scan would go here
                },
                semantics: {
                    role: `Animation sequence ${sequenceId}. Total frames: ${frameCount}.`,
                    intent: isSkeletal ? 'skeletal_motion_template' : 'legacy_vertex_animation'
                },
                timestamp: Date.now()
            };

            return ok(profile);
        } catch (e) {
            logger.error({ sequenceId, error: (e as Error).message }, 'Kinematic extraction failed');
            return err(new Error(`Kinematic extraction failed: ${(e as Error).message}`));
        }
    }

    public close(): void {
        this.loader.close();
    }
}
