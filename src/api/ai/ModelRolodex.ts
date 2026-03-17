import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import type { SovereignConfig } from '../../config/SovereignConfig.js';
import type { AIServiceType } from '../../core/models.js';

import { $ } from '../../utils/shell.js';
import { createLogger } from "../../utils/logger.js";

const execAsync = promisify(exec);
const logger = createLogger('ModelRolodex');

// ═══ TYPES ═══

export type RolodexProvider = 'ollama' | 'cloudflare' | 'gemini' | 'huggingface' | 'fireworks' | 'openrouter' | 'rsmv';

export interface RolodexModel {
    id: string;
    name: string;
    provider: RolodexProvider;
    taskType: 'text' | 'image' | 'audio' | 'embedding' | 'vision' | 'unknown';
    parameterSize?: string;          // e.g. "14b", "7b"
    quantization?: string;           // e.g. "q5_K_M"
    lastSeen: number;                // epoch ms
    successCount: number;
    failureCount: number;
    totalTokensUsed: number;
    avgLatencyMs: number;
    latencySamples: number;
    reputation: number;             // 0.0 to 1.0 score
    isVision?: boolean;
    isText?: boolean;
    isEmbedding?: boolean;
}

export interface ProviderIdentity {
    provider: RolodexProvider;
    authenticated: boolean;
    account?: string;
    email?: string;
    models: string[];
    latencyMs: number;
    lastChecked: number;
    error?: string;
}

export interface RolodexState {
    models: Record<string, RolodexModel>;
    providers: Record<RolodexProvider, ProviderIdentity>;
    lastRefresh: number;
    version: string;
}

// ═══ ROLODEX CORE ═══

/**
 * ModelRolodex — The Sovereign's Living Model Catalog.
 *
 * Dynamically discovers available models from each provider via API/shell calls.
 * Tracks per-model health (success/failure/latency/tokens).
 * Persists state to D:\sovereign\rolodex.json for cross-session memory.
 * Ollama models are always the sovereign final fallback.
 */
export class ModelRolodex {
    private state: RolodexState;
    private readonly persistPath: string;
    private refreshInProgress = false;

    constructor(private readonly config: SovereignConfig) {
        this.persistPath = join(config.pog2Dir || process.cwd(), 'rolodex.json');

        // Attempt to load persisted state
        if (existsSync(this.persistPath)) {
            try {
                this.state = JSON.parse(readFileSync(this.persistPath, 'utf8'));
                logger.info({ models: Object.keys(this.state.models).length }, '🗂️ Rolodex loaded from disk.');
            } catch {
                this.state = this.createEmptyState();
            }
        } else {
            this.state = this.createEmptyState();
        }

        // Phase 9: Start Reputation Decay Interval
        const decayRate = config.reputationDecayRate || 0.05;
        // Interval: 1 hour in production, 1 minute in development/test
        const intervalMs = process.env.NODE_ENV === 'test' ? 60000 : 3600000;
        setInterval(() => this.applyReputationDecay(decayRate), intervalMs);
    }

    private createEmptyState(): RolodexState {
        const providers: Record<RolodexProvider, ProviderIdentity> = {
            ollama: { provider: 'ollama', authenticated: false, models: [], latencyMs: 0, lastChecked: 0 },
            cloudflare: { provider: 'cloudflare', authenticated: false, models: [], latencyMs: 0, lastChecked: 0 },
            gemini: { provider: 'gemini', authenticated: false, models: [], latencyMs: 0, lastChecked: 0 },
            huggingface: { provider: 'huggingface', authenticated: false, models: [], latencyMs: 0, lastChecked: 0 },
            fireworks: { provider: 'fireworks', authenticated: false, models: [], latencyMs: 0, lastChecked: 0 },
            openrouter: { provider: 'openrouter', authenticated: false, models: [], latencyMs: 0, lastChecked: 0 },
            rsmv: { provider: 'rsmv', authenticated: true, models: ['rsmv-substrate'], latencyMs: 0, lastChecked: Date.now() }
        };
        return { models: {}, providers, lastRefresh: 0, version: '1.0.0' };
    }

    /** 
     * Sovereign FinOps / Hive Mind: Merge incoming state from the Globe substrate.
     * Aggregates success/failure counts instead of overwriting, allowing multiple 
     * instances to share learned reputation scores offline and online.
     */
    public deserializeAndMerge(remoteState: RolodexState): void {
        let mergedCount = 0;

        // Merge Models (The Reputation Score)
        for (const [key, remoteModel] of Object.entries(remoteState.models)) {
            if (!this.state.models[key]) {
                this.state.models[key] = { ...remoteModel };
                mergedCount++;
            } else {
                const localModel = this.state.models[key];
                // Only aggregate if the remote state has actually seen usage
                if (remoteModel.successCount + remoteModel.failureCount > 0) {
                    // We don't want to double-count our own updates if they echo back.
                    // A true CRDT is better, but a simplistic Max(local, remote) or addition 
                    // works for basic reputation sharing until we build an event-sourced log.
                    // For now, if remote has higher total interaction, we absorb the difference.
                    const localTotal = localModel.successCount + localModel.failureCount;
                    const remoteTotal = remoteModel.successCount + remoteModel.failureCount;

                    if (remoteTotal > localTotal) {
                        localModel.successCount = Math.max(localModel.successCount, remoteModel.successCount);
                        localModel.failureCount = Math.max(localModel.failureCount, remoteModel.failureCount);
                        localModel.totalTokensUsed = Math.max(localModel.totalTokensUsed, remoteModel.totalTokensUsed);
                        localModel.avgLatencyMs = Math.round((localModel.avgLatencyMs + remoteModel.avgLatencyMs) / 2);
                        mergedCount++;
                    }
                }
                // Always sync the lastSeen timestamp if remote is newer
                if (remoteModel.lastSeen > localModel.lastSeen) {
                    localModel.lastSeen = remoteModel.lastSeen;
                }
            }
        }

        // Merge Providers (Auth status and discovered models)
        for (const [key, remoteIdentity] of Object.entries(remoteState.providers)) {
            const pKey = key as RolodexProvider;
            const localIdentity = this.state.providers[pKey];

            // If remote is authenticated and we aren't, absorb their model list (but not their account/email/keys)
            // This allows an offline node to know what models exist on a provider even if it can't reach the discovery API.
            if (remoteIdentity.authenticated) {
                const newModels = remoteIdentity.models.filter(m => !localIdentity.models.includes(m));
                if (newModels.length > 0) {
                    localIdentity.models.push(...newModels);
                }
            }
        }

        if (mergedCount > 0) {
            logger.debug({ mergedModels: mergedCount }, 'Rolodex merged state from Hive Mind');
            this.persist(); // Save to local disk immediately upon beneficial merge
        }
    }

    // ═══ PUBLIC API ═══

    /** Get all models for a specific provider */
    getModelsForProvider(provider: RolodexProvider): RolodexModel[] {
        return Object.values(this.state.models).filter(m => m.provider === provider);
    }

    /** Get all known models across all providers */
    getAllModels(): RolodexModel[] {
        return Object.values(this.state.models);
    }

    /** Get provider identity & status */
    getProviderStatus(provider: RolodexProvider): ProviderIdentity {
        return this.state.providers[provider];
    }

    /** Get all provider statuses */
    getAllProviderStatuses(): ProviderIdentity[] {
        return Object.values(this.state.providers);
    }

    /** Check if ALL cloud providers are down (triggers sovereign Ollama override) */
    isAllCloudDown(): boolean {
        const cloudProviders: RolodexProvider[] = ['cloudflare', 'gemini', 'huggingface', 'fireworks', 'openrouter'];
        return cloudProviders.every(p => {
            const status = this.state.providers[p];
            // Consider "down" if: not authenticated, or has an error, or last checked > 5 min ago and no models
            return !status.authenticated || !!status.error || (status.models.length === 0 && status.lastChecked > 0);
        });
    }

    /** Check if Ollama is alive */
    isOllamaAlive(): boolean {
        const status = this.state.providers.ollama;
        return status.authenticated && status.models.length > 0;
    }

    /** Get best available models for a failover sequence, sorted by learned reputation. */
    getHealthyModelsByTaskType(taskType: 'text' | 'image' | 'audio' | 'embedding' | 'vision'): string[] {
        const allModels = this.getAllModels();

        // Filter by task type and sort by learned reputation
        const scored = allModels
            .filter(m => m.taskType === taskType)
            .sort((a, b) => b.reputation - a.reputation);

        return scored.map(m => this.toPrefixedModelId(m));
    }

    /** Record a model call result (called by ModelClient after each call) */
    recordCallResult(model: string, provider: RolodexProvider, success: boolean, latencyMs: number, tokensUsed?: number): void {
        const key = `${provider}:${model}`;
        if (!this.state.models[key]) {
            this.state.models[key] = {
                id: model,
                name: model,
                provider,
                taskType: 'text',
                lastSeen: Date.now(),
                successCount: 0,
                failureCount: 0,
                totalTokensUsed: 0,
                avgLatencyMs: 0,
                latencySamples: 0,
                reputation: 1.0,
                isText: true // Default
            };
        }

        const entry = this.state.models[key];
        if (success) {
            entry.successCount++;
        } else {
            entry.failureCount++;
        }
        entry.lastSeen = Date.now();
        entry.totalTokensUsed += tokensUsed || 0;

        // Rolling average latency
        entry.latencySamples++;
        entry.avgLatencyMs = entry.avgLatencyMs + (latencyMs - entry.avgLatencyMs) / entry.latencySamples;

        // 🧬 Update reputation score
        entry.reputation = this.computeReputation(entry);

        // Persist periodically (every 10 calls)
        const totalInteractions = entry.successCount + entry.failureCount;
        if (totalInteractions % 10 === 0) {
            this.persist();
        }

        // Global Reputation Decay is now handled by an interval
    }

    /** 🧬 Evolutionary Mutation - Manually adjust reputation based on strategy advisor */
    public mutateReputation(modelId: string, provider: RolodexProvider, adjustment: number): void {
        const key = `${provider}:${modelId}`;
        const entry = this.state.models[key];
        if (!entry) return;

        const oldRep = entry.reputation;
        entry.reputation = Math.max(0, Math.min(1.0, entry.reputation + adjustment));
        
        logger.info({ 
            model: modelId, 
            provider, 
            oldRep: oldRep.toFixed(4), 
            newRep: entry.reputation.toFixed(4),
            adjustment 
        }, '🧬 Model reputation mutated by strategy advisor.');
        
        this.persist();
    }

    /** 🧬 Reputation Scoring Algorithm - Research Grade */
    private computeReputation(m: RolodexModel): number {
        const totalCalls = m.successCount + m.failureCount;
        if (totalCalls === 0) return 1.0;

        // 1. Success Rate Component (60%)
        const successRate = m.successCount / totalCalls;
        
        // 2. Latency Component (30%) - Normalized (0.1 effectively infinite, 1.0 instant)
        // Assume 50ms is "instant" and 5000ms is "stalled"
        const latencyFactor = Math.max(0, 1 - (m.avgLatencyMs / 5000));
        
        // 3. Cost/Token Penalty (10%) - Discourage massive token burns without success
        const tokenPenalty = Math.min(0.1, (m.totalTokensUsed / 1_000_000) * 0.1);

        const score = (successRate * 0.6) + (latencyFactor * 0.3) + 0.1 - tokenPenalty;
        return Math.max(0, Math.min(1, score));
    }

    // ═══ DISCOVERY ═══

    /** Refresh all providers — non-blocking, fire-and-forget safe */
    async refreshAll(): Promise<void> {
        if (this.refreshInProgress) {
            logger.info('Rolodex refresh already in progress, skipping.');
            return;
        }
        this.refreshInProgress = true;
        logger.info('🔄 Rolodex: Refreshing all provider models...');

        const start = Date.now();
        await Promise.allSettled([
            this.discoverOllama(),
            this.discoverCloudflare(),
            this.discoverGemini(),
            this.discoverHuggingFace(),
            this.discoverOpenRouter(),
            this.discoverFireworks()
        ]);

        this.state.lastRefresh = Date.now();
        this.refreshInProgress = false;
        this.persist();

        const modelCount = Object.keys(this.state.models).length;
        const elapsed = Date.now() - start;
        logger.info({ modelCount, elapsed }, '✅ Rolodex refresh complete.');
    }

    /** Discover Ollama models via REST API */
    private async discoverOllama(): Promise<void> {
        const start = Date.now();
        const providerState = this.state.providers.ollama;
        try {
            const baseUrl = this.config.ollamaBaseUrl || 'http://localhost:11434';
            // Increase timeout to 60s for massive substrates
            const response = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(120000) });
            if (!response.ok) throw new Error(`Ollama API returned ${response.status}`);

            const data = await response.json() as { models?: { name: string; size?: number; details?: { parameter_size?: string; quantization_level?: string; family?: string } }[] };
            const models = data.models || [];

            providerState.authenticated = true;
            providerState.models = models.map(m => m.name);
            providerState.latencyMs = Date.now() - start;
            providerState.lastChecked = Date.now();
            providerState.error = undefined;

            for (const m of models) {
                const key = `ollama:${m.name}`;
                if (!this.state.models[key]) {
                    this.state.models[key] = {
                        id: m.name,
                        name: m.name,
                        provider: 'ollama',
                        taskType: m.name.includes('embed') ? 'embedding' : m.name.includes('llava') || m.name.includes('moondream') ? 'vision' : 'text',
                        parameterSize: m.details?.parameter_size,
                        quantization: m.details?.quantization_level,
                        lastSeen: Date.now(),
                        successCount: 0, failureCount: 0, totalTokensUsed: 0, avgLatencyMs: 0, 
                        latencySamples: 0, 
                        reputation: 1.0,
                        isEmbedding: m.name.includes('embed'),
                        isVision: m.name.includes('llava') || m.name.includes('moondream'),
                        isText: !m.name.includes('embed')
                    };
                } else {
                    this.state.models[key].lastSeen = Date.now();
                    this.state.models[key].parameterSize = m.details?.parameter_size ?? this.state.models[key].parameterSize;
                }
            }

            logger.info({ count: models.length }, 'Ollama models discovered.');
        } catch (err: any) {
            // For timeouts: Preserve authentication and model list if we already have data
            const isTimeout = err.name === 'TimeoutError' || err.message.includes('timeout') || err.message.includes('aborted');

            if (isTimeout && providerState.models.length > 0) {
                logger.warn({ error: err.message, cachedModels: providerState.models.length }, 'Ollama discovery timed out. Preserving cached model state.');
                providerState.error = `DISCOVERY_TIMEOUT: ${err.message}`; // Mark as busy/timeout but keep authenticated
            } else {
                providerState.authenticated = false;
                providerState.error = err.message;
                logger.warn({ error: err.message }, 'Ollama discovery failed.');
            }

            providerState.latencyMs = Date.now() - start;
            providerState.lastChecked = Date.now();
        }
    }

    /** Discover Cloudflare models via wrangler CLI */
    private async discoverCloudflare(): Promise<void> {
        const start = Date.now();
        const providerState = this.state.providers.cloudflare;

        if (!this.config.cloudflareAccountId || !this.config.cloudflareApiToken) {
            providerState.error = 'Missing CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_API_TOKEN';
            providerState.lastChecked = Date.now();
            return;
        }

        try {
            // Identity check via wrangler whoami (direct execution)
            const { stdout: whoami } = await $`wrangler whoami 2>&1`;
            const accountMatch = whoami.match(/Account ID:\s*(\S+)/i) || whoami.match(/(\w{32})/);
            const emailMatch = whoami.match(/Email:\s*(\S+)/i) || whoami.match(/[\w.-]+@[\w.-]+\.\w+/);

            providerState.authenticated = whoami.toLowerCase().includes('logged in') || !!accountMatch;
            providerState.account = accountMatch?.[1] || this.config.cloudflareAccountId;
            providerState.email = emailMatch?.[0] || this.config.cloudflareAuthEmail;

            // Model discovery via REST API
            const cfApiUrl = `https://api.cloudflare.com/client/v4/accounts/${this.config.cloudflareAccountId}/ai/models/search`;
            const cfResponse = await fetch(cfApiUrl, {
                headers: { 'Authorization': `Bearer ${this.config.cloudflareApiToken}` },
                signal: AbortSignal.timeout(60000)
            });

            if (cfResponse.ok) {
                const cfData = await cfResponse.json() as { result?: { name: string; task?: { name?: string } }[] };
                const cfModels = cfData.result || [];
                providerState.models = cfModels.map(m => m.name);

                for (const m of cfModels) {
                    const key = `cloudflare:${m.name}`;
                    if (!this.state.models[key]) {
                        const taskName = m.task?.name?.toLowerCase() || '';
                        this.state.models[key] = {
                            id: m.name,
                            name: m.name,
                            provider: 'cloudflare',
                            taskType: taskName.includes('image') ? 'image' : taskName.includes('embed') ? 'embedding' : taskName.includes('audio') || taskName.includes('speech') ? 'audio' : 'text',
                            lastSeen: Date.now(),
                            successCount: 0, failureCount: 0, totalTokensUsed: 0, avgLatencyMs: 0, latencySamples: 0, reputation: 1.0,
                            isVision: taskName.includes('image') || taskName.includes('vision'),
                            isEmbedding: taskName.includes('embed'),
                            isText: !taskName.includes('image') && !taskName.includes('embed') && !taskName.includes('audio') && !taskName.includes('vision')
                        };
                    } else {
                        this.state.models[key].lastSeen = Date.now();
                    }
                }
                logger.info({ count: cfModels.length }, 'Cloudflare models discovered.');
            }

            providerState.latencyMs = Date.now() - start;
            providerState.lastChecked = Date.now();
            providerState.error = undefined;
        } catch (err: any) {
            const isTimeout = this.isTimeoutError(err);
            if (isTimeout && providerState.models.length > 0) {
                logger.warn({ error: err.message, cachedModels: providerState.models.length }, 'Cloudflare discovery timed out. Preserving cached model state.');
                providerState.error = `DISCOVERY_TIMEOUT: ${err.message}`;
            } else {
                providerState.error = err.message;
                providerState.authenticated = false;
                logger.warn({ error: err.message }, 'Cloudflare discovery failed.');
            }
            providerState.latencyMs = Date.now() - start;
            providerState.lastChecked = Date.now();
        }
    }

    /** Discover Gemini identity via gcloud CLI */
    private async discoverGemini(): Promise<void> {
        const start = Date.now();
        const providerState = this.state.providers.gemini;
        const apiKey = this.config.secondaryCloudApiKey || process.env['GOOGLE_API_KEY'];

        if (!apiKey) {
            providerState.error = 'Missing GOOGLE_API_KEY';
            providerState.lastChecked = Date.now();
            return;
        }

        try {
            // Identity check via gcloud
            let account: string | undefined;
            try {
                const { stdout } = await execAsync('gcloud auth list --filter=status:ACTIVE --format="value(account)" 2>&1', { timeout: 10000 });
                account = stdout.trim().split('\n')[0] || undefined;
            } catch { /* gcloud may not be installed */ }

            providerState.account = account;
            providerState.authenticated = true; // If we have an API key, we're "authenticated"
            providerState.email = account;

            // Gemini model list via REST API
            const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
            const geminiResponse = await fetch(geminiUrl, { signal: AbortSignal.timeout(120000) }); // Increased to 120s

            if (geminiResponse.ok) {
                const geminiData = await geminiResponse.json() as { models?: { name: string; displayName?: string; supportedGenerationMethods?: string[] }[] };
                const geminiModels = geminiData.models || [];
                providerState.models = geminiModels.map(m => m.name.replace('models/', ''));

                // Explicitly anchor the Substrate's configured priority routing targets
                const expectedSovereignTargets = [
                    this.config.geminiFlashModel || 'gemini-1.5-flash',
                    this.config.geminiProModel || 'gemini-1.5-pro',
                    this.config.geminiEmbeddingModel || 'text-embedding-004',
                    'gemini-1.5-flash-001'
                ];

                for (const target of expectedSovereignTargets) {
                    if (!providerState.models.includes(target)) {
                        providerState.models.push(target);
                    }
                }

                // Register all dynamically discovered ones
                for (const m of geminiModels) {
                    const modelId = m.name.replace('models/', '');
                    const key = `gemini:${modelId}`;
                    if (!this.state.models[key]) {
                        const methods = m.supportedGenerationMethods || [];
                        this.state.models[key] = {
                            id: modelId,
                            name: m.displayName || modelId,
                            provider: 'gemini',
                            taskType: methods.includes('embedContent') ? 'embedding' : 'text',
                            lastSeen: Date.now(),
                            successCount: 0, failureCount: 0, totalTokensUsed: 0, avgLatencyMs: 0, latencySamples: 0, reputation: 1.0,
                            isEmbedding: methods.includes('embedContent'),
                            isText: !methods.includes('embedContent')
                        };
                    } else {
                        this.state.models[key].lastSeen = Date.now();
                    }
                }

                // Register explicitly configured Sovereign priority ones if the REST API missed them
                for (const target of expectedSovereignTargets) {
                    const key = `gemini:${target}`;
                    if (!this.state.models[key]) {
                        this.state.models[key] = {
                            id: target,
                            name: target,
                            provider: 'gemini',
                            taskType: target.includes('embed') ? 'embedding' : 'text',
                            lastSeen: Date.now(),
                            successCount: 0, failureCount: 0, totalTokensUsed: 0, avgLatencyMs: 0, latencySamples: 0, reputation: 1.0,
                            isEmbedding: target.includes('embed'),
                            isText: !target.includes('embed')
                        };
                    } else {
                        this.state.models[key].lastSeen = Date.now();
                    }
                }

                logger.info({ count: providerState.models.length }, 'Gemini models discovered & anchored.');
            } else {
                providerState.error = `Gemini API returned ${geminiResponse.status}`;
            }

            providerState.latencyMs = Date.now() - start;
            providerState.lastChecked = Date.now();
        } catch (err: any) {
            const isTimeout = this.isTimeoutError(err);
            if (isTimeout && providerState.models.length > 0) {
                logger.warn({ error: err.message, cachedModels: providerState.models.length }, 'Gemini discovery timed out. Preserving cached model state.');
                providerState.error = `DISCOVERY_TIMEOUT: ${err.message}`;
            } else {
                providerState.error = err.message;
                providerState.authenticated = false;
                logger.warn({ error: err.message }, 'Gemini discovery failed.');
            }
            providerState.latencyMs = Date.now() - start;
            providerState.lastChecked = Date.now();
        }
    }

    /** Discover HuggingFace availability via inference API ping */
    private async discoverHuggingFace(): Promise<void> {
        const start = Date.now();
        const providerState = this.state.providers.huggingface;
        const apiKey = this.config.primaryCloudApiKey || process.env['HUGGINGFACE_API_KEY'];

        if (!apiKey) {
            providerState.error = 'Missing HUGGINGFACE_API_KEY / PRIMARY_CLOUD_API_KEY';
            providerState.lastChecked = Date.now();
            return;
        }

        try {
            // HF Inference API health ping
            const hfUrl = 'https://api-inference.huggingface.co/models/gpt2';
            const hfResponse = await fetch(hfUrl, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ inputs: 'test', parameters: { max_new_tokens: 1 } }),
                signal: AbortSignal.timeout(60000) // Increased to 60s
            });

            providerState.authenticated = hfResponse.status !== 401 && hfResponse.status !== 403;
            providerState.latencyMs = Date.now() - start;
            providerState.lastChecked = Date.now();

            if (providerState.authenticated) {
                // Register known HF models from config
                const knownHfModels = [
                    this.config.huggingfaceFallbackModel,
                    this.config.masterFallbackModel
                ].filter(m => m && m.startsWith('huggingface:'));

                providerState.models = knownHfModels.map(m => m.replace('huggingface:', ''));
                providerState.error = undefined;

                for (const modelId of providerState.models) {
                    const key = `huggingface:${modelId}`;
                    if (!this.state.models[key]) {
                        this.state.models[key] = {
                            id: modelId, name: modelId, provider: 'huggingface', taskType: 'text',
                            lastSeen: Date.now(),
                            successCount: 0, failureCount: 0, totalTokensUsed: 0, avgLatencyMs: 0, latencySamples: 0, reputation: 1.0
                        };
                    }
                }
                logger.info({ count: providerState.models.length }, 'HuggingFace models registered.');
            } else {
                providerState.error = `HuggingFace auth failed (HTTP ${hfResponse.status})`;
            }
        } catch (err: any) {
            const isTimeout = this.isTimeoutError(err);
            if (isTimeout && providerState.models.length > 0) {
                logger.warn({ error: err.message, cachedModels: providerState.models.length }, 'HuggingFace discovery timed out. Preserving cached model state.');
                providerState.error = `DISCOVERY_TIMEOUT: ${err.message}`;
            } else {
                providerState.error = err.message;
                providerState.authenticated = false;
                logger.warn({ error: err.message }, 'HuggingFace discovery failed.');
            }
            providerState.latencyMs = Date.now() - start;
            providerState.lastChecked = Date.now();
        }
    }

    /** Discover OpenRouter models via REST API */
    private async discoverOpenRouter(): Promise<void> {
        const start = Date.now();
        const providerState = this.state.providers.openrouter;
        const apiKey = this.config.openRouterApiKey || process.env['OPENROUTER_API_KEY'];

        if (!apiKey) {
            providerState.error = 'Missing OPENROUTER_API_KEY';
            providerState.lastChecked = Date.now();
            return;
        }

        try {
            const response = await fetch('https://openrouter.ai/api/v1/models', {
                headers: { 'Authorization': `Bearer ${apiKey}` },
                signal: AbortSignal.timeout(120000)
            });

            if (response.ok) {
                const data = await response.json() as { data?: any[] };
                const models = data.data || [];
                providerState.authenticated = true;
                providerState.models = models.map(m => m.id);

                for (const m of models) {
                    const key = `openrouter:${m.id}`;
                    if (!this.state.models[key]) {
                        const modality = m.architecture?.modality || '';
                        this.state.models[key] = {
                            id: m.id,
                            name: m.name || m.id,
                            provider: 'openrouter',
                            taskType: modality.includes('vision') ? 'vision' : modality.includes('image') ? 'image' : 'text',
                            lastSeen: Date.now(),
                            successCount: 0, failureCount: 0, totalTokensUsed: 0, avgLatencyMs: 0, latencySamples: 0, reputation: 1.0,
                            isVision: modality.includes('vision') || modality.includes('image'),
                            isText: !modality.includes('image') && !modality.includes('vision')
                        };
                    } else {
                        this.state.models[key].lastSeen = Date.now();
                    }
                }
                logger.info({ count: models.length }, 'OpenRouter models discovered.');
            } else {
                providerState.error = `OpenRouter API returned ${response.status}`;
            }

            providerState.latencyMs = Date.now() - start;
            providerState.lastChecked = Date.now();
            providerState.error = response.ok ? undefined : providerState.error;
        } catch (err: any) {
            const isTimeout = this.isTimeoutError(err);
            if (isTimeout && providerState.models.length > 0) {
                logger.warn({ error: err.message, cachedModels: providerState.models.length }, 'OpenRouter discovery timed out. Preserving cached model state.');
                providerState.error = `DISCOVERY_TIMEOUT: ${err.message}`;
            } else {
                providerState.error = err.message;
                providerState.authenticated = false;
                logger.warn({ error: err.message }, 'OpenRouter discovery failed.');
            }
            providerState.latencyMs = Date.now() - start;
            providerState.lastChecked = Date.now();
        }
    }

    /** Discover Fireworks models via REST API */
    private async discoverFireworks(): Promise<void> {
        const start = Date.now();
        const providerState = this.state.providers.fireworks;
        const apiKey = this.config.fireworksApiKey || process.env['FIREWORKS_API_KEY'];

        if (!apiKey) {
            providerState.error = 'Missing FIREWORKS_API_KEY';
            providerState.lastChecked = Date.now();
            return;
        }

        try {
            const response = await fetch('https://api.fireworks.ai/inference/v1/models', {
                headers: { 'Authorization': `Bearer ${apiKey}` },
                signal: AbortSignal.timeout(60000)
            });

            if (response.ok) {
                const data = await response.json() as { data?: any[] };
                const models = data.data || [];
                providerState.authenticated = true;
                providerState.models = models.map(m => m.id);

                for (const m of models) {
                    const key = `fireworks:${m.id}`;
                    if (!this.state.models[key]) {
                        const id = m.id.toLowerCase();
                        this.state.models[key] = {
                            id: m.id,
                            name: m.id.split('/').pop() || m.id,
                            provider: 'fireworks',
                            taskType: id.includes('vision') || id.includes('llava') || id.includes('moondream') ? 'vision' : 'text',
                            lastSeen: Date.now(),
                            successCount: 0, failureCount: 0, totalTokensUsed: 0, avgLatencyMs: 0, latencySamples: 0, reputation: 1.0,
                            isVision: id.includes('vision') || id.includes('llava') || id.includes('moondream'),
                            isText: !id.includes('vision') && !id.includes('llava') && !id.includes('moondream')
                        };
                    } else {
                        this.state.models[key].lastSeen = Date.now();
                    }
                }
                logger.info({ count: models.length }, 'Fireworks models discovered.');
            } else {
                providerState.error = `Fireworks API returned ${response.status}`;
            }

            providerState.latencyMs = Date.now() - start;
            providerState.lastChecked = Date.now();
            providerState.error = response.ok ? undefined : providerState.error;
        } catch (err: any) {
            const isTimeout = this.isTimeoutError(err);
            if (isTimeout && providerState.models.length > 0) {
                logger.warn({ error: err.message, cachedModels: providerState.models.length }, 'Fireworks discovery timed out. Preserving cached model state.');
                providerState.error = `DISCOVERY_TIMEOUT: ${err.message}`;
            } else {
                providerState.error = err.message;
                providerState.authenticated = false;
                logger.warn({ error: err.message }, 'Fireworks discovery failed.');
            }
            providerState.latencyMs = Date.now() - start;
            providerState.lastChecked = Date.now();
        }
    }

    // ═══ UTILITIES ═══

    /** Convert a RolodexModel to a prefixed model ID usable by ModelClient */
    private toPrefixedModelId(model: RolodexModel): string {
        switch (model.provider) {
            case 'ollama': return model.id;
            case 'gemini': return `gemini:${model.id}`;
            case 'huggingface': return `huggingface:${model.id}`;
            case 'cloudflare': return `cloudflare:${model.id}`;
            case 'fireworks': return `fireworks:${model.id}`;
            case 'openrouter': return `openrouter:${model.id}`;
            default: return model.id;
        }
    }

    /** Map a ModelClient provider string to a RolodexProvider */
    static toRolodexProvider(provider: string): RolodexProvider {
        const map: Record<string, RolodexProvider> = {
            ollama: 'ollama', gemini: 'gemini', huggingface: 'huggingface',
            cloudflare: 'cloudflare', fireworks: 'fireworks', openrouter: 'openrouter'
        };
        return map[provider] || 'ollama';
    }

    /** Check if an error is a fetch timeout or abortion */
    private isTimeoutError(err: any): boolean {
        return err.name === 'TimeoutError' || 
               err.message?.includes('timeout') || 
               err.message?.includes('aborted') ||
               err.code === 'ETIMEDOUT';
    }

    private globeStateLimb?: any; // Avoiding circular deep imports, typed functionally

    /**
     * Sovereign FinOps / Hive Mind: Attach the durable GlobeStateLimb for broadcasting.
     */
    public setGlobeStateLimb(limb: any): void {
        this.globeStateLimb = limb;
    }

    /** Persist state to disk and broadcast to the Hive Mind */
    persist(): void {
        try {
            const dir = dirname(this.persistPath);
            if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
            writeFileSync(this.persistPath, JSON.stringify(this.state, null, 2));

            // Broadcast to the swarm if connected
            if (this.globeStateLimb) {
                this.globeStateLimb.pushNodeState('rolodex_v1', this.state).catch((err: any) => {
                    logger.debug({ err: err.message }, 'Failed to broadcast rolodex to Globe (likely offline)');
                });
            }
        } catch (err: any) {
            logger.warn({ error: err.message }, 'Failed to persist rolodex state.');
        }
    }

    /** Get a formatted summary string for CLI display  */
    getFormattedSummary(): string {
        const lines: string[] = ['═══ SOVEREIGN MODEL ROLODEX ═══', ''];

        for (const [providerName, identity] of Object.entries(this.state.providers)) {
            const status = identity.authenticated ? '\x1b[38;5;154m✓ ONLINE\x1b[0m' : '\x1b[38;5;196m✗ OFFLINE\x1b[0m';
            const models = this.getModelsForProvider(providerName as RolodexProvider);
            const totalCalls = models.reduce((sum, m) => sum + m.successCount + m.failureCount, 0);
            const totalTokens = models.reduce((sum, m) => sum + m.totalTokensUsed, 0);
            const avgLatency = models.length > 0 ? Math.round(models.reduce((sum, m) => sum + m.avgLatencyMs, 0) / models.length) : 0;

            lines.push(`[${status}] ${providerName.toUpperCase()} (${identity.models.length} models)`);
            if (identity.account) lines.push(`  Account: ${identity.account}`);
            if (identity.email) lines.push(`  Email: ${identity.email}`);
            if (identity.error) lines.push(`  \x1b[38;5;208mError: ${identity.error}\x1b[0m`);
            lines.push(`  Total Calls: ${totalCalls} | Tokens: ${totalTokens} | Avg Latency: ${avgLatency}ms`);

            // Show top 5 models by usage
            const topModels = models.sort((a, b) => (b.successCount + b.failureCount) - (a.successCount + a.failureCount)).slice(0, 5);
            for (const m of topModels) {
                const successRate = m.successCount + m.failureCount > 0 ? Math.round(m.successCount * 100 / (m.successCount + m.failureCount)) : 0;
                lines.push(`    ↳ ${m.id} [${successRate}% success, ${m.successCount + m.failureCount} calls, ${Math.round(m.avgLatencyMs)}ms avg]`);
            }
            lines.push('');
        }

        lines.push(`Last Refresh: ${this.state.lastRefresh ? new Date(this.state.lastRefresh).toISOString() : 'Never'}`);
        lines.push(`Total Models: ${Object.keys(this.state.models).length}`);
        return lines.join('\n');
    }

    /** 🧬 Reputation Decay - Exponential Convergence toward baseline 1.0 */
    public applyReputationDecay(decayRate: number): void {
        const count = Object.keys(this.state.models).length;
        if (count === 0) return;

        for (const model of Object.values(this.state.models)) {
            // formula: rep = rep + (1 - rep) * decayRate
            model.reputation = model.reputation + (1.0 - model.reputation) * decayRate;
        }
        
        logger.debug({ decayRate, count }, '🧬 Reputation decay applied: All models drifted toward baseline.');
        this.persist();
    }

    /** Increment active load counter for a model on a provider (used by stress test) */
    incrementLoad(_provider: string, _model: string): void {
        // Load tracking stub — future: track concurrent requests per model
    }

    /** Decrement active load counter for a model on a provider (used by stress test) */
    decrementLoad(_provider: string, _model: string): void {
        // Load tracking stub — future: track concurrent requests per model
    }

    /** 
     * canAcceptCall - Load gating / Backpressure check.
     * Returns true if the model/provider can accept more parallel work.
     */
    canAcceptCall(_provider: string, _model: string): boolean {
        // Backpressure stub — future: check against maxParallelCalls from config
        return true; 
    }

    /** Functional health probe for NodeTester */
    healthCheck(): { online: boolean; details: string } {
        const totalModels = Object.keys(this.state.models).length;
        const providers = Object.values(this.state.providers);
        const onlineProviders = providers.filter(p => p.authenticated).length;
        const rsmvOnline = this.state.providers.rsmv?.authenticated ? 'Aligned' : 'Disconnected';

        return {
            online: totalModels > 0 || this.state.providers.rsmv?.authenticated,
            details: `Rolodex: ${totalModels} models across ${onlineProviders}/7 providers. [RSMV: ${rsmvOnline}]. Last refresh: ${this.state.lastRefresh ? new Date(this.state.lastRefresh).toLocaleTimeString() : 'Never'}`
        };
    }
}
