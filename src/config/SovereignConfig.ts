import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';

export interface SovereignConfig {
    mode: 'hybrid' | 'local' | 'sovereign';
    primaryCloudApiKey?: string;
    secondaryCloudApiKey?: string;
    cloudflareAccountId?: string;
    cloudflareApiToken?: string;
    cloudflareAuthEmail?: string;
    fireworksApiKey?: string;
    openRouterApiKey?: string;
    planningModel: string;
    codingModel: string;
    orchestratorModel: string;
    visionModel: string;
    voiceModel: string;
    codingHeavyModel: string;
    codingFastModel: string;
    embeddingModel: string;
    criticModel: string;
    lightAuditorModel: string;
    geminiFlashModel: string;
    geminiProModel: string;
    geminiEmbeddingModel: string;

    // specialized Generation Models (Phase 104)
    storyboardModel: string;
    vocalAnalysisModel: string;
    imagePromptModel: string;
    soulIngestionModel: string;
    memoryConsolidationModel: string;

    // Tiered Hierarchy Roles (Phase 71)
    masterReasoningModel: string;
    executiveCoderModel: string;
    reactiveAgentModel: string;

    // Resource Budgeting Tiers (Phase 78) - The 3 Paths
    fastPathModel: string; // Reflexes, <3s response (moondream, qwen2.5-coder:latest)
    midPathModel: string;  // Execution, 3-10s response (7b-14b)
    deepPathModel: string; // Sovereignty, 10-60s response (33b+, Kimi)

    // Failover Tiers (Phase 72)
    masterFallbackModel: string;
    masterLocalModel: string;

    // Specialized Expressiveness
    imageGenModel: string;
    huggingfaceFallbackModel: string;
    localFallbackModel: string;
    ollamaBaseUrl: string;
    projectId: string;
    embeddingDimensions: number;
    wsPort: number;
    projectRoot: string;
    pog2Dir: string;
    gutenbergPath: string;

    // Advanced Model Parameters
    contextWindow: number;
    temperature: number;
    topP: number;
    repeatPenalty: number;
    numCtx: number;
    stopSequences: string[];
    outputFormat: 'json' | 'text';
    logLevel: 'debug' | 'info' | 'warn' | 'error';

    enabledServices?: string[];
    gatewayUrl?: string; // Phase 72: AI Gateway
    bindingUrl?: string; // Phase 82: Local Proxy

    youtube?: {
        projectId: string;
        apiKey: string;
        clientId: string;
        clientSecret: string;
        channelId: string;
        youtubeId: string;
    };

    // Phase 8: SovereignKnock Auth Settings
    knock: {
        enabled: boolean;
        defaultSequence: string[];
        ttlSeconds: number;
        ghostFallback: boolean;
    };
    // Phase 18: Resource & Metabolic Tracking
    metabolicCostScale: number; // 0.0 - 1.0 multiplier for all cost logging
}

const DEFAULT_CONFIG: SovereignConfig = {
    mode: 'hybrid',
    metabolicCostScale: 1.0,
    planningModel: 'kimi-k2.5:cloud',
    codingModel: 'qwen2.5-coder:14b-instruct-q5_K_M',
    orchestratorModel: 'kimi-k2.5:cloud',
    visionModel: 'moondream:1.8b-v2-q4_K_M',
    voiceModel: 'tinyllama:1.1b-chat-v1.0-q4_K_M',
    codingHeavyModel: 'qwen2.5-coder:14b-instruct-q5_K_M',
    codingFastModel: 'qwen2.5-coder:7b-instruct-q4_K_M', 
    embeddingModel: 'qwen3-embedding:latest',
    cloudflareAccountId: undefined,
    cloudflareApiToken: undefined,
    cloudflareAuthEmail: undefined,
    criticModel: 'kimi-k2.5:cloud',
    lightAuditorModel: 'all-minilm:latest',
    geminiFlashModel: 'gemini-1.5-flash',
    geminiProModel: 'gemini-1.5-pro',
    geminiEmbeddingModel: 'text-embedding-004',

    // specialized Generation Defaults (Phase 104)
    storyboardModel: 'qwen2.5-coder:14b-instruct-q5_K_M',
    vocalAnalysisModel: 'yi-coder:9b-chat-q5_K_M',
    imagePromptModel: 'deepseek-coder:6.7b-instruct-q4_K_M',
    // Back to 7b for rapid processing speeds over the 14b CPU latency.
    soulIngestionModel: 'qwen2.5-coder:7b-instruct-q4_K_M',
    memoryConsolidationModel: 'qwen2.5-coder:7b-instruct-q4_K_M',

    // Phase 71 Hierarchy Defaults
    masterReasoningModel: 'kimi-k2.5:cloud',
    executiveCoderModel: 'qwen2.5-coder:14b-instruct-q5_K_M',
    reactiveAgentModel: 'qwen2.5-coder:7b-instruct-q4_K_M',

    // Phase 78 Economic Budget Paths (Layer 3)
    fastPathModel: 'qwen2.5-coder:7b-instruct-q4_K_M',
    midPathModel: 'qwen2.5-coder:14b-instruct-q5_K_M',
    deepPathModel: 'kimi-k2.5:cloud',

    // Phase 72 Failover & Specialized Defaults
    masterFallbackModel: 'huggingface:openai-compat/kimi-k2.5-thinking',
    masterLocalModel: 'qwen2.5-coder:14b-instruct-q5_K_M',
    imageGenModel: 'cloudflare:@cf/stabilityai/stable-diffusion-xl-base-1.0',

    huggingfaceFallbackModel: 'huggingface:openai-compat/kimi-k2.5-thinking',
    localFallbackModel: 'qwen2.5-coder:14b-instruct-q5_K_M',
    ollamaBaseUrl: 'http://localhost:11434',
    projectId: 'global',
    embeddingDimensions: 768,
    wsPort: -1,
    projectRoot: process.cwd(),
    pog2Dir: process.env['POG2_DIR'] || process.cwd(),
    gutenbergPath: process.env['GUTENBERG_PATH'] || '',

    // Performance & Precision
    contextWindow: 16384,
    temperature: 0.7,
    topP: 0.9,
    repeatPenalty: 1.1,
    numCtx: 16384,
    stopSequences: ["USER:"],
    outputFormat: 'json',
    logLevel: 'debug',
    enabledServices: [],

    // Phase 8 SovereignKnock Defaults
    knock: {
        enabled: true,
        defaultSequence: ['䷀', '䷁', '䷂', '䷃', '䷄', '䷅'],
        ttlSeconds: 30,
        ghostFallback: true
    }
};

function loadEnvFile(envPath: string): void {
    if (!existsSync(envPath)) return;
    try {
        const content = readFileSync(envPath, 'utf8');
        for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const match = trimmed.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Strip quotes
                if (!process.env[key]) {
                    process.env[key] = value;
                }
            }
        }
    } catch {
        // Silently fail if `.env` exists but is unreadable
    }
}

export function loadConfig(configPath: string): SovereignConfig {
    // 1. Force load user-specified environments to ensure API keys exist globally
    loadEnvFile('.env');

    if (!existsSync(configPath)) {
        bootstrapConfig(configPath);
        return DEFAULT_CONFIG;
    }

    try {
        const data = JSON.parse(readFileSync(configPath, 'utf8'));
        // Merge with defaults to ensure all fields exist
        return {
            ...DEFAULT_CONFIG,
            ...data,
            primaryCloudApiKey: process.env['PRIMARY_CLOUD_API_KEY'] ?? process.env['HUGGINGFACE_API_KEY'] ?? data.primaryCloudApiKey ?? data.huggingfaceApiKey,
            secondaryCloudApiKey: process.env['SECONDARY_CLOUD_API_KEY'] ?? process.env['GOOGLE_API_KEY'] ?? data.secondaryCloudApiKey ?? data.geminiApiKey,
            cloudflareAccountId: process.env['CLOUDFLARE_ACCOUNT_ID'] ?? data.cloudflareAccountId,
            cloudflareApiToken: process.env['CLOUDFLARE_API_TOKEN'] ?? data.cloudflareApiToken,
            cloudflareAuthEmail: process.env['CLOUDFLARE_AUTH_EMAIL'] ?? data.cloudflareAuthEmail,
            fireworksApiKey: process.env['FIREWORKS_API_KEY'] ?? data.fireworksApiKey,
            openRouterApiKey: process.env['OPENROUTER_API_KEY'] ?? data.openRouterApiKey,
            geminiFlashModel: process.env['GEMINI_FLASH_MODEL'] ?? data.geminiFlashModel ?? DEFAULT_CONFIG.geminiFlashModel,
            geminiProModel: process.env['GEMINI_PRO_MODEL'] ?? data.geminiProModel ?? DEFAULT_CONFIG.geminiProModel,
            geminiEmbeddingModel: process.env['GEMINI_EMBEDDING_MODEL'] ?? data.geminiEmbeddingModel ?? DEFAULT_CONFIG.geminiEmbeddingModel
        };
    } catch {
        return DEFAULT_CONFIG;
    }
}

export function getDefaultSovereignConfig(): SovereignConfig {
    return { ...DEFAULT_CONFIG };
}

function bootstrapConfig(configPath: string): void {
    const dir = dirname(configPath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    writeFileSync(configPath, JSON.stringify(DEFAULT_CONFIG, null, 2));
}
