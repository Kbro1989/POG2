import { type Result, type Ternary, type TaskClass, type AICapability, type RoutingSnapshot, type RoutingDecisionAudit } from '../../core/models.js';
import { CapabilityRegistry, type AIServiceType } from './CapabilityRegistry.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { WorkforceManifest } from '../../routing/WorkforceManifest.js';
import { SovereignDomain } from '../../types/SovereignDomain.js';
import { createLogger } from "../../utils/logger.js";
import { SubstrateResolver } from '../../engines/gameplay/SubstrateResolver.js';
import { CNSGodheadPulseVolley } from '../../engines/gameplay/CNSGodheadPulseVolley.js';
import { EventBus } from '../../events/EventBus.js';

const logger = createLogger('AIDispatcher');

export type ServiceState = 'IDLE' | 'CONNECTING' | 'READY' | 'ERROR';

export type ModelTier = "SOVEREIGN_LOCAL" | "ENRICHED_LOCAL" | "CLOUD";

export interface RoutingPolicy {
  primary: ModelTier;
  fallback: ModelTier[];
  allowCloud: boolean;
  cloudOptional: boolean;
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

    async dispatch(request: { capabilityId: string; payload: string; context?: any; snapshot?: RoutingSnapshot; modelOverride?: string }): Promise<Result<any>> {
        const capability = CapabilityRegistry[request.capabilityId];
        if (!capability) {
            return { ok: false, error: new Error(`Capability ${request.capabilityId} not registered.`) };
        }

        const taskClass = capability.taskClass || this.classifyTask(request.capabilityId, request.payload);
        const policy = MODEL_POLICY[taskClass] || MODEL_POLICY.AGENTIC_REASONING;
        
        // Use provided snapshot or get current from CNS
        const snapshot = request.snapshot || CNSGodheadPulseVolley.getInstance()?.getRoutingSnapshot();

        const modelId = request.modelOverride || this.resolveModelFromPolicy(policy, capability, snapshot);
        
        const start = Date.now();
        try {
            this.serviceStates.set(capability.serviceType, 'READY');
            const result = await this.client.execute({
                model: modelId,
                prompt: request.payload,
                systemPrompt: `Capability: ${capability.name}\nTask: ${taskClass}\nDomain: ${capability.domain || 'GENERAL'}`
            });

            const latency = Date.now() - start;
            
            // Causal Routing Audit
            this.auditDecision({
                tick: snapshot?.tick || -1,
                taskClass,
                policy,
                snapshotHash: snapshot ? this.hashSnapshot(snapshot) : 'LIVE',
                selectedModel: modelId,
                selectedTier: this.getTierFromModel(modelId, capability),
                latencyMs: latency,
                success: result.ok
            });

            return result;
        } catch (error) {
            this.serviceStates.set(capability.serviceType, 'ERROR');
            const errorMessage = error instanceof Error ? error.message : String(error);

            if (capability.fallback) {
                logger.warn({ capabilityId: request.capabilityId, fallback: capability.fallback, error: errorMessage }, 'Dispatch exception, attempting fallback');
                return this.dispatch({ ...request, capabilityId: capability.fallback });
            }

            return {
                ok: false,
                error: new Error(errorMessage)
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

    private resolveModelFromPolicy(policy: RoutingPolicy, capability: AICapability, snapshot?: RoutingSnapshot): string {
        const rolodex = this.client.getRolodex();
        
        // 0. Policy-Driven Cloud Gate
        let cloudStatus = 'ONLINE';
        let cloudEffect = 'NONE';

        if (snapshot) {
            cloudStatus = snapshot.cloudHealth.status;
            cloudEffect = snapshot.cloudHealth.effect;
        } else {
            const signal = SubstrateResolver.getCloudSignal();
            cloudStatus = signal.status;
            cloudEffect = signal.effect;
        }

        const forceLocal = !policy.allowCloud || cloudEffect === 'BLOCK_CLOUD_TASKS';

        // 1. Try Primary Tier (if not forced local or primary is already local)
        if (!forceLocal || policy.primary !== 'CLOUD') {
            const primaryModel = this.getModelForTier(policy.primary, capability);
            const isHealthy = snapshot ? snapshot.modelHealthMap[primaryModel] : rolodex?.isModelHealthy(primaryModel);
            if (isHealthy) return primaryModel;
        }

        // 2. Try Fallback Tiers in order
        for (const tier of policy.fallback) {
            if (forceLocal && tier === 'CLOUD') continue;
            const fallbackModel = this.getModelForTier(tier, capability);
            const isHealthy = snapshot ? snapshot.modelHealthMap[fallbackModel] : rolodex?.isModelHealthy(fallbackModel);
            if (isHealthy) return fallbackModel;
        }

        // 3. Absolute Floor: Sovereign Local
        return this.getModelForTier("SOVEREIGN_LOCAL", capability);
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

    private getTierFromModel(modelId: string, capability: AICapability): ModelTier {
        if (modelId === (this.client.config.masterLocalModel || 'deepseek-r1:8b')) return "SOVEREIGN_LOCAL";
        if (modelId === capability.modelId) return "CLOUD";
        return "ENRICHED_LOCAL";
    }

    private hashSnapshot(snapshot: RoutingSnapshot): string {
        // Simple hash of the snapshot state
        const data = `${snapshot.tick}-${snapshot.cloudHealth.status}-${snapshot.substrateHealth}`;
        return `snap:${snapshot.tick}`;
    }

    private auditDecision(audit: RoutingDecisionAudit): void {
        logger.info({
            tick: audit.tick,
            task: audit.taskClass,
            model: audit.selectedModel,
            snap: audit.snapshotHash,
            tier: audit.selectedTier
        }, '🧬 Cognitive Routing Audit');

        EventBus.getInstance().publish({
            type: 'decision.routing',
            source: 'AIDispatcher',
            payload: {
                ...audit,
                timestamp: new Date().toISOString(),
                sessionId: (globalThis as any).pog2_sessionId || 'unknown'
            }
        });
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

