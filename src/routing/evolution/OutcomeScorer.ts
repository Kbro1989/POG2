import { createLogger } from '../../utils/logger.js';
import { type Result, ok } from '../../core/models.js';
import type { InteractionRecord } from '../../utils/TrainingCollector.js';
import type { ModelClient } from '../../clients/ModelClient.js';

const logger = createLogger('OutcomeScorer');

export interface OutcomeScore {
    score: number; // 0.0 to 1.0
    confidence: number;
    reasoning: string;
    validatedSyntax: boolean;
    semanticMatch: boolean;
    modelId: string;
    timestamp: number;
}

/**
 * OutcomeScorer — Evaluates technical and semantic quality of a model's output.
 * This provides the "Experience" signal to the StrategyAdvisor.
 */
export class OutcomeScorer {
    private client?: ModelClient;

    constructor(client?: ModelClient) {
        this.client = client;
    }

    public setClient(client: ModelClient) {
        this.client = client;
    }

    /**
     * Grade a completed interaction.
     */
    public async grade(record: InteractionRecord): Promise<Result<OutcomeScore>> {
        logger.info({ model: record.model, category: record.category }, 'Grading metabolic outcome...');

        let syntaxValid = true;
        let semanticMatch = true;
        let score = 1.0;
        let reasoning = '';

        // 1. Technical Triage: Syntax Validation
        if (record.category === 'coding' || record.prompt.toLowerCase().includes('write a code') || record.prompt.toLowerCase().includes('typescript')) {
            const codeSyntaxResult = this.validateCodeSyntax(record.response);
            syntaxValid = codeSyntaxResult.isValid;
            if (!syntaxValid) {
                score -= 0.4;
                reasoning += 'Code syntax failure detected. ';
            }
            if (codeSyntaxResult.braceMismatch) {
                score -= 0.4; // Additional penalty for brace mismatch
                reasoning += 'Unbalanced braces detected. ';
            }
        }

        if (record.prompt.toLowerCase().includes('json')) {
            const jsonValid = this.validateJsonSyntax(record.response);
            if (!jsonValid) {
                syntaxValid = false;
                score -= 0.5;
                reasoning += 'JSON syntax failure detected. ';
            }
        }

        // 2. Semantic Triage: Judge-Model (Optional/Async for performance)
        // Heuristic: Check for refusal phrases or extremely short responses
        const lowerResponse = record.response.toLowerCase();
        if (lowerResponse.includes('i cannot help') || lowerResponse.includes('sorry, but i') || lowerResponse.includes('error:') || lowerResponse.includes('as an ai language model')) {
            score -= 0.7; // Significant penalty for refusal/error phrases
            semanticMatch = false;
            reasoning += 'Refusal or error phrase detected. ';
        }

        if (this.client && score > 0.5) {
             const semanticResult = await this.evaluateSemantics(record);
             semanticMatch = semanticResult.match;
             score *= semanticResult.confidence;
        }

        const finalScore: OutcomeScore = {
            score: Math.max(0, Math.min(1, score)),
            confidence: 0.8, // Base confidence in our own grading
            reasoning: reasoning || (syntaxValid ? 'Syntax verified.' : 'Syntax failure detected.'),
            validatedSyntax: syntaxValid,
            semanticMatch,
            modelId: record.model,
            timestamp: Date.now()
        };

        logger.info({ model: record.model, score: finalScore.score }, 'Outcome graded.');
        return ok(finalScore);
    }

    private validateCodeSyntax(code: string): { isValid: boolean; braceMismatch: boolean } {
        // Extract code block if present
        const match = code.match(/```(?:typescript|javascript|ts|js)?\n([\s\S]*?)```/);
        const actualCode = match ? match[1] : code;

        const openBraces = (actualCode.match(/\{/g) || []).length;
        const closeBraces = (actualCode.match(/\}/g) || []).length;
        const braceMismatch = openBraces !== closeBraces;
        
        return { 
            isValid: !braceMismatch, 
            braceMismatch 
        };
    }

    private validateJsonSyntax(text: string): boolean {
        try {
            const match = text.match(/```json\n([\s\S]*?)```/) || text.match(/(\{[\s\S]*\})/);
            if (!match) return false;
            const jsonText = match[1];
            JSON.parse(jsonText);
            return true;
        } catch {
            return false;
        }
    }

    private async evaluateSemantics(record: InteractionRecord): Promise<{ match: boolean; confidence: number }> {
        // Placeholder for Judge-Model evaluation
        return { match: record.success, confidence: 1.0 };
    }
}
