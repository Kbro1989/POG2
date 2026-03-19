import { Result, ok, err, YaoState } from '../../core/models.js';
import type { PedagogyProfile } from '../../core/models.js';
import { createLogger } from "../../utils/logger.js";
import { VectorDB } from "../../utils/VectorDB.js";
import { ModelClient } from "../../clients/ModelClient.js";
import { createHash } from 'crypto';

const logger = createLogger('VectorPedagogyLimb');

/**
 * VectorPedagogyLimb - Sensory-to-Memory Bridge
 * Converts 3D PedagogyProfiles into Vector Lessons for semantic search.
 */
export class VectorPedagogyLimb {
    private vectorDb: VectorDB;

    constructor(private client: ModelClient) {
        this.vectorDb = new VectorDB({ client });
        const initRes = this.vectorDb.initialize();
        if (!initRes.ok) {
            logger.error({ error: initRes.error.message }, 'Failed to initialize VectorDB Substrate.');
        } else {
            logger.info('VectorPedagogyLimb initialized. Memory substrate online.');
        }
    }

    /**
     * Ingests a PedagogyProfile into the VectorDB.
     */
    public async ingestProfile(profile: PedagogyProfile): Promise<Result<void>> {
        logger.info({ id: profile.id, name: profile.name }, 'Ingesting Pedagogy Profile into VectorDB');

        try {
            // 1. Create a semantic description of the profile for embedding
            const text = this.createSemanticDescription(profile);
            const hash = createHash('sha256').update(JSON.stringify(profile)).digest('hex');

            // 2. Generate embedding via ModelClient
            const embedRes = await this.client.embed(text);
            if (!embedRes.ok) return err(new Error(`Embedding failed for profile ${profile.id}: ${embedRes.error.message}`));

            // 3. Store as a Lesson in D:\sovereign
            const lessonRes = this.vectorDb.addLesson({
                id: `pedagogy-${profile.type}-${profile.id}`,
                text: text,
                embedding: embedRes.value,
                projectId: 'rsmv-learning',
                domainNamespace: '3d-pedagogy',
                createdAt: Date.now(),
                metadata: profile,
                hash: hash,
                type: 'pedagogy_profile'
            });

            if (!lessonRes.ok) return lessonRes;

            logger.info({ id: profile.id }, 'Successfully vectorized pedagogy profile.');
            return ok(undefined);
        } catch (e) {
            logger.error({ error: (e as Error).message }, 'Vector ingestion failed.');
            return err(new Error(`Vector ingestion failed: ${(e as Error).message}`));
        }
    }

    private createSemanticDescription(profile: PedagogyProfile): string {
        const m = profile.metrics;
        const s = profile.semantics;
        
        let desc = `3D Pedagogy Profile for ${profile.name} (${profile.type}). `;
        desc += `Classification: ${s.intent}. Role: ${s.role}. `;
        
        if (profile.type === 'KINEMATIC') {
            desc += `Kinematic metrics: ${m.frameCount} frames, total duration ${m.durationSeconds}s. `;
            desc += `Technical: ${m.isSkeletal ? 'Skeletal-based' : 'Vertex-based'} movement. Bone density affected: ${m.jointDensity || 0} joints. `;
        } else if (profile.type === 'DYNAMIC') {
            desc += `Dynamic metrics: Particle emission patterns, world effect topology. `;
        } else {
            desc += `Structural metrics: ${m.polyCount} polygons, ${m.vertexCount} vertices, ${m.boneCount} bones across ${m.topologySummary?.length || 0} component(s). `;
            desc += `Material complexity: ${m.materialComplexity} layers. `;
        }
        
        if (profile.type === 'GROUP') {
            desc += `This is a generalized template representing the "Ideal" standard for ${profile.name}. `;
        }
        
        return desc;
    }

    public close(): void {
        this.vectorDb.close();
    }
}
