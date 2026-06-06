import { RouteDecision } from '../core/models.js';
import { TernaryRouter } from './TernaryRouter.js';
import { createLogger } from '../utils/logger.js';
import { CanonicalClock } from '../utils/CanonicalClock.js';

const logger = createLogger('AttentionRouter');

export interface SalienceInput {
  prompt: string;
  domain: string;
  anomalyScore: number;      // 0-1, from surprise detection
  emotionalValence?: number; // -1 to 1, from MetaCognitionEngine
  urgencySignal?: boolean;   // from CognitiveImmunologyEmergency
}

export class AttentionRouter {
  private salienceAccumulator: number = 0;

  constructor(private ternaryRouter: TernaryRouter) {
    // Register decay on CanonicalClock. 
    // This fires every 300ms (both T1 and T2). We'll decay by 0.05 per 300ms tick.
    CanonicalClock.getInstance().registerPulse({
      domain: 'ROUTING',
      callback: (tick: number, phase: number) => this.decaySalience(0.05),
      priority: 50,
      name: 'AttentionRouterSalienceDecay'
    });
  }

  private decaySalience(amount: number): void {
    if (this.salienceAccumulator > 0) {
      this.salienceAccumulator = Math.max(0, this.salienceAccumulator - amount);
    }
  }

  public async routeWithSalience(input: SalienceInput): Promise<RouteDecision & { salienceScore?: number }> {
    const baseDecision = await this.ternaryRouter.route(input.prompt, input.domain);
    
    // Accumulate salience: a sustained anomaly grows the score
    const currentSpike = this.computeSalience(input);
    this.salienceAccumulator += currentSpike;
    const effectiveSalience = Math.min(this.salienceAccumulator, 1.0);
    
    if (effectiveSalience > 0.8 && baseDecision.tier !== 'Master') {
      logger.info({
        baseTier: baseDecision.tier,
        salienceScore: effectiveSalience,
        reason: input.urgencySignal ? 'emergency_override' : 'anomaly_boost'
      }, 'AttentionRouter: salience escalation');
      
      return {
        ...baseDecision,
        tier: 'Master',
        model: this.getMasterModelForDomain(input.domain),
        reason: 'salience_escalation',
        salienceScore: effectiveSalience
      };
    }

    return { ...baseDecision, salienceScore: effectiveSalience };
  }

  private computeSalience(input: SalienceInput): number {
    let score = input.anomalyScore;
    if (input.urgencySignal) score = Math.max(score, 0.95);
    if (input.emotionalValence !== undefined && input.emotionalValence < -0.5) {
      score = Math.max(score, 0.85); // Negative affect = threat priority
    }
    return Math.min(score, 1.0);
  }

  private getMasterModelForDomain(domain: string): string {
    // Fallback to tier selection from Rolodex
    return 'deepseek-r1:8b'; // Or query ModelRolodex for domain-specific Master
  }
}
