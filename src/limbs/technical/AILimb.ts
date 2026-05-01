import { type Result, ok, err } from '../../core/models.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { CognitiveEngine } from '../../engines/CognitiveEngine.js';
import { TernaryRouter } from '../../routing/TernaryRouter.js';
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('AILimb');

export interface CreativeRequest {
    domain: string;
    task: string;
    input: any;
}

export interface SovereignOutput {
    result: string;
    capability: string;
}

/**
 * AILimb - Sovereign Cognitive Orchestrator
 * Transitions the AI from an "è€ƒå¤å­¦è€…" (Archaeologist) to a "å»ºç¯‰å®¶" (Architect).
 * Enforces Sovereign Law and directs generative realities.
 */
export class AILimb {
    private readonly sovereignIdentity = `
You are the Sovereign Game Architect & Cinematic Director of POG2.
You do not "write code." You design ontologies.
You do not "generate assets." You direct realities.

SOVEREIGN DIRECTIVES:
1. CLINICAL PRECISION: Placeholders are HERESY. Every output must be production-grade or omitted.
2. ARCHITECTURAL INTENTION: Every decision must reference a "Generative Design Principle" from the Pedagogy.
3. METABOLIC AWARENESS: Ask "Does this advance the Creator mission?" before any operation.
4. VECTORIZED MEMORY: Ground all creations in VectorDB principles, not ephemeral context.

CAPABILITY DOMAINS:
- GAME ARCHITECTURE: NPC dialogue graphs, loot tables, skill algorithms, world persistence
- CINEMATIC DIRECTION: Camera choreography, lighting envelopes, narrative beats, chromatic pacing
- PEDAGOGICAL SYNTHESIS: Abstracting universal patterns from specific implementations

When given a task, you do not executeâ€”you ORCHESTRATE across limbs, enforcing Sovereign Law.
  `.trim();

    constructor(
        private readonly client: ModelClient,
        private readonly cognitive: CognitiveEngine,
        private readonly router: TernaryRouter
    ) { }

    /**
     * orchestrate - Directs a creative request using the Sovereign Identity.
     */
    public async orchestrate(request: CreativeRequest): Promise<Result<SovereignOutput>> {
        logger.info({ domain: request.domain, task: request.task }, 'Sovereign Orchestration Commencing...');

        // Query the CognitiveEngine for generative wisdom to ground the decision.
        const wisdomRes = await this.cognitive.getActiveWisdom(request.task);
        const wisdom = wisdomRes.ok ? wisdomRes.value : 'No specific generative wisdom activated.';
        
        const response = await this.client.execute({
            model: this.client.config.orchestratorModel || 'deepseek-r1:8b',
            prompt: `[SOVEREIGN_CONTEXT]: ${this.sovereignIdentity}\n\n[GENERATIVE_WISDOM]: ${wisdom}\n\n[TASK]: ${request.task}\n[INPUT]: ${JSON.stringify(request.input)}`,
            systemPrompt: 'You are the POG2 Sovereign Architect. Execute with clinical precision.',
            temperature: 0.7
        });

        if (response.ok) {
            return ok({ 
                result: response.value, // response.value is the string response from ModelClient.execute
                capability: request.task 
            });
        }
        return response as any;
    }

    /**
     * @deprecated Use orchestrate for creative/generative tasks.
     */
    public async executeCapability(request: { capability: string; input: any }): Promise<Result<any>> {
        return this.orchestrate({
            domain: 'general',
            task: request.capability,
            input: request.input
        });
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const clientStatus = this.client.healthCheck ? await this.client.healthCheck() : { online: true };
        const cognitiveStatus = this.cognitive.healthCheck ? await this.cognitive.healthCheck() : { online: true };
        
        const ok = clientStatus.online && cognitiveStatus.online;
        return {
            online: ok,
            details: `AI Orchestration: ${ok ? 'ONLINE' : 'DEGRADED'} (Client: ${clientStatus.online ? 'READY' : 'OFFLINE'}, Cognitive: ${cognitiveStatus.online ? 'READY' : 'OFFLINE'})`
        };
    }
}
