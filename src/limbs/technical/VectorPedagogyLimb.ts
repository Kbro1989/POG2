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

    public async ingestProfile(profile: PedagogyProfile): Promise<Result<void>> {
        logger.info({ id: profile.id, name: profile.name }, 'Synthesizing Generative Game Design Principle for VectorDB');

        try {
            // 1. Create a semantic description of the raw cache profile
            const rawDescription = this.createSemanticDescription(profile);
            const hash = createHash('sha256').update(JSON.stringify(profile)).digest('hex');

            // 2. Synthesize Generative Wisdom (AI Game Creator Mode)
            const synthPrompt = `
You are POG2, an autonomous Sovereign Game & Movie Creation AI.
Analyze the following topological data extracted from an old MMO cache. 
Do NOT just repeat the data. Abstract it into a profound, universal Game Design or Cinematic Principle that will guide you when creating completely NEW, original game engines, NPCs, mechanics, and 3D movies.

Raw Substrate Data:
Name: ${profile.name} (Type: ${profile.type})
Metrics: ${JSON.stringify(profile.metrics)}
Lore/Semantics: ${JSON.stringify(profile.semantics)}

Return ONLY a concise, profound generative principle (1-3 sentences) on how this archetype, polygon density, skeletal structure, or contextual intent should scale and be utilized in modern game and cinematic development.
            `.trim();

            const aiRes = await this.client.call({
                model: this.client.config.orchestratorModel,
                prompt: synthPrompt,
                systemPrompt: 'You are an advanced Game and Cinema Architecture AI. Synthesize profound design wisdom from raw topological data.',
                temperature: 0.6
            });

            const profoundLesson = aiRes.ok ? aiRes.value.response.trim() : rawDescription;
            const finalText = `[GENERALIZED GAME/CINEMA DESIGN PRINCIPLE] Origin Anchor: ${profile.name} (${profile.type})\n\n${profoundLesson}\n\n[Raw Topological Foundation]: ${rawDescription}`;

            // 3. Generate embedding via ModelClient based on the synthetic wisdom
            const embedRes = await this.client.embed(finalText);
            if (!embedRes.ok) return err(new Error(`Embedding failed for profile ${profile.id}: ${embedRes.error.message}`));

            // 4. Store as a Master Generative Lesson in D:\sovereign
            const lessonRes = this.vectorDb.addLesson({
                id: `pedagogy-${profile.type}-${profile.id}-${Date.now()}`,
                text: finalText,
                embedding: embedRes.value,
                projectId: 'global-generative-engine',
                domainNamespace: 'game-design-pedagogy',
                createdAt: Date.now(),
                metadata: profile,
                hash: hash,
                type: 'generative_design_principle' // Evolved from standard 'pedagogy_profile'
            });

            if (!lessonRes.ok) return lessonRes;

            logger.info({ id: profile.id }, 'Successfully vectorized sovereign generative logic.');
            return ok(undefined);
        } catch (e) {
            logger.error({ error: (e as Error).message }, 'Generative logic ingestion failed.');
            return err(new Error(`Generative logic ingestion failed: ${(e as Error).message}`));
        }
    }

    private createSemanticDescription(profile: PedagogyProfile): string {
        const m = profile.metrics;
        const s = profile.semantics;

        let desc = `3D Pedagogy Profile for ${profile.name} (${profile.type}). `;
        desc += `Classification: ${s.intent}. Role: ${s.role}. `;
        if (s.race) desc += `Race: ${s.race}. `;
        if (s.wikiLore) desc += `Lore Context: ${s.wikiLore}. `;

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
