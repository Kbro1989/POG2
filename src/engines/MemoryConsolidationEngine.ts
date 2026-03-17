import { type Result } from '../core/models.js';
import { ModelClient } from '../clients/ModelClient.js';
import { VectorDB } from '../utils/VectorDB.js';
import { StateManager } from '../state/StateManager.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('MemoryConsolidation');

export class MemoryConsolidationEngine {
    private readonly consumedNonces = new Set<string>();

    constructor(
        private readonly client: ModelClient,
        private readonly vectorDB: VectorDB,
        private readonly state: StateManager
    ) { }

    public healthCheck(): { online: boolean; details?: string } {
        return { online: true };
    }

    public async consolidate(): Promise<Result<void>> {
        const sessionId = this.state.getSessionId();
        if (!sessionId) return { ok: false, error: new Error('No active Session ID.') };

        // 1. Fetch Raw Session Memories
        const fetchRes = this.vectorDB.getSessionLessons(sessionId);
        if (!fetchRes.ok) return fetchRes as Result<void>;

        const lessons = fetchRes.value;
        if (lessons.length < 3) {
            // Not enough data to warrant a complex structural merge
            logger.debug({ lessons: lessons.length }, 'Insufficient memory density for structural consolidation. Keeping exact references.');
            return { ok: true, value: undefined };
        }

        try {
            // 2. Classify and Group Redundant Knowledge/Errors
            const prompt = `
You are the MemoryConsolidation Substrate for POG2.
Below is the raw cognitive exhaust (memories, errors, meta-reflections) from the current localized session.

YOUR TASK:
Group identical/highly-repetitive errors into singular "Core Lessons".
If the knowledge is unique, DO NOT delete or merge it. Simply ignore it.
If multiple nodes represent the exact same failure loop, summarize them into one profound learning.

RAW DATA (JSON containing { id, text, errorType }):
${JSON.stringify(lessons.map(l => ({ id: l.id, text: l.text, errorType: l.errorType })), null, 2)}

Return a strict JSON object mapping the raw IDs to delete to the NEW synthesized overarching lesson, if consolidation is necessary. If no consolidation is needed, return empty arrays.
Format:
{
  "consolidations": [
    {
      "idsToDelete": ["id1", "id2"],
      "synthesizedLesson": "Comprehensive rule derived from the repeated failure."
    }
  ]
}
`;

            const res = await this.client.call({
                model: this.client.config.memoryConsolidationModel, // Must be reliable
                prompt,
                systemPrompt: 'You are the POG2 Subconscious Memory Processor. Eliminate bloat, retain wisdom.',
                temperature: 0.1
            });

            if (!res.ok) return res as any;

            const responseText = res.value.response;
            const jsonStr = responseText.match(/\{[\s\S]*\}/)?.[0] || '{"consolidations":[]}';
            const data = JSON.parse(jsonStr) as { consolidations: Array<{ idsToDelete: string[], synthesizedLesson: string }> };

            // 3. Apply Transformations to VectorDB
            for (const consolidation of data.consolidations) {
                if (consolidation.idsToDelete.length > 1 && consolidation.synthesizedLesson) {

                    // Embed the new profound lesson
                    const embedRes = await this.client.embed(consolidation.synthesizedLesson);
                    if (!embedRes.ok) continue;

                    // Write the new master lesson
                    await this.vectorDB.addLesson({
                        id: `compressed-${Date.now()}-${Math.random().toString(36).substring(7)}`,
                        text: consolidation.synthesizedLesson,
                        embedding: embedRes.value,
                        projectId: 'global',
                        domainNamespace: 'global',
                        createdAt: Date.now(),
                        metadata: { source: 'memory-consolidation', sessionId },
                        type: 'condensed_lesson'
                    });

                    // Purge the bloat
                    await this.vectorDB.deleteLessons(consolidation.idsToDelete);
                    logger.info({ purged: consolidation.idsToDelete.length }, `Condensed ${consolidation.idsToDelete.length} redundant nodes into a singular sovereign memory.`);
                }
            }

            return { ok: true, value: undefined };

        } catch (err) {
            logger.error({ err }, 'Memory consolidation phase encountered metabolic friction.');
            return { ok: false, error: err as Error };
        }
    }

    /**
     * validateNonce - Temporal fingerprint verification to prevent SovereignKnock replay attacks.
     */
    public async validateNonce(nonce: string): Promise<boolean> {
        // Check if nonce has been used in this session locally
        if (this.consumedNonces.has(nonce)) {
            logger.warn({ nonce }, 'SovereignKnock Replay Attack detected: Nonce already consumed.');
            return false;
        }

        // Record the nonce to prevent reuse
        this.consumedNonces.add(nonce);
        return true;
    }
}
