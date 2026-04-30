import { type Result, type Ternary, type TaskClass, type AICapability } from '../../core/models.js';
import { CapabilityRegistry, type AIServiceType } from './CapabilityRegistry.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { WorkforceManifest } from '../../routing/WorkforceManifest.js';
import { SovereignDomain } from '../../types/SovereignDomain.js';
import { createLogger } from "../../utils/logger.js";
import { SubstrateResolver } from '../../engines/gameplay/SubstrateResolver.js';

const logger = createLogger('AIDispatcher');

export type ServiceState = 'IDLE' | 'CONNECTING' | 'READY' | 'ERROR';

export type ModelTier = "SOVEREIGN_LOCAL" | "ENRICHED_LOCAL" | "CLOUD";

export interface RoutingPolicy {
  primary: ModelTier;
  fallback: ModelTier[];
  allowCloud: boolean;
  cloudOptional: boolean;
}

export interface DispatchRequest {
    readonly capabilityId: string;
    readonly payload: string;
    readonly modelOverride?: string;
    readonly systemPrompt?: string;
    readonly taskClass?: TaskClass; // Optional override for classification
}

export interface DispatchResponse {
    readonly success: boolean;
    readonly result: string;
    readonly error?: string;
    readonly serviceUsed: AIServiceType | 'NONE';
    readonly state: ServiceState;
    readonly model?: string;
    readonly status: Ternary; // 1: OK, 0: IDLE, -1: ERROR
    readonly [key: string]: string | number | boolean | null | undefined | object;
}

const MODEL_POLICY: Record<TaskClass, RoutingPolicy> = {
  COMPLETION: {
    primary: "SOVEREIGN_LOCAL",
    fallback: ["ENRICHED_LOCAL", "CLOUD"],
    allowCloud: true,
    cloudOptional: true
  },

  AGENTIC_REASONING: {
    primary: "ENRICHED_LOCAL",
    fallback: ["SOVEREIGN_LOCAL", "CLOUD"],
    allowCloud: true,
    cloudOptional: true
  },

  VISION: {
    primary: "CLOUD",
    fallback: ["ENRICHED_LOCAL"],
    allowCloud: true,
    cloudOptional: false
  },

  RETRIEVAL: {
    primary: "ENRICHED_LOCAL",
    fallback: ["SOVEREIGN_LOCAL"],
    allowCloud: false,
    cloudOptional: true
  },

  CREATIVE_EXPANSION: {
    primary: "CLOUD",
    fallback: ["ENRICHED_LOCAL", "SOVEREIGN_LOCAL"],
    allowCloud: true,
    cloudOptional: true
  }
};

/**
 * AIDispatcher - Autonomous capability selection and execution.
 * Refactored to use unified ModelClient substrate.
 */
export class AIDispatcher {
    private readonly serviceStates: Map<AIServiceType, ServiceState> = new Map();

    constructor(
        private readonly client: ModelClient,
        private readonly workforce: WorkforceManifest
    ) {
        // Initialize service states
        const types: AIServiceType[] = ['GEMINI', 'CLOUDFLARE', 'OLLAMA', 'HUGGINGFACE'];
        types.forEach(t => this.serviceStates.set(t, 'IDLE'));
    }

    async dispatch(request: DispatchRequest): Promise<DispatchResponse> {
        const capability = CapabilityRegistry[request.capabilityId];
        if (!capability) {
            return {
                success: false,
                result: '',
                error: `Unknown capability: ${request.capabilityId}`,
                serviceUsed: 'NONE',
                state: 'ERROR',
                status: -1
            };
        }

        // 1. Determine Task Class and Policy
        const taskClass = request.taskClass || capability.taskClass || this.classifyTask(request.capabilityId, request.payload);
        const policy = MODEL_POLICY[taskClass] || MODEL_POLICY.AGENTIC_REASONING;

        logger.info({ 
            capabilityId: request.capabilityId, 
            taskClass, 
            primary: policy.primary 
        }, 'Dispatching AI task via policy');

        // 2. Select Model based on Policy + Current Health
        let model = request.modelOverride || this.resolveModelFromPolicy(policy, capability);

        try {
            this.serviceStates.set(capability.serviceType, 'CONNECTING');

            const result = await this.client.call({
                model,
                prompt: request.payload,
                systemPrompt: request.systemPrompt || 'You are a specialized Sovereign Limb agent.'
            });

            if (result.ok) {
                this.serviceStates.set(capability.serviceType, 'READY');
                return {
                    success: true,
                    result: result.value.response,
                    serviceUsed: capability.serviceType,
                    state: 'READY',
                    model: result.value.model,
                    status: 1
                };
            } else {
                this.serviceStates.set(capability.serviceType, 'ERROR');

                // If primary policy model fails, trigger the "Sovereign Guarantee" fallback
                // but NOT by recursive dispatch, instead by finding the next best tier.
                logger.warn({ 
                    capabilityId: request.capabilityId, 
                    failedModel: model, 
                    error: result.error.message 
                }, 'Policy model failed. Engaging Sovereign Guarantee fallback.');

                const nextModel = this.resolveNextTierModel(policy, model);
                if (nextModel && nextModel !== model) {
                     return this.dispatch({ ...request, modelOverride: nextModel });
                }

                // If all tiers in policy fail, check if there's a hardcoded capability fallback
                if (capability.fallback) {
                    return this.dispatch({ ...request, capabilityId: capability.fallback });
                }

                return {
                    success: false,
                    result: '',
                    error: result.error.message,
                    serviceUsed: capability.serviceType,
                    state: 'ERROR',
                    status: -1
                };
            }
        } catch (error) {
            this.serviceStates.set(capability.serviceType, 'ERROR');
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (capability.fallback) {
                logger.warn({ capabilityId: request.capabilityId, fallback: capability.fallback, error: errorMessage }, 'Dispatch exception, attempting fallback');
                return this.dispatch({ ...request, capabilityId: capability.fallback });
            }

            return {
                status: -1,
                success: false,
                result: '',
                error: errorMessage,
                serviceUsed: capability.serviceType,
                state: 'ERROR'
            };
        }
    }

    private classifyTask(id: string, payload: string): TaskClass {
        if (id.includes('vision') || id.includes('eye') || payload.includes('.png')) return "VISION";
        if (id.includes('search') || id.includes('retrieve') || id.includes('atlas')) return "RETRIEVAL";
        if (id.includes('completion') || id.includes('scaffold')) return "COMPLETION";
        if (id.includes('generate') || id.includes('creative')) return "CREATIVE_EXPANSION";
        return "AGENTIC_REASONING";
    }

    private resolveModelFromPolicy(policy: RoutingPolicy, capability: AICapability): string {
        const rolodex = this.client.getRolodex();
        const cloudSignal = SubstrateResolver.getCloudSignal();

        // 0. Policy-Driven Cloud Gate: If cloud is blocked or not allowed, skip to local
        const forceLocal = !policy.allowCloud || cloudSignal.effect === 'BLOCK_CLOUD_TASKS';

        // 1. Try Primary Tier (if not forced local or primary is already local)
        if (!forceLocal || policy.primary !== 'CLOUD') {
            const primaryModel = this.getModelForTier(policy.primary, capability);
            if (rolodex && rolodex.isModelHealthy(primaryModel)) {
                return primaryModel;
            }
        }

        // 2. Try Fallback Tiers in order
        for (const tier of policy.fallback) {
            if (forceLocal && tier === 'CLOUD') continue;
            const fallbackModel = this.getModelForTier(tier, capability);
            if (rolodex && rolodex.isModelHealthy(fallbackModel)) {
                return fallbackModel;
            }
        }

        // 3. Absolute Floor: Sovereign Local
        return this.getModelForTier("SOVEREIGN_LOCAL", capability);
    }

    private resolveNextTierModel(policy: RoutingPolicy, currentModel: string): string | null {
        // Find which tier the current model belongs to, and return the next one in the fallback list
        const tiers: ModelTier[] = [policy.primary, ...policy.fallback];
        for (let i = 0; i < tiers.length - 1; i++) {
            const tierModel = this.getModelForTier(tiers[i], {} as any);
            if (currentModel.includes(tierModel) || currentModel === tierModel) {
                 return this.getModelForTier(tiers[i+1], {} as any);
            }
        }
        return null;
    }

    private getModelForTier(tier: ModelTier, capability: AICapability): string {
        switch (tier) {
            case "SOVEREIGN_LOCAL": 
                return this.client.config.masterLocalModel || 'deepseek-r1:8b';
            case "ENRICHED_LOCAL": 
                return this.client.config.localFallbackModel || 'deepseek-r1:8b';
            case "CLOUD": 
                return capability.modelId || this.client.config.orchestratorModel;
        }
    }

    public getServiceState(type: AIServiceType): ServiceState {
        return this.serviceStates.get(type) || 'IDLE';
    }

    public healthCheck(): { online: boolean; details: string } {
        const statuses = Array.from(this.serviceStates.entries())
            .map(([type, state]) => `${type}: ${state}`)
            .join(', ');
        return {
            online: true,
            details: `AI Dispatcher ready. Service States: ${statuses}`
        };
    }
}

