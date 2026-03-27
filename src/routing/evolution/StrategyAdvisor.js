import { createLogger } from '../../utils/logger.js';
const logger = createLogger('StrategyAdvisor');
/**
 * StrategyAdvisor — Detects metabolic drift and suggests routing policy shifts.
 * Identifies models that are underperforming relative to their tier.
 */
export class StrategyAdvisor {
    mutationHistory = [];
    /**
     * Analyze recent interactions and scores to identify needed shifts.
     */
    async analyzeMetabolicDrift(interactions, scores) {
        logger.info({ sampleSize: interactions.length }, 'Analyzing CNS metabolic drift...');
        const mutations = [];
        const modelStats = {};
        // Aggregate results by model
        for (let i = 0; i < interactions.length; i++) {
            const int = interactions[i];
            const score = scores[i];
            if (!modelStats[int.model]) {
                modelStats[int.model] = { total: 0, failCount: 0, totalScore: 0 };
            }
            modelStats[int.model].total++;
            modelStats[int.model].totalScore += score.score;
            if (score.score < 0.1)
                modelStats[int.model].failCount++;
        }
        logger.info({ modelStats }, '🧬 StrategyAdvisor internal stats aggregated.');
        // Detect Drift: If a model has >20% failure rate after 10+ samples
        for (const [model, stats] of Object.entries(modelStats)) {
            const failureRate = stats.failCount / stats.total;
            const avgScore = stats.totalScore / stats.total;
            if (stats.total >= 5 && (failureRate > 0.2 || avgScore < 0.6)) {
                mutations.push({
                    id: `mut_${Date.now()}_${model.replace(/:/g, '_')}`,
                    model,
                    targetTier: 'Reactive', // Demote to reactive if failing executive tasks
                    weightAdjustment: -0.2,
                    reasoning: `Metabolic Drift: Model ${model} shows ${Math.round(failureRate * 100)}% failure rate over ${stats.total} samples. Avg score: ${avgScore.toFixed(2)}`,
                    proposedAt: Date.now(),
                    approved: false
                });
            }
        }
        return mutations;
    }
    getMutationHistory() {
        return [...this.mutationHistory];
    }
}
