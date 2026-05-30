import { exec } from 'child_process';

export type AITaskType =
    | "general"
    | "code"
    | "creative"
    | "pedagogy"
    | "combat_rotation"
    | "spatial_analysis";

export interface Pog2PedagogyRequest {
    beastId?: number;
    entityId?: number;
    query: string;
    requireVerified: boolean;
    limbDomain: string;
}

import { promisify } from 'util';
import { Agent, fetch as undiciFetch } from 'undici';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import {
    type Result,
    type ModelCallParams,
    type ModelResponse,
    type ModelExecutor,
    type ModelCallResult,
    ok,
    type AICapability,
    type AIServiceType,
    YaoState
} from '../core/models.js';
import type { TernaryRouter } from '../routing/TernaryRouter.js';
import { TaskScheduler } from '../routing/TaskScheduler.js';
import { TrainingCollector, type ErrorFixRecord } from '../utils/TrainingCollector.js';
import { EndpointHealer } from '../utils/EndpointHealer.js';
import { ModelRolodex } from '../api/ai/ModelRolodex.js';
import type { QuotaTracker, QuotaProvider } from '../utils/QuotaTracker.js';

import { ArchitectureDigest } from '../core/ArchitectureDigest.js';
import { createLogger } from "../utils/logger.js";

const execAsync = promisify(exec);
const logger = createLogger('ModelClient');

/**
 * ModelClient â€” Real API calls to local and cloud-based neural substrates.
 * NO MOCKS. NO FAKES. Real network calls with proper error handling.
 */
export class ModelClient implements ModelExecutor {
    private readonly trainingCollector: TrainingCollector;
    private readonly healer: EndpointHealer;
    private readonly digest: ArchitectureDigest;
    private readonly customAgent: Agent;
    private rolodex?: ModelRolodex;
    private quotaTracker?: QuotaTracker;

    public async execute(params: ModelCallParams): Promise<Result<string>> {
        const result = await this.call(params);
        if (result.ok) {
            return { ok: true, value: result.value.response };
        }
        return { ok: false, error: result.error || new Error("Unknown model execution error") };
    }

    constructor(
        public readonly config: SovereignConfig,
        private readonly router?: TernaryRouter
    ) {
        this.trainingCollector = TrainingCollector.getInstance();
        this.digest = new ArchitectureDigest(process.cwd());
        // Fallback to router's hexagram if available
        const hex = router?.getHexagram() || (globalThis as any).hexagram;
        this.healer = new EndpointHealer(hex, this.trainingCollector);

        // Massive local contexts (33b+) may take over 5 mins to load into VRAM or stream.
        // Node's default fetch relies on Undici which enforces a strict 300_000ms headers timeout.
        // We override this to 24 hours (86,400,000ms) for high-fidelity local perseverance until complete.
        this.customAgent = new Agent({
            headersTimeout: 86_400_000,
            bodyTimeout: 86_400_000,
            connectTimeout: 120_000
        });
    }

    public getRouter(): TernaryRouter | undefined {
        return this.router;
    }

    public getHealer(): EndpointHealer {
        return this.healer;
    }

    public getTrainingCollector(): TrainingCollector {
        return this.trainingCollector;
    }

    /** Inject or retrieve the ModelRolodex for dynamic model discovery */
    public setRolodex(rolodex: ModelRolodex): void { this.rolodex = rolodex; }
    public getRolodex(): ModelRolodex | undefined { return this.rolodex; }

    /** Inject QuotaTracker for free-tier FinOps tracking */
    public setQuotaTracker(qt: QuotaTracker): void { this.quotaTracker = qt; }
    public getQuotaTracker(): QuotaTracker | undefined { return this.quotaTracker; }

    /** Check if the Ollama substrate is online */
    async checkHealth(): Promise<{ online: boolean; version: string }> {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const resp = await undiciFetch(`${this.config.ollamaBaseUrl}/api/version`, {
                    signal: AbortSignal.timeout(15000)
                });
                if (resp.ok) {
                    const data = await resp.json() as { version?: string };
                    return { online: true, version: data.version || 'unknown' };
                }
            } catch {
                if (attempt === 3) return { online: false, version: 'unreachable' };
                await new Promise(res => setTimeout(res, 2000 * attempt));
            }
        }
        return { online: false, version: 'offline' };
    }

    /** List locally available Ollama models */
    async listModels(): Promise<string[]> {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const resp = await undiciFetch(`${this.config.ollamaBaseUrl}/api/tags`, {
                    signal: AbortSignal.timeout(15000)
                });
                if (resp.ok) {
                    const data = await resp.json() as { models?: Array<{ name: string }> };
                    return (data.models || []).map(m => m.name);
                }
            } catch {
                if (attempt === 3) return [];
                await new Promise(res => setTimeout(res, 2000 * attempt));
            }
        }
        return [];
    }


    /**
     * Implements ModelExecutor.callModel
     */
    async callModel(model: string, prompt: string, systemPrompt?: string, category?: string): Promise<ModelCallResult> {
        const result = await this.call({ model, prompt, systemPrompt, category });
        if (result.ok) {
            return { ok: true, value: { response: result.value.response } };
        }
        return { ok: false, value: { response: '' }, error: result.error };
    }

    async call(params: ModelCallParams): Promise<Result<ModelResponse>> {
        const startTime = Date.now();
        let provider: 'ollama' | 'huggingface' | 'gemini' | 'cloudflare' | 'fireworks' | 'openrouter' | 'unknown' = 'ollama';

        // Inject sovereign architectural constraints into all prompts
        const enforcedParams = {
            ...params,
            prompt: this.digest.inject(params.prompt)
        };

        let result: Result<ModelResponse>;

        const detectProvider = (model: string): string => {
            if (model.startsWith('gemini:')) return 'gemini';
            if (model.startsWith('huggingface:')) return 'huggingface';
            if (model.startsWith('fireworks:')) return 'fireworks';
            if (model.startsWith('openrouter:')) return 'openrouter';
            if (model.startsWith('@cf/') || model.includes('cloudflare')) return 'cloudflare';
            return 'ollama';
        };

        provider = detectProvider(enforcedParams.model) as any;
        const priority = TaskScheduler.mapPriority(enforcedParams.yaoState || (globalThis as any).yaoState || YaoState.YoungYang);
        const timeout = this.getTimeoutByYaoState(enforcedParams.yaoState);

        result = await TaskScheduler.getInstance().schedule(
            provider,
            priority,
            async () => {
                if (provider === 'gemini') {
                    return await this.callGemini(enforcedParams, startTime);
                } else if (provider === 'huggingface') {
                    return await this.callHuggingFace(enforcedParams, startTime);
                } else if (provider === 'fireworks') {
                    return await this.callFireworks(enforcedParams, startTime);
                } else if (provider === 'openrouter') {
                    return await this.callOpenRouter(enforcedParams, startTime);
                } else if (provider === 'cloudflare') {
                    return await this.callCloudflare(enforcedParams, startTime);
                } else {
                    return await this.callOllama(enforcedParams, startTime);
                }
            },
            timeout
        );

        // Record interaction to D:\ training substrate (Skip for System Pulse)
        const latency = Date.now() - startTime;
        if (!enforcedParams.isSystemPulse) {
            this.trainingCollector.recordInteraction({
                model: enforcedParams.model,
                provider,
                category: enforcedParams.category as any,
                prompt: enforcedParams.prompt.substring(0, 2000),
                response: result.ok ? result.value.response.substring(0, 2000) : '',
                latencyMs: latency,
                tokenCount: result.ok ? result.value.tokensUsed : undefined,
                success: result.ok,
                error: result.ok ? undefined : result.error?.message
            }).catch(() => { /* non-blocking */ });

            this.trainingCollector.recordMetric({
                model: enforcedParams.model,
                provider,
                latencyMs: latency,
                success: result.ok,
                tokenCount: result.ok ? result.value.tokensUsed : undefined
            }).catch(() => { /* non-blocking */ });
        }

        // Phase 6: Update ModelRolodex with call metrics (Skip for System Pulse)
        if (this.rolodex && !enforcedParams.isSystemPulse) {
            this.rolodex.recordCallResult(
                enforcedParams.model,
                ModelRolodex.toRolodexProvider(provider),
                result.ok,
                latency,
                result.ok ? result.value.tokensUsed : undefined
            );
        }

        // Sovereign FinOps: Record quota usage
        if (this.quotaTracker) {
            const quotaProvider = provider as QuotaProvider;
            const tokensUsed = result.ok ? (result.value.tokensUsed ?? 0) : 0;            this.quotaTracker.recordUsage(quotaProvider, tokensUsed, 1);
        }

        return result;
    }

    private getTimeoutByYaoState(yaoState?: YaoState): number {
        if (yaoState === undefined && (globalThis as any).yaoState !== undefined) {
            yaoState = (globalThis as any).yaoState;
        }
        if (yaoState === undefined) return 300_000; // Default 5 mins

        switch (yaoState) {
            case YaoState.OldYang:   // 3: Deep metamorphic change
            case YaoState.OldMixed:  // 4: Chaotic complexity
                return 86_400_000;   // 24 hours for deep sovereignty
            case YaoState.YoungYin:
                return 180_000; // 3m fast response
            case YaoState.YoungYang: // 2: Stable expansion
            case YaoState.OldYin:    // 1: Structural break
                return 3_600_000;    // 1 hour
            case YaoState.YoungMixed:// 5: Emerging
                return 600_000;     // 10 mins
            default:
                return 300_000;
        }
    }

    /**
     * Resilient Call: Automatically retries with a fallback model from the router if the first attempt fails.
     */
    async resilientCall(params: ModelCallParams & { maxRetries?: number }): Promise<Result<ModelResponse>> {
        let attempts = 0;
        const maxRetries = params.maxRetries ?? 2;
        let lastError: Error | undefined;
        let cascadeIndex = -1;
        let failoverSequence: string[] = [];

        while (attempts <= maxRetries) {
            const result = await this.call(params);
            if (result.ok) return result;

            lastError = result.error;
            attempts++;

            if (attempts <= maxRetries && this.router) {
                logger.warn({ model: params.model, attempt: attempts }, 'Model call failed, seeking fallback...');
                this.router.recordFailure(params.model);

                // Phase 2: If a tier is explicitly provided, use the tier's failover sequence directly
                if (params.tier) {
                    if (failoverSequence.length === 0) {
                        failoverSequence = Array.from(new Set(this.router.getFailoverSequence(params.tier)));
                        cascadeIndex = failoverSequence.indexOf(params.model);
                        if (cascadeIndex === -1) cascadeIndex = 0;
                    }
                    if (cascadeIndex < failoverSequence.length - 1) {
                        cascadeIndex++;
                        params = { ...params, model: failoverSequence[cascadeIndex] };
                        logger.info({ nextModel: params.model, tier: params.tier }, 'Tier-aware cascade to next substrate');
                    } else {
                        logger.error({ tier: params.tier }, 'All substrates in tier exhausted');
                        break;
                    }
                } else {
                    // Legacy Phase 72/76.3 logic: Deduplicate sequence and advance index explicitly
                    if (failoverSequence.length === 0) {
                        const currentComplexity = await this.router.classify(params.prompt);
                        const isMaster = params.model === this.config.masterReasoningModel || params.model === this.config.masterFallbackModel || params.model === this.config.masterLocalModel || params.model === this.config.orchestratorModel;

                        const decision = await this.router.route(isMaster ? 'Orchestrator' : currentComplexity);
                        failoverSequence = Array.from(new Set(this.router.getFailoverSequence(decision.tier)));
                        cascadeIndex = failoverSequence.indexOf(params.model);
                    }

                    if (cascadeIndex !== -1 && cascadeIndex < failoverSequence.length - 1) {
                        cascadeIndex++;
                        params = { ...params, model: failoverSequence[cascadeIndex] };
                        logger.info({ nextModel: params.model }, 'Cascading to next model in sequence');
                    } else {
                        // Fallback to standard routing if not in sequence or at end
                        const currentComplexity = await this.router.classify(params.prompt);
                        const newRoute = await this.router.route(currentComplexity);
                        if (newRoute.model === params.model) break;
                        params = { ...params, model: newRoute.model };
                    }
                }
            }
        }

        // All retries exhausted Ã¢â‚¬â€ invoke EndpointHealer before final failure
        const provider: 'ollama' | 'huggingface' | 'gemini' | 'cloudflare' | 'fireworks' | 'openrouter' | 'unknown' = params.model.startsWith('gemini:') ? 'gemini'
            : params.model.startsWith('huggingface:') ? 'huggingface'
                : params.model.startsWith('fireworks:') ? 'fireworks'
                    : params.model.startsWith('openrouter:') ? 'openrouter'
                        : params.model.startsWith('@cf/') || params.model.includes('cloudflare') ? 'cloudflare'
                            : 'ollama';
        const diagnostic = await this.healer.diagnoseAndHeal(provider, lastError?.message || 'Unknown', params.model);

        if (diagnostic.resolved) {
            // One final attempt after healing
            logger.info({ resolution: diagnostic.resolution }, 'EndpointHealer resolved issue Ã¢â‚¬â€ retrying...');
            const finalAttempt = await this.call(params);

            // Phase 56: Persistent Training Loop - Record Error Fix
            this.trainingCollector.recordErrorFix({
                errorMessage: lastError?.message || 'Unknown',
                resolution: diagnostic.resolution,
                model: params.model,
                success: finalAttempt.ok
            }).catch(() => { /* Non-blocking training persistence */ });

            if (finalAttempt.ok) return finalAttempt;
        }

        return { ok: false, error: lastError || new Error('Max retries exceeded Ã¢â‚¬â€ EndpointHealer could not resolve') };
    }

    async embed(text: string, modelOverride?: string): Promise<Result<Float32Array>> {
        const model = modelOverride || this.config.embeddingModel || 'qwen3-embedding:latest';

        let result: Result<Float32Array>;
        if (model && model.startsWith('gemini:')) {
            result = await this.embedGemini(text);
        } else {
            result = await this.embedOllama(text, model);
            
            // Phase 108/114: Real Resilient Embedding Fallback
            if (!result.ok && this.config.secondaryCloudApiKey) {
                logger.warn({ model, error: result.error?.message }, 'Primary local embedding failed. Attempting Gemini fallback substrate...');
                const geminiFallback = await this.embedGemini(text);
                if (geminiFallback.ok) {
                    logger.info('Gemini embedding fallback successful.');
                    return geminiFallback;
                } else {
                    logger.error({ error: geminiFallback.error?.message }, 'Gemini embedding fallback also failed (Quota exhausted or network down).');
                }
            } else if (!result.ok) {
                 logger.error({ model, error: result.error?.message }, 'Primary local embedding failed. Gemini fallback disabled (No API Key).');
            }
        }

        return result;
    }

    private async callGemini(params: ModelCallParams, startTime: number): Promise<Result<ModelResponse>> {
        const apiKey = this.config.secondaryCloudApiKey;
        if (!apiKey) {
            return { ok: false, error: new Error('SECONDARY_CLOUD_API_KEY not set Ã¢â‚¬â€ cannot call cloud substrate') };
        }

        // Tiered Gemini Fallback Sequence
        const primaryModelId = params.model.replace('gemini:', '');
        const fallbackSequence = [
            primaryModelId,
            this.config.geminiFlashModel,
            'gemini-1.5-flash-001',
            this.config.geminiProModel
        ];

        // Deduplicate
        const uniqueSequence = Array.from(new Set(fallbackSequence));
        let lastError: Error | undefined;

        for (const modelId of uniqueSequence) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

            const messages: Array<{ role: string; parts: Array<{ text: string }> }> = [];

            if (params.systemPrompt) {
                messages.push({ role: 'user', parts: [{ text: params.systemPrompt }] });
                messages.push({ role: 'model', parts: [{ text: 'Understood.' }] });
            }

            messages.push({ role: 'user', parts: [{ text: params.prompt }] });

            const body = {
                contents: messages,
                generationConfig: {
                    temperature: params.temperature ?? 0.3,
                    maxOutputTokens: params.maxTokens ?? 8192
                }
            };

            try {
                let response = await undiciFetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                    signal: AbortSignal.timeout(this.getTimeoutByYaoState(params.yaoState))
                });

                if (!response.ok) {
                    const errorText = await response.text();

                    // If 404, try next model in sequence
                    if (response.status === 404) {
                        logger.warn({ modelId, status: 404 }, 'Gemini model not found (404), trying next in sequence...');
                        lastError = new Error(`Gemini model ${modelId} not found: ${errorText}`);
                        continue;
                    }

                    logger.warn({ status: response.status, errorText }, 'Secondary Cloud API failed. Attempting substrate-specific CLI fallback...');

                    try {
                        const { stdout } = await execAsync('gcloud auth print-access-token');
                        const token = stdout.trim();
                        if (token) {
                            const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent`;
                            response = await undiciFetch(fallbackUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify(body),
                                signal: AbortSignal.timeout(this.getTimeoutByYaoState(params.yaoState))
                            });

                            if (!response.ok) {
                                const fallbackErrorText = await response.text();
                                lastError = new Error(`Gemini API & GCloud fallback failed: ${fallbackErrorText}`);
                                continue;
                            }
                        } else {
                            lastError = new Error(`Gemini API ${response.status}: ${errorText}`);
                            continue;
                        }
                    } catch (fallbackErr) {
                        logger.error({ err: fallbackErr }, 'GCloud CLI not available or auth failed');
                        lastError = new Error(`Gemini API ${response.status}: ${errorText}`);
                        continue;
                    }
                }

                const data = await response.json() as {
                    candidates?: Array<{
                        content?: { parts?: Array<{ text?: string }> };
                        finishReason?: string;
                    }>;
                    usageMetadata?: { totalTokenCount?: number };
                };

                const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
                const latency = Date.now() - startTime;

                logger.debug({ model: `gemini:${modelId}`, latency, tokens: data.usageMetadata?.totalTokenCount }, 'Secondary Cloud call complete');

                return {
                    ok: true,
                    value: {
                        response: text,
                        tokensUsed: data.usageMetadata?.totalTokenCount,
                        metadata: {
                            model: `gemini:${modelId}`,
                            latency
                        }
                    }
                };
            } catch (err) {
                logger.error({ err, modelId }, 'Secondary Cloud network error for specific Gemini model');
                lastError = err as Error;
            }
        }

        return { ok: false, error: lastError || new Error('All Gemini retry attempts failed.') };
    }

    private async callOllama(params: ModelCallParams, startTime: number): Promise<Result<ModelResponse>> {
        const url = `${this.config.ollamaBaseUrl}/api/generate`;

        const fullPrompt = params.systemPrompt
            ? `${params.systemPrompt}\n\n${params.prompt}`
            : params.prompt;

        const body = {
            model: params.model,
            prompt: fullPrompt,
            stream: false,
            images: params.images, // Multimodal support
            format: params.format === 'text' ? undefined : (params.format === 'json' ? 'json' : (this.config.outputFormat === 'json' ? 'json' : undefined)),
            options: {
                temperature: params.temperature ?? this.config.temperature,
                top_p: this.config.topP,
                repeat_penalty: this.config.repeatPenalty,
                num_ctx: this.config.numCtx,
                stop: this.config.stopSequences,
                num_predict: params.maxTokens ?? 4096
            }
        };

        try {
            const controller = new AbortController();
            const signal = params.signal || AbortSignal.timeout(86_400_000); // 24 hours
            const combinedSignal = AbortSignal.any([signal, controller.signal]);

            const response = await undiciFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
                // Massive local timeout: natively handled by Undici dispatcher
                dispatcher: this.customAgent,
                signal: combinedSignal
            } as any);

            // LOGGING LOOP: The Persistence Heartbeat

            const persistenceInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const minutes = Math.floor(elapsed / 60);
                const seconds = elapsed % 60;
                logger.info({
                    model: params.model,
                    elapsed: `${minutes}m ${seconds}s`,
                    pulse: 'STILL_REASONING'
                }, 'Î“Â¥Ã¿ Neural Pulse: Deep substrate calculation actively thinking...');
            }, 30000); // Pulse every 30s instead of 60s

            try {
                if (!response.ok) {
                    clearInterval(persistenceInterval);
                    const errorText = await response.text();
                    logger.error({ status: response.status, model: params.model }, 'Ollama API error');

                    // Activate cooldown on 429 rate limit responses or 500 server errors
                    if (response.status === 429 || response.status === 500) {
                        logger.warn({ model: params.model, status: response.status }, 'Ollama substrate degraded Ã¢â‚¬â€ activating fallback');
                        this.router?.activateOllamaCooldown();
                    }

                    return { ok: false, error: new Error(`Ollama ${response.status}: ${errorText}`) };
                }

                const data = await response.json() as { response?: string; done?: boolean };
                clearInterval(persistenceInterval);
                const latency = Date.now() - startTime;

                logger.debug({ model: params.model, latency }, 'Ollama call complete');

                return {
                    ok: true,
                    value: {
                        response: data.response ?? '',
                        model: params.model,
                        latency
                    }
                };
            } catch (err) {
                const error = err as Error;
                const errorMsg = error.message?.toLowerCase() ?? '';
                clearInterval(persistenceInterval);

                // Check if this looks like a cooldown/ratelimit error
                if (errorMsg.includes('rate limit') ||
                    errorMsg.includes('cooldown') ||
                    errorMsg.includes('429') ||
                    errorMsg.includes('too many requests') ||
                    errorMsg.includes('resource exhausted') ||
                    errorMsg.includes('connect') ||
                    errorMsg.includes('econnrefused') ||
                    errorMsg.includes('timeout')) {
                    logger.warn({ model: params.model, error: errorMsg }, 'Ollama issue detected Ã¢â‚¬â€ activating Hugging Face fallback');
                    this.router?.activateOllamaCooldown();
                }

                logger.error({ err: error, model: params.model }, 'Ollama network error');
                return { ok: false, error };
            }
        } catch (err) {
            logger.error({ err, model: params.model }, 'Critical error in Ollama call wrapper');
            return { ok: false, error: err as Error };
        }
    }

    private async callHuggingFace(params: ModelCallParams, startTime: number): Promise<Result<ModelResponse>> {
        const apiKey = this.config.primaryCloudApiKey;
        if (!apiKey) {
            return { ok: false, error: new Error('PRIMARY_CLOUD_API_KEY not set Ã¢â‚¬â€ cannot call primary cloud substrate') };
        }

        // Format: huggingface:provider/model-name (e.g., huggingface:openai-compat/kimi-k2.6-thinking)
        // HF Router API: model goes in the request body, NOT the URL path
        const modelPath = params.model.replace('huggingface:', '');
        const url = `https://router.huggingface.co/v1/chat/completions`;

        const messages: Array<{ role: string; content: string }> = [];

        if (params.systemPrompt) {
            messages.push({ role: 'system', content: params.systemPrompt });
        }

        messages.push({ role: 'user', content: params.prompt });

        const body = {
            model: modelPath,
            messages,
            max_tokens: params.maxTokens ?? 4096,
            temperature: params.temperature ?? 0.7,
            stream: false
        };

        try {
            const response = await undiciFetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(this.getTimeoutByYaoState(params.yaoState))
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error({ status: response.status, errorText }, 'Primary Cloud API error');
                return { ok: false, error: new Error(`Primary Cloud API ${response.status}: ${errorText}`) };
            }

            const data = await response.json() as {
                choices?: Array<{
                    message?: { content?: string };
                    finish_reason?: string;
                }>;
                usage?: { total_tokens?: number };
            };

            const text = data.choices?.[0]?.message?.content ?? '';
            const latency = Date.now() - startTime;

            logger.debug({ model: params.model, latency, tokens: data.usage?.total_tokens }, 'Primary Cloud call complete');

            return {
                ok: true,
                value: {
                    response: text,
                    model: params.model,
                    latency,
                    tokensUsed: data.usage?.total_tokens
                }
            };
        } catch (err) {
            const error = err as Error;
            const errorMsg = error.message?.toLowerCase() ?? '';

            if (errorMsg.includes('429') ||
                errorMsg.includes('too many requests') ||
                errorMsg.includes('rate limit') ||
                errorMsg.includes('timeout')) {
                logger.warn({ model: params.model, error: errorMsg }, 'Hugging Face ratelimit/cooldown hit');
                if (this.router && typeof this.router.activateHfCooldown === 'function') {
                    this.router.activateHfCooldown();
                }
            }

            logger.error({ err }, 'Primary Cloud network error');
            return { ok: false, error };
        }
    }

    private async callCloudflare(params: ModelCallParams, startTime: number): Promise<Result<ModelResponse>> {
        const accountId = this.config.cloudflareAccountId;
        const apiToken = this.config.cloudflareApiToken;
        const authEmail = this.config.cloudflareAuthEmail;
        const modelId = params.model.includes('cloudflare:')
            ? params.model.replace('cloudflare:', '')
            : params.model;

        if (!accountId || !apiToken) {
            return {
                ok: false,
                error: new Error('Cloudflare credentials (CLOUDFLARE_ACCOUNT_ID/API_TOKEN) missing from substrate.')
            };
        }

        const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`;

        // Phase 95: Support Global API Key (X-Auth headers) or Scoped Token (Bearer)
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (authEmail) {
            headers['X-Auth-Email'] = authEmail;
            headers['X-Auth-Key'] = apiToken;
        } else {
            headers['Authorization'] = `Bearer ${apiToken}`;
        }
        const body = {
            messages: [
                ...(params.systemPrompt ? [{ role: 'system', content: params.systemPrompt }] : []),
                { role: 'user', content: params.prompt }
            ],
            stream: false
        };

        try {
            const response = await undiciFetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body),
                signal: AbortSignal.timeout(this.getTimeoutByYaoState(params.yaoState))
            });

            if (!response.ok) {
                const errorText = await response.text();
                logger.error({ status: response.status, model: params.model }, 'Cloudflare AI error');
                return { ok: false, error: new Error(`Cloudflare ${response.status}: ${errorText}`) };
            }

            const data = await response.json() as {
                result: { response?: string } | string;
                errors?: Array<{ message: string }>;
                success: boolean;
            };

            if (!data.success) {
                return { ok: false, error: new Error(`Cloudflare API error: ${data.errors?.[0]?.message || 'Unknown'}`) };
            }

            const text = typeof data.result === 'string' ? data.result : (data.result.response || '');
            const latency = Date.now() - startTime;

            logger.debug({ model: params.model, latency }, 'Cloudflare call complete');

            return {
                ok: true,
                value: {
                    response: text,
                    model: params.model,
                    latency
                }
            };
        } catch (err) {
            logger.error({ err, model: params.model }, 'Cloudflare network error');
            return { ok: false, error: err as Error };
        }
    }

    private async callFireworks(params: ModelCallParams, startTime: number): Promise<Result<ModelResponse>> {
        const apiKey = this.config.fireworksApiKey;
        if (!apiKey) {
            return { ok: false, error: new Error('fireworksApiKey not set in substrate config') };
        }

        const modelPath = params.model.replace('fireworks:', '');
        const url = `https://api.fireworks.ai/inference/v1/chat/completions`;

        const messages: Array<{ role: string; content: string }> = [];
        if (params.systemPrompt) messages.push({ role: 'system', content: params.systemPrompt });
        messages.push({ role: 'user', content: params.prompt });

        try {
            const response = await undiciFetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: `accounts/fireworks/models/${modelPath}`,
                    messages,
                    max_tokens: params.maxTokens ?? 4096,
                    temperature: params.temperature ?? 0.7
                }),
                signal: AbortSignal.timeout(this.getTimeoutByYaoState(params.yaoState))
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { ok: false, error: new Error(`Fireworks API ${response.status}: ${errorText}`) };
            }

            const data = await response.json() as any;
            const text = data.choices?.[0]?.message?.content ?? '';
            const latency = Date.now() - startTime;
            logger.info({ model: params.model, latency }, 'Fireworks AI call complete');

            return {
                ok: true,
                value: {
                    response: text,
                    model: params.model,
                    latency,
                    tokensUsed: data.usage?.total_tokens
                }
            };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    private async callOpenRouter(params: ModelCallParams, startTime: number): Promise<Result<ModelResponse>> {
        const apiKey = this.config.openRouterApiKey;
        if (!apiKey) {
            return { ok: false, error: new Error('openRouterApiKey not set in substrate config') };
        }

        const modelPath = params.model.replace('openrouter:', '');
        const url = `https://openrouter.ai/api/v1/chat/completions`;

        const messages: Array<{ role: string; content: string }> = [];
        if (params.systemPrompt) messages.push({ role: 'system', content: params.systemPrompt });
        messages.push({ role: 'user', content: params.prompt });

        try {
            const response = await undiciFetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                    'HTTP-Referer': 'https://github.com/Kbro1989/pog2-sovereign',
                    'X-Title': 'POG2 Sovereign'
                },
                body: JSON.stringify({
                    model: modelPath,
                    messages,
                    max_tokens: params.maxTokens ?? 4096,
                    temperature: params.temperature ?? 0.7
                }),
                signal: AbortSignal.timeout(this.getTimeoutByYaoState(params.yaoState))
            });

            if (!response.ok) {
                const errorText = await response.text();
                return { ok: false, error: new Error(`OpenRouter API ${response.status}: ${errorText}`) };
            }

            const data = await response.json() as any;
            const text = data.choices?.[0]?.message?.content ?? '';
            const latency = Date.now() - startTime;
            logger.info({ model: params.model, latency }, 'OpenRouter call complete');

            return {
                ok: true,
                value: {
                    response: text,
                    model: params.model,
                    latency,
                    tokensUsed: data.usage?.total_tokens
                }
            };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }

    public async callCloudflareTTS(text: string, options: { speed?: number; pitch?: number } = {}): Promise<Result<Buffer>> {
        return TaskScheduler.getInstance().schedule(
            'cloudflare',
            3, // Normal Priority (YoungYang)
            async () => {
                const accountId = this.config.cloudflareAccountId;
                const apiToken = this.config.cloudflareApiToken;
                const authEmail = this.config.cloudflareAuthEmail;
                const modelId = '@cf/myshell-ai/melotts'; // Known documented TTS model

                if (!accountId || !apiToken) {
                    return {
                        ok: false,
                        error: new Error('Cloudflare credentials missing (CLOUDFLARE_ACCOUNT_ID/API_TOKEN) Ã¢â‚¬â€ cannot generate TTS.')
                    };
                }

                const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`;

                // Phase 95: Support Global API Key (X-Auth headers) or Scoped Token (Bearer)
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json'
                };
                if (authEmail) {
                    headers['X-Auth-Email'] = authEmail;
                    headers['X-Auth-Key'] = apiToken;
                } else {
                    headers['Authorization'] = `Bearer ${apiToken}`;
                }

                try {
                    const response = await undiciFetch(url, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            text: text, // MeloTTS uses 'text', not 'prompt'
                            speaker: 'en-us-male-1', // Required speaker ID
                            speed: options.speed || 1.0,
                            pitch: options.pitch || 1.0
                        }),
                        signal: AbortSignal.timeout(300_000)
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        logger.error({ status: response.status }, 'Cloudflare TTS error response');
                        return { ok: false, error: new Error(`Cloudflare TTS ${response.status}: ${errorText}`) };
                    }

                    const contentType = response.headers.get('content-type') || '';

                    if (contentType.includes('application/json')) {
                        const data = await response.json() as { result?: { audio?: string }, success: boolean, errors?: any[] };
                        if (data.success && data.result?.audio) {
                            const buffer = Buffer.from(data.result.audio, 'base64');
                            logger.info({ bytes: buffer.length, format: 'json-base64' }, 'Cloudflare TTS generation complete (decoded from Base64)');
                            return ok(buffer);
                        } else {
                            const errorMsg = data.errors?.[0]?.message || 'Unknown JSON error from Cloudflare TTS';
                            return { ok: false, error: new Error(errorMsg) };
                        }
                    } else {
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        logger.info({ bytes: buffer.length, format: 'binary' }, 'Cloudflare TTS generation complete (binary)');
                        return ok(buffer);
                    }
                } catch (err) {
                    logger.error({ err }, 'Cloudflare TTS network error');
                    return { ok: false, error: err as Error };
                }
            },
            300_000
        );
    }

    /**
     * callCloudflareMusicGen - Generates audio bytes from a text prompt.
     */
    public async callCloudflareMusicGen(params: { prompt: string; duration?: number }): Promise<Result<Buffer>> {
        return TaskScheduler.getInstance().schedule(
            'cloudflare',
            3, // Normal Priority
            async () => {
                const accountId = this.config.cloudflareAccountId;
                const apiToken = this.config.cloudflareApiToken;
                const authEmail = this.config.cloudflareAuthEmail;
                const modelId = '@cf/meta/musicgen';

                if (!accountId || !apiToken) {
                    return {
                        ok: false,
                        error: new Error('Cloudflare credentials missing (CLOUDFLARE_ACCOUNT_ID/API_TOKEN) Ã¢â‚¬â€ cannot generate score.')
                    };
                }

                const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`;
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json'
                };

                if (authEmail) {
                    headers['X-Auth-Email'] = authEmail;
                    headers['X-Auth-Key'] = apiToken;
                } else {
                    headers['Authorization'] = `Bearer ${apiToken}`;
                }

                try {
                    const response = await undiciFetch(url, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            prompt: params.prompt,
                            duration: params.duration || 20
                        }),
                        signal: AbortSignal.timeout(600_000) // 10m for music generation
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        logger.error({ status: response.status }, 'Cloudflare MusicGen error response');
                        return { ok: false, error: new Error(`Cloudflare MusicGen ${response.status}: ${errorText}`) };
                    }

                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        const data = await response.json() as { result?: { audio?: string }, success: boolean, errors?: any[] };
                        if (data.success && data.result?.audio) {
                            const buffer = Buffer.from(data.result.audio, 'base64');
                            logger.info({ bytes: buffer.length, format: 'json-base64' }, 'Cloudflare MusicGen complete (decoded)');
                            return ok(buffer);
                        } else {
                            const errorMsg = data.errors?.[0]?.message || 'Unknown JSON error from Cloudflare MusicGen';
                            return { ok: false, error: new Error(errorMsg) };
                        }
                    } else {
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        logger.info({ bytes: buffer.length, format: 'binary' }, 'Cloudflare MusicGen complete (binary)');
                        return ok(buffer);
                    }
                } catch (err) {
                    logger.error({ err }, 'Cloudflare MusicGen network error');
                    return { ok: false, error: err as Error };
                }
            },
            600_000
        );
    }

    /**
     * callCloudflareImageGen - Generates image bytes from a text prompt.
     * Supports Flux, Stable Diffusion, etc.
     */
    public async callCloudflareImageGen(params: { prompt: string; model?: string; num_steps?: number }): Promise<Result<Buffer>> {
        return TaskScheduler.getInstance().schedule(
            'cloudflare',
            3, // Normal Priority
            async () => {
                const accountId = this.config.cloudflareAccountId;
                const apiToken = this.config.cloudflareApiToken;
                const authEmail = this.config.cloudflareAuthEmail;
                const modelId = params.model || '@cf/black-forest-labs/flux-1-schnell';

                if (!accountId || !apiToken) {
                    return {
                        ok: false,
                        error: new Error('Cloudflare credentials missing (CLOUDFLARE_ACCOUNT_ID/API_TOKEN) Ã¢â‚¬â€ cannot generate image.')
                    };
                }

                const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${modelId}`;
                const headers: Record<string, string> = {
                    'Content-Type': 'application/json'
                };

                if (authEmail) {
                    headers['X-Auth-Email'] = authEmail;
                    headers['X-Auth-Key'] = apiToken;
                } else {
                    headers['Authorization'] = `Bearer ${apiToken}`;
                }

                try {
                    const response = await undiciFetch(url, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({
                            prompt: params.prompt,
                            num_steps: params.num_steps || 20
                        }),
                        signal: AbortSignal.timeout(600_000) // 10m for image generation
                    });

                    if (!response.ok) {
                        const errorText = await response.text();
                        logger.error({ status: response.status, modelId }, 'Cloudflare ImageGen error response');
                        return { ok: false, error: new Error(`Cloudflare ImageGen ${response.status}: ${errorText}`) };
                    }

                    const contentType = response.headers.get('content-type') || '';
                    if (contentType.includes('application/json')) {
                        const data = await response.json() as { result?: { image?: string }, success: boolean, errors?: any[] };
                        if (data.success && data.result?.image) {
                            const buffer = Buffer.from(data.result.image, 'base64');
                            logger.info({ bytes: buffer.length, format: 'json-base64' }, 'Cloudflare ImageGen complete (decoded)');
                            return ok(buffer);
                        } else {
                            const errorMsg = data.errors?.[0]?.message || 'Unknown JSON error from Cloudflare ImageGen';
                            return { ok: false, error: new Error(errorMsg) };
                        }
                    } else {
                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        logger.info({ bytes: buffer.length, format: 'binary' }, 'Cloudflare ImageGen complete (binary)');
                        return ok(buffer);
                    }
                } catch (err) {
                    logger.error({ err }, 'Cloudflare ImageGen network error');
                    return { ok: false, error: err as Error };
                }
            },
            600_000
        );
    }

    private async embedGemini(text: string): Promise<Result<Float32Array>> {
        const apiKey = this.config.secondaryCloudApiKey;
        if (!apiKey) return { ok: false, error: new Error('SECONDARY_CLOUD_API_KEY not set') };

        // Tiered Embedding Fallback Sequence
        const primaryModel = this.config.geminiEmbeddingModel;
        const fallbackSequence = [
            primaryModel,
            'text-embedding-004',
            'models/text-embedding-004',
            'gemini-embedding-001',
            'models/embedding-001'
        ];

        const uniqueSequence = Array.from(new Set(fallbackSequence));
        let lastError: Error | undefined;

        for (const modelId of uniqueSequence) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:embedContent?key=${apiKey}`;

            try {
                const response = await undiciFetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: { parts: [{ text }] } }),
                    signal: AbortSignal.timeout(this.getTimeoutByYaoState())
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    if (response.status === 404) {
                        logger.warn({ modelId }, 'Gemini embedding model not found (404), trying next...');
                        lastError = new Error(`Gemini embed 404: ${modelId} - ${errorText}`);
                        continue;
                    }
                    return { ok: false, error: new Error(`Gemini embed error ${response.status}: ${errorText}`) };
                }

                const data = await response.json() as { embedding?: { values?: number[] } };
                const values = data.embedding?.values ?? [];
                if (values.length === 0) {
                    lastError = new Error(`Gemini embed ${modelId} returned empty values.`);
                    continue;
                }

                logger.debug({ modelId }, 'Gemini embedding complete');
                return { ok: true, value: new Float32Array(values) };
            } catch (err) {
                logger.error({ err, modelId }, 'Gemini embedding network failure');
                lastError = err as Error;
            }
        }

        return { ok: false, error: lastError || new Error('All Gemini embedding attempts failed.') };
    }

    private async embedOllama(text: string, model: string): Promise<Result<Float32Array>> {
        const url = `${this.config.ollamaBaseUrl}/api/embeddings`;

        try {
            const response = await undiciFetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model,
                    prompt: text,
                    options: {
                        num_ctx: this.config.numCtx,
                        temperature: 0.0 // Embeddings should generally be completely deterministic
                    }
                }),
                signal: AbortSignal.timeout(this.getTimeoutByYaoState())
            });

            if (!response.ok) {
                return { ok: false, error: new Error(`Ollama embed error: ${response.status}`) };
            }

            const data = await response.json() as { embedding?: number[] };
            const values = data.embedding ?? [];
            return { ok: true, value: new Float32Array(values) };
        } catch (err) {
            return { ok: false, error: err as Error };
        }
    }


    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const ollamaBase = this.config.ollamaBaseUrl || 'http://localhost:11434';
        let ollamaOnline = false;
        let modelCount = 0;
        
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const response = await undiciFetch(`${ollamaBase}/api/tags`, { signal: AbortSignal.timeout(15000) });
                if (response.ok) {
                    const data = await response.json() as { models?: any[] };
                    modelCount = data.models?.length || 0;
                    ollamaOnline = true;
                    break;
                }
            } catch (e) {
                if (attempt === 3) {
                    ollamaOnline = false;
                } else {
                    await new Promise(res => setTimeout(res, 2000 * attempt));
                }
            }
        }

        const cloudKeys = [
            { name: 'Gemini', key: this.config.secondaryCloudApiKey },
            { name: 'HuggingFace', key: this.config.primaryCloudApiKey },
            { name: 'Cloudflare', key: this.config.cloudflareApiToken }
        ];
        const activeCloud = cloudKeys.filter(k => !!k.key).map(k => k.name).join(', ');

        return {
            online: ollamaOnline, 
            details: `ModelClient: ${ollamaOnline ? 'ONLINE' : 'DEGRADED'} (Local: ${modelCount} models | Cloud: ${activeCloud || 'None'})`
        };
    }
}
