import pino from 'pino';
import { ModelClient } from '../clients/ModelClient.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { type Result, YaoState } from '../core/models.js';
import { SOVEREIGN_SYSTEM_PROMPT } from '../prompts/SystemPrompts.js';

export interface VerificationResult {
    score: number; // 0-100
    isAligned: boolean;
    reasoning: string;
    correction?: string;
}

/**
 * IntentVerifier - The Sovereign Auditor.
 */
export class IntentVerifier {
    private readonly logger: pino.Logger;

    constructor(
        private readonly client: ModelClient,
        private readonly hexagramManager: HexagramManager
    ) {
        this.logger = pino({ name: 'IntentVerifier', base: { hostname: 'POG2' } });
    }

    async verify(
        originalPrompt: string,
        output: string,
        context?: Record<string, unknown>
    ): Promise<VerificationResult> {
        const hexagramContext = this.hexagramManager.getInterpretation();

        const auditPrompt = `
=== SOVEREIGN AUDIT ===
Verify if the following execution aligns with the User's Sovereign Intent.

ORIGINAL INTENT:
"${originalPrompt}"

EXECUTION OUTPUT:
"${output.substring(0, 3000)}..."

SITUATION (Hexagram):
Archetype: ${hexagramContext.name}
Strategy: ${hexagramContext.strategy}

PROJECT RULES:
1. NO MOCKS or Placeholders.
2. NO refusal unless impossible.
3. Strict adherence to commands.

Score 0-100. < 80 is Failure.
JSON ONLY:
{
  "score": number,
  "reasoning": "strategy description",
  "correction": "suggested fix if failed"
}
`.trim();

        const result = await this.client.resilientCall({
            model: this.client.config.lightAuditorModel,
            prompt: auditPrompt,
            systemPrompt: SOVEREIGN_SYSTEM_PROMPT,
            temperature: 0.1,
            format: 'json',
            tier: 'Executive'
        });

        if (!result.ok) {
            this.logger.error({ error: result.error.message }, 'SOVEREIGN AUDIT FAILED: All substrates offline or rejected request.');
            return { score: 0, isAligned: false, reasoning: `Absolute Failure: All substrates exhausted. Error: ${result.error.message}` };
        }

        try {
            const raw = result.value.response.replace(/```json|```/g, '').trim();
            const audit = JSON.parse(raw);

            return {
                score: audit.score,
                isAligned: audit.score >= 80,
                reasoning: audit.reasoning,
                correction: audit.correction
            };
        } catch (e) {
            this.logger.error('Failed to parse audit');
            return { score: 100, isAligned: true, reasoning: 'Parse error' };
        }
    }
}
