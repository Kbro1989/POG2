import * as path from 'path';
import { Result, ok, err } from '../../core/models.js';
import type { PedagogyProfile } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";
import { TernaryRouter } from '../../routing/TernaryRouter.js';
import { VectorDB } from '../../utils/VectorDB.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getSovereignRoot } from '../../utils/SovereignPathResolver.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { rsmvBridge } from '../../utils/RSMVBridge.js';

const logger = createLogger('KinematicsLimb');

/**
 * KinematicsLimb - Motion Deconstruction & Learning
 * Responsible for parsing Archive 25 (Sequences) to understand 
 * the structure of movement and skeletal physics.
 */
export class KinematicsLimb {
    private router: TernaryRouter;
    private vectorDB: VectorDB;

    constructor(router: TernaryRouter, vectorDB: VectorDB, private readonly client: ModelClient) {
        this.router = router;
        this.vectorDB = vectorDB;
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const res = await rsmvBridge.healthCheck();
        const online = res.ok && res.value.online;
        return {
            online,
            details: `Kinematics: ${online ? 'ONLINE' : 'OFFLINE'} (Archive 25 mapped)`
        };
    }

    /**
     * Extracts a pedagogical profile for a specific animation sequence.
     * Phase 24b: Deep Kinematic Content Extraction (Frames, Spotanims, Models)
     */
    public async extractKinematics(sequenceId: number): Promise<Result<PedagogyProfile>> {
        const state = this.router.temporalState;
        logger.info({ sequenceId, state }, 'Extracting Kinematic Profile');

        if (state === 'PAST') {
            const cached = this.vectorDB.queryLocal(`kinematic-${sequenceId}`);
            if (cached.ok && cached.value) {
                logger.info({ sequenceId }, 'Retrieved Kinematic Profile from PAST substrate.');
                return ok(cached.value.metadata as PedagogyProfile);
            }
        }

        const res = await rsmvBridge.getSequence(sequenceId);
        if (!res.ok) return err(new Error(`Kinematic extraction failed: ${res.error.message}`));

        const seq = res.value;

        const profile: PedagogyProfile = {
            id: sequenceId.toString(),
            name: `Sequence_${sequenceId}`,
            type: 'KINEMATIC',
            metrics: {
                polyCount: 0,
                vertexCount: 0,
                boneCount: 0,
                materialComplexity: 0,
                frameCount: seq.frameCount,
                durationSeconds: seq.totalDuration,
                isSkeletal: seq.isSkeletal,
                jointDensity: seq.isSkeletal ? 0.9 : 0.1
            },
            semantics: {
                role: `Animation sequence ${sequenceId}. Total frames: ${seq.frameCount}.`,
                intent: seq.isSkeletal ? 'skeletal_motion_template' : 'legacy_vertex_animation'
            },
            timestamp: Date.now()
        };

        return ok(profile);
    }

    /**
     * Binds a sequence to a semantic state for a specific narrative actor.
     */
    public async bindSequenceToState(sequenceId: number, state: string, actorId?: string): Promise<Result<any>> {
        logger.info({ sequenceId, state, actorId }, 'Binding kinematic sequence to semantic state.');

        const profileRes = await this.extractKinematics(sequenceId);
        if (!profileRes.ok) return profileRes;

        const profile = {
            ...profileRes.value,
            semantics: {
                ...profileRes.value.semantics,
                role: state.toUpperCase(),
                intent: `Bound to ${state} for actor ${actorId || 'Global'}`
            }
        };

        const substratePath = join(getSovereignRoot(), 'memory', 'pedagogy', 'kinematics.json');
        try {
            let substrate: any = { kinematics: [] };
            if (existsSync(substratePath)) {
                substrate = JSON.parse(readFileSync(substratePath, 'utf8'));
            }

            // Upsert the binding
            const index = substrate.kinematics.findIndex((k: any) => k.id === sequenceId.toString());
            if (index !== -1) {
                substrate.kinematics[index] = profile;
            } else {
                substrate.kinematics.push(profile);
            }

            // Persist to D:\sovereign\memory\pedagogy
            const fs = await import('fs');
            fs.writeFileSync(substratePath, JSON.stringify(substrate, null, 2));

            // Vectorize the principle
            const embedRes = await this.client.embed(`Kinematic sequence ${sequenceId} bound to ${state}`);
            if (embedRes.ok) {
                await this.vectorDB.addLesson({
                    id: `kinematic-${sequenceId}`,
                    text: `Kinematic sequence ${sequenceId} bound to ${state}`,
                    embedding: embedRes.value,
                    projectId: 'global',
                    domainNamespace: 'kinematics',
                    createdAt: Date.now(),
                    metadata: profile,
                    type: 'kinematic_fact'
                });
            }

            logger.info({ sequenceId, state }, 'Kinematic binding consolidated in pedagogy substrate.');
            return ok({ sequenceId, state, profile });
        } catch (e) {
            logger.error({ error: (e as Error).message }, 'Failed to persist kinematic binding.');
            return err(e instanceof Error ? e : new Error(String(e)));
        }
    }

    public close(): void {}
}
