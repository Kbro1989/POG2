import { ModelClient } from '../clients/ModelClient.js';
import { Result, ok, err } from '../core/models.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('SovereignPedagogyBridge');

export interface PedagogyEnrichment {
    learningNote: string;
    confidence: number;
    suggestedAction: {
        action: string;
        target: string;
        reasoning: string;
    };
    emotionalWeight: Record<string, number>;
    hexagramPin: {
        id: number;
        name: string;
        line: number;
    };
}

/**
 * SovereignPedagogyBridge
 *
 * Interfaces with the pedagogy model to provide "AI-driven truth"
 * for entities that are missing from the physical manifests.
 *
 * Designed for DO compatibility: Environment-based and cache-aware.
 */
export class SovereignPedagogyBridge {
    private static instance: SovereignPedagogyBridge;
    private kv: any = null;

    private constructor() {}

    public static getInstance(): SovereignPedagogyBridge {
        if (!SovereignPedagogyBridge.instance) {
            SovereignPedagogyBridge.instance = new SovereignPedagogyBridge();
        }
        return SovereignPedagogyBridge.instance;
    }

    /**
     * initialize - Explicitly binds the environment for the bridge.
     * Prevents the "late-binding footgun" of injectEnv.
     */
    public initialize(env: { KV?: any }): void {
        this.kv = env.KV;
        logger.info('SovereignPedagogyBridge bound to environment KV store.');
    }

    /**
     * enrich - Uses the ModelClient to generate a pedagogical insight for an entity.
     */
    public async enrich(entityId: number, basicData: any, modelClient: ModelClient): Promise<Result<PedagogyEnrichment>> {
        const cacheKey = `pedagogy:${entityId}`;

        // 1. KV Cache Lookup
        if (this.kv) {
            try {
                const cached = await this.kv.get(cacheKey);
                if (cached) return ok(JSON.parse(cached));
            } catch (e) {
                logger.warn({ err: e }, 'KV lookup failed, proceeding to inference.');
            }
        }

        const prompt = this.buildPrompt(entityId, basicData);

        // 2. Query Model with JSON format request
        // We use the la-Sovereign dispatch via ModelClient
        const res = await modelClient.call({
            model: modelClient.getRolodex()?.resolveCapability('pedagogy')?.model || 'deepseek-r1:8b',
            prompt,
            temperature: 0.3,
            format: 'json'
        });

        if (!res.ok) return res as any;

        try {
            const parsed = JSON.parse(res.value.response) as any;
            const validated = this.validateAndNormalize(parsed);

            // 3. Cache result (1-hour TTL)
            if (this.kv) {
                await this.kv.put(cacheKey, JSON.stringify(validated), { expirationTtl: 3600 });
            }

            return ok(validated);
        } catch (e) {
            return err(new Error(`Failed to parse and validate pedagogy response: ${e instanceof Error ? e.message : String(e)}`));
        }
    }

    private buildPrompt(entityId: number, basicData: any): string {
        return `
Sovereign Pedagogy Audit
Entity ID: ${entityId}
Raw Data: ${JSON.stringify(basicData)}

Provide a concise pedagogical insight into this entity.
Why does this entity exist in the context of the world's "Truth"?
What is its primary training value?

Respond in JSON ONLY with the following schema:
{
    "learningNote": "string",
    "confidence": "number (0.0-1.0)",
    "suggestedAction": {
        "action": "string",
        "target": "string",
        "reasoning": "string"
    },
    "emotionalWeight": { "trait": "number(0.0-1.0)" },
    "hexagramPin": {
        "id": "number (1-64)",
        "name": "string",
        "line": "number (1-6)"
    }
}
`;
    }

    private validateAndNormalize(raw: any): PedagogyEnrichment {
        return {
            learningNote: raw.learningNote || 'No pedagogical insight available.',
            confidence: Math.max(0, Math.min(1, raw.confidence || 0.5)),
            suggestedAction: {
                action: raw.suggestedAction?.action || 'Observe',
                target: raw.suggestedAction?.target || 'Entity',
                reasoning: raw.suggestedAction?.reasoning || 'Standard observation required.'
            },
            emotionalWeight: this.normalizeWeights(raw.emotionalWeight),
            hexagramPin: {
                id: Math.max(1, Math.min(64, raw.hexagramPin?.id || 1)),
                name: raw.hexagramPin?.name || 'The Void',
                line: Math.max(1, Math.min(6, raw.hexagramPin?.line || 1))
            }
        };
    }

    private normalizeWeights(weights: any): Record<string, number> {
        const normalized: Record<string, number> = {};
        if (typeof weights !== 'object' || weights === null) return normalized;

        for (const [k, v] of Object.entries(weights)) {
            const val = Number(v); // JSON.parse handles most, but Number() ensures cast
            normalized[k] = isNaN(val) ? 0 : Math.max(0, Math.min(1, val));
        }
        return normalized;
    }
}

