```typescript
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
    [key: string]: unknown; // Allow for other properties not explicitly defined
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
        private readonly vectorDB: VectorDB, // Assumes VectorDB class implements the necessary methods/properties
        private readonly client: ModelClient
    ) { }

    /**
     * Performs a health check on the CognitiveEngine's dependencies.
     * @returns A promise resolving to an object indicating online status and details.
     */
    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        // Assuming VectorDB.healthCheck() is synchronous and returns the expected object.
        // If it were asynchronous, 'await' would be required.
        const vCheck = this.vectorDB.healthCheck();
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
            // Propagate the error from the embedding operation.
            // Assumes embedRes.error is of type string, as per Result<T, E = string>.
            return err(embedRes.error);
        }

        // 2. Search VectorDB for "literary_wisdom" types in the 'literary' domain
        // Assumes VectorDB has a public 'projectId' property.
        const searchRes = await this.vectorDB.searchSimilar(embedRes.value, limit, this.vectorDB.projectId || '