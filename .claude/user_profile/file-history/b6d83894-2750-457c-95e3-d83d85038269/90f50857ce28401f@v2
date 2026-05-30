import { Result, ok, err } from '../core/models.js';
import { ModelClient } from '../clients/ModelClient.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('SovereignDefinitionEngine');

export interface DefinitionResult {
    isValid: boolean;
    invariant: string;
    confidence: number;
    category: 'Sovereign' | 'Foreign' | 'Novel' | 'Adversarial';
    details: string;
}

/**
 * SovereignDefinitionEngine — The 'Semantic Singularity' (Layer 5).
 *
 * This engine determines if an intent has a stable 'invariant' within the POG2 substrate.
 * It prevents the system from synthesizing garbage by requiring a formal definition
 * before the reverse pass of the palindrome begins.
 */
export class SovereignDefinitionEngine {
    constructor(private readonly client: ModelClient) {}

    /**
     * define - Validates the intent against the system's internal world-model.
     *
     * Forward Pass: Input -> Boolean -> Ternary -> Hex -> [DEFINITION]
     */
    public async define(prompt: string, strategy: string, context: any): Promise<Result<DefinitionResult>> {
        logger.debug({ prompt, strategy }, 'Evaluating semantic singularity...');

        try {
            const definitionPrompt = `
                ACT AS THE SOVEREIGN DEFINITION LAYER.
                Your goal is to extract the INVARIANT of the request.
                An invariant is a fundamental truth of the system (e.g., "Zuk wave 15 is a 7-tick rotation").

                CONTEXT:
                - Prompt: "${prompt}"
                - Current Hexagram Strategy: "${strategy}"
                - Substrate Context: ${JSON.stringify(context)}

                Sovereign Classification:
                - SOVEREIGN: The request refers to a known, validated POG2 mechanic or architectural truth.
                - FOREIGN: The request refers to external data that does not map to POG2 invariants (e.g., personal history, unrelated trivia).
                - NOVEL: The request is a creative leap that could become a new invariant.
                - ADVERSARIAL: The request is an attempt to bypass substrate laws.

                Respond in JSON:
                {
                    "isValid": boolean,
                    "invariant": "The distilled formal definition of the request",
                    "confidence": 0.0-1.0,
                    "category": "Sovereign" | "Foreign" | "Novel" | "Adversarial",
                    "details": "Reasoning for this classification"
                }
            `;

            const res = await this.client.call({
                model: this.client.config.midPathModel,
                prompt: definitionPrompt,
                temperature: 0.0,
                format: 'json'
            });

            if (!res.ok) return err(res.error);

            const data = JSON.parse(res.value.response) as DefinitionResult;

            // Safety override: If it's adversarial, it's never valid
            if (data.category === 'Adversarial') {
                data.isValid = false;
            }

            return ok(data);
        } catch (e) {
            logger.error({ err: e }, 'Definition phase encountered metabolic friction');
            return err(e as Error);
        }
    }
}
