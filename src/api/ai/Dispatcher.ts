import { type Result, type Ternary } from '../../core/models.js';
import { CapabilityRegistry, type AICapability, type AIServiceType } from './CapabilityRegistry.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { WorkforceManifest } from '../../routing/WorkforceManifest.js';
import { SovereignDomain } from '../../types/SovereignDomain.js';
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('AIDispatcher');

export type ServiceState = 'IDLE' | 'CONNECTING' | 'READY' | 'ERROR';

export interface DispatchRequest {
    readonly capabilityId: string;
    readonly payload: string;
    readonly modelOverride?: string;
    readonly systemPrompt?: string;
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

        logger.info({ capabilityId: request.capabilityId, service: capability.serviceType }, 'Dispatching AI task');

        let model = request.modelOverride || capability.modelId;

        // Map service type to prefix if missing in modelId
        if (model && !model.includes(':')) {
            if (capability.serviceType === 'GEMINI') model = `gemini:${model}`;
            else if (capability.serviceType === 'HUGGINGFACE') model = `huggingface:${model}`;
            else if (capability.serviceType === 'CLOUDFLARE') model = `cloudflare:${model}`;
        }

        // If no modelId specified, use workforce defaults for the domain
        if (!model) {
            const domain = capability.domain || SovereignDomain.CODE;
            const workers = this.workforce.getWorkersForDomain(domain);
            
            if (workers.length > 0) {
                model = workers[0].id; // Pick the first authorized specialist
                logger.info({ capabilityId: request.capabilityId, model, domain }, 'Workforce selected specialist for dispatch');
            } else {
                // Last-resort fallback to config defaults if no worker found
                switch (capability.serviceType) {
                    case 'GEMINI': model = `gemini:${this.client.config.geminiProModel}`; break;
                    case 'OLLAMA': model = this.client.config.codingModel; break;
                    case 'CLOUDFLARE': model = '@cf/meta/llama-3.1-8b-instruct'; break;
                    case 'HUGGINGFACE': model = `huggingface:${this.client.config.huggingfaceFallbackModel}`; break;
                    default: model = this.client.config.orchestratorModel;
                }
                logger.warn({ capabilityId: request.capabilityId, model }, 'No specialized worker found for domain. Using service default.');
            }
        }

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

                // Fallback logic
                if (capability.fallback) {
                    logger.warn({ capabilityId: request.capabilityId, fallback: capability.fallback }, 'Primary capability failed, attempting fallback');
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

