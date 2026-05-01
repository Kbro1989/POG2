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

    /**
     * consolidate - Synthesizes raw session memories into profound generative rules.
     * Can be focused on specific Sovereign Law repairs if violations are detected.
     */
    public async consolidate(sessionLog?: any, options?: { focus: string; violations: any[] }): Promise<Result<void>> {
        const sessionId = this.state.getSessionId();
        if (!sessionId) return { ok: false, error: new Error('No active Session ID.') };

        // 1. Fetch Raw Session Memories
        const fetchRes = this.vectorDB.getSessionLessons(sessionId);
        if (!fetchRes.ok) return fetchRes as Result<void>;

        const lessons = fetchRes.value;
        if (lessons.length < 3 && !options?.violations?.length) {
            // Not enough data to warrant a complex structural merge
            logger.debug({ lessons: lessons.length }, 'Insufficient memory density for structural consolidation. Keeping exact references.');
            return { ok: true, value: undefined };
        }

        try {
            // 2. Classify and Group Redundant Knowledge/Errors/Insights
            let focusContext = '';
            if (options?.focus === 'SOVEREIGN_LAW_REPAIR' && options.violations) {
                focusContext = `
[SOVEREIGN LAW REPAIR MODE ACTIVE]
The following Clinical Violations (Placeholders/Mocks) were detected during this session:
${JSON.stringify(options.violations, null, 2)}
YOUR PRIMARY GOAL: Synthesize rules that specifically address and prevent these violations in future creative cycles.
                `;
            }

            const prompt = `
You are the MemoryConsolidation Substrate for POG2, transforming into an autonomous Sovereign Game & Cinematic Creation AI.
Below is the raw cognitive exhaust (memories, errors, structural data, and meta-reflections) from the current localized session.

${focusContext}

YOUR TASK:
1. Group identical/highly-repetitive errors into singular profound "Core Software Engineering Lessons".
2. Synthesize ambient structural data into profound "Game Design & Cinematic paradigms" (e.g., how to scale an MMO, how to architect 3D cinema).
3. If Sovereign Violations were provided, enforce strong architectural typing and clinical precision.

DATA (JSON):
${JSON.stringify(lessons.map(l => ({ id: l.id, text: l.text, errorType: l.errorType })), null, 2)}

Return a strict JSON object mapping the raw IDs to delete to the NEW synthesized overarching generative lesson.
Format:
{
  "consolidations": [
    {
      "idsToDelete": ["id1", "id2"],
      "synthesizedLesson": "Comprehensive generative game design or software rule derived from the data."
    }
  ]
}
`;

            const res = await this.client.call({
                model: this.client.config.memoryConsolidationModel,
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

                    // Write the new master lesson via TrainingCollector
                    const { TrainingCollector } = await import('../utils/TrainingCollector.js');
                    await TrainingCollector.getInstance().recordLesson({
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
