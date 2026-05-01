import { type Result, type Lesson, ok, err } from '../core/models.js';
import { VectorDB } from '../utils/VectorDB.js';
import { ModelClient } from '../clients/ModelClient.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('CognitiveEngine');

export interface PersonalityArchetype {
    name: string;
    weight: number;
    description: string;
    influence: string;
}

/**
 * Defines the expected structure for metadata of 'literary_wisdom' lessons.
 */
interface LiteraryWisdomMetadata {
    title?: string;
    author?: string;
    reflection?: string;
    [key: string]: unknown;
}

/**
 * Defines the expected row structure returned by the SQL query in getPersonalityCore.
 */
interface PersonalityRow {
    author: string | null;
    weight: number;
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

    /**
     * Performs a health check on the CognitiveEngine's dependencies.
     * @returns A promise resolving to an object indicating online status and details.
     */
    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const vCheck = (this.vectorDB as any).healthCheck();
        const cCheck = await this.client.healthCheck();
        const isOnline = vCheck.online && cCheck.online;
        return {
            online: isOnline,
            details: `Cognitive: ${isOnline ? 'ONLINE' : 'DEGRADED'} (Vector: ${vCheck.details}, Client: ${cCheck.details})`
        };
    }

    /**
     * getActiveWisdom - Retrieves wisdom fragments relevant to a specific task.
     * @param task The task for which to synthesize wisdom.
     * @param limit The maximum number of wisdom fragments to retrieve.
     * @returns A Result containing the synthesized wisdom string or an error.
     */
    public async getActiveWisdom(task: string, limit = 3): Promise<Result<string>> {
        logger.info({ task }, 'Synthesizing literary wisdom for task-specific cognition');

        // 1. Generate embedding for the specific task
        const embedRes = await this.client.embed(task);
        if (!embedRes.ok) {
            return err(embedRes.error);
        }

        // 2. Search VectorDB for relevant wisdom
        const projectId = (this.vectorDB as any).projectId || 'literary';
        const searchRes = await (this.vectorDB as any).searchSimilar(embedRes.value, limit, projectId);
        if (!searchRes.ok) {
            return err(searchRes.error);
        }

        const lessons: Lesson[] = searchRes.value;
        if (lessons.length === 0) {
            return ok('No relevant wisdom fragments found in literary substrate.');
        }

        // 3. Synthesize into a readable wisdom string
        const wisdomFragments = lessons.map((lesson: Lesson, i: number) => {
            const meta = (lesson.metadata || {}) as LiteraryWisdomMetadata;
            const source = meta.title
                ? `"${meta.title}"${meta.author ? ` by ${meta.author}` : ''}`
                : 'Unknown Source';
            return `[${i + 1}] ${source}: ${lesson.text}`;
        });

        return ok(wisdomFragments.join('\n\n'));
    }

    /**
     * getPersonalityCore - Derives the dominant personality archetypes from absorbed wisdom.
     * @returns A Result containing an array of PersonalityArchetype objects or an error.
     */
    public async getPersonalityCore(): Promise<Result<PersonalityArchetype[]>> {
        logger.info('Deriving personality archetypes from literary substrate');

        try {
            const db = (this.vectorDB as any).db;
            if (!db) {
                return err(new Error('VectorDB has no db instance for personality query'));
            }

            const rows: PersonalityRow[] = db.prepare(`
                SELECT metadata->>'$.author' as author, COUNT(*) as weight
                FROM lessons
                WHERE type = 'literary_wisdom'
                GROUP BY author
                ORDER BY weight DESC
                LIMIT 5
            `).all();

            const archetypes: PersonalityArchetype[] = rows
                .filter((r: PersonalityRow) => r.author)
                .map((r: PersonalityRow) => ({
                    name: r.author!,
                    weight: r.weight,
                    description: `Dominant literary influence from ${r.author}`,
                    influence: `${r.weight} absorbed passages`
                }));

            return ok(archetypes);
        } catch (e) {
            return err(e instanceof Error ? e : new Error(String(e)));
        }
    }
}
