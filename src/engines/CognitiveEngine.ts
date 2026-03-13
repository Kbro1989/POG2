import { type Result, type Lesson, ok, YaoState } from '../core/models.js';
import { VectorDB } from '../utils/VectorDB.js';
import { ModelClient } from '../clients/ModelClient.js';
import pino from 'pino';

const logger = pino({ name: 'CognitiveEngine', base: { hostname: 'POG2' } });

export interface PersonalityArchetype {
    name: string;
    weight: number;
    description: string;
    influence: string;
}

/**
 * CognitiveEngine
 * 
 * Manages the activation of literary wisdom into POG2's personality and thoughts.
 * Bridges the gap between passive memory (VectorDB) and active metabolism (MetabolicEngine).
 */
export class CognitiveEngine {
    constructor(
        private readonly vectorDB: VectorDB,
        private readonly client: ModelClient
    ) { }

    public healthCheck(): { online: boolean; details?: string } {
        return { online: true };
    }

    /**
     * getActiveWisdom - Retrieves wisdom fragments relevant to a specific task.
     */
    public async getActiveWisdom(task: string, limit = 3): Promise<Result<string>> {
        logger.info({ task }, 'Synthesizing literary wisdom for task-specific cognition');

        // 1. Generate embedding for the specific task
        const embedRes = await this.client.embed(task);
        if (!embedRes.ok) return embedRes as any;

        // 2. Search VectorDB for "literary_wisdom" types in the 'literary' domain
        const searchRes = await this.vectorDB.searchSimilar(embedRes.value, limit, (this.vectorDB as any).projectId || 'global', 'literary');
        if (!searchRes.ok) return searchRes as any;

        const wisdom = searchRes.value
            .filter(l => l.type === 'literary_wisdom')
            .map(l => {
                const meta = l.metadata as any;
                return `[From "${meta.title}" by ${meta.author}]: ${l.text}\nREFLECTION: ${meta.reflection || 'N/A'}`;
            })
            .join('\n\n');

        return ok(wisdom || 'No specific literary wisdom activated for this substrate query.');
    }

    /**
     * getPersonalityCore - Summarizes the AI's current "personality" based on ingested influences.
     */
    public async getPersonalityCore(): Promise<Result<PersonalityArchetype[]>> {
        // Query the database for a summary of influencers
        // This is a simplified implementation; in a full version, this would be a metadata aggregation.
        const res = await (this.vectorDB as any).db.prepare(`
            SELECT 
                json_extract(metadata, '$.author') as author,
                COUNT(*) as weight
            FROM lessons 
            WHERE type = 'literary_wisdom'
            GROUP BY author
            ORDER BY weight DESC
            LIMIT 5
        `).all();

        const archetypes: PersonalityArchetype[] = res.map((r: any) => ({
            name: r.author || 'Anonymous',
            weight: r.weight,
            description: `A systematic influence derived from ${r.weight} absorbed fragments.`,
            influence: 'DIRECT'
        }));

        return ok(archetypes);
    }
}
