import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { homedir } from 'os';

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
    fastPathModel: string; // Reflexes, <3s response (moondream, deepseek-r1:8b)
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
    sovereignRoot: string;

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
        tokenPath?: string;
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
    globeEnabled: boolean;     // Phase 107.1: Toggle for durable state hub
    globeEndpoint?: string;    // Phase 107: Live Durable State Hub

    // Phase 9: Stabilization Mechanics
    reputationDecayRate: number; // Rate at which reputation drifts back to 1.0 per hour
    baseExplorationEpsilon: number; // Starting point for epsilon-greedy routing
    laneAwareWeighting: boolean; // Whether to weight routing by lane congestion (wait times)

    // Phase 23: Specialized Worker Keys
    correctionModel: string;
    optimizationModel: string;
    legacyModel: string;
    prototypeModel: string;
    rscModel: string;
    bioModel: string;
    visionFastModel: string;
}

const DEFAULT_CONFIG: SovereignConfig = {
    mode: 'hybrid',
    metabolicCostScale: 1.0,
    planningModel: 'kimi-k2.5:cloud',
    codingModel: 'deepseek-r1:8b', // Upgraded to thinking model
    orchestratorModel: 'kimi-k2.5:cloud',
    visionModel: 'moondream:latest',
    voiceModel: 'tinyllama:latest',
    codingHeavyModel: 'deepseek-r1:8b',
    codingFastModel: 'deepseek-r1:8b', 
    embeddingModel: 'qwen3-embedding:latest', // Upgraded to actual embedding node
    cloudflareAccountId: undefined,
    cloudflareApiToken: undefined,
    cloudflareAuthEmail: undefined,
    criticModel: 'kimi-k2.5:cloud',
    lightAuditorModel: 'all-minilm:latest',
    geminiFlashModel: 'gemini-1.5-flash',
    geminiProModel: 'gemini-1.5-pro',
    geminiEmbeddingModel: 'text-embedding-004',
    
    // specialized Generation Defaults (Phase 104)
    storyboardModel: 'deepseek-r1:8b',
    vocalAnalysisModel: 'qwen2.5-coder:1.5b-instruct-q4_K_M',
    imagePromptModel: 'deepseek-coder:6.7b-instruct-q4_K_M',
    // Back to 7b for rapid processing speeds over the 14b CPU latency.
    soulIngestionModel: 'deepseek-r1:8b',
    memoryConsolidationModel: 'deepseek-r1:8b',

    // Phase 71 Hierarchy Defaults
    masterReasoningModel: 'kimi-k2.5:cloud',
    executiveCoderModel: 'deepseek-r1:8b',
    reactiveAgentModel: 'deepseek-r1:8b', // VibeThinker fallback for demo stability

    // Phase 78 Economic Budget Paths (Layer 3)
    fastPathModel: 'deepseek-r1:8b',
    midPathModel: 'deepseek-r1:8b',
    deepPathModel: 'kimi-k2.5:cloud',

    // Phase 72 Failover & Specialized Defaults
    masterFallbackModel: 'huggingface:openai-compat/kimi-k2.5-thinking',
    masterLocalModel: 'deepseek-r1:8b',
    imageGenModel: 'cloudflare:@cf/stabilityai/stable-diffusion-xl-base-1.0',

    huggingfaceFallbackModel: 'huggingface:openai-compat/kimi-k2.5-thinking',
    localFallbackModel: 'deepseek-r1:8b',
    ollamaBaseUrl: 'http://localhost:11434',
    projectId: 'global',
    embeddingDimensions: 768,
    wsPort: -1,
    projectRoot: process.cwd(),
    pog2Dir: process.env['POG2_DIR'] || join(homedir(), '.pog2-sovereign'),
    gutenbergPath: process.env['GUTENBERG_PATH'] || '',
    sovereignRoot: process.env['POG_SOVEREIGN_ROOT'] || '',

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
        defaultSequence: ['ä·€', 'ä·', 'ä·‚', 'ä·ƒ', 'ä·„', 'ä·…'],
        ttlSeconds: 30,
        ghostFallback: true
    },
    globeEnabled: false,
    globeEndpoint: 'wss://multiplayer-globe-template.kristain33rs.workers.dev/parties/globe/pog2-sovereign',
    
    // Phase 9 Defaults
    reputationDecayRate: 0.1, // 10% recovery toward 1.0 per hour
    baseExplorationEpsilon: 0.15,
    laneAwareWeighting: true,

    // Phase 23 Defaults
    correctionModel: 'deepseek-coder:6.7b-instruct-q4_K_M',
    optimizationModel: 'yi-coder:9b-chat-q5_K_M',
    legacyModel: 'deepseek-coder:latest',
    prototypeModel: 'deepseek-r1:8b',
    rscModel: 'moondream:latest',
    bioModel: 'medgemma:latest',
    visionFastModel: 'moondream:latest'
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

const ENV_VAR_MAP: Record<string, string> = {
    mode: 'SOVEREIGN_MODE',
    primaryCloudApiKey: 'PRIMARY_CLOUD_API_KEY',
    secondaryCloudApiKey: 'SECONDARY_CLOUD_API_KEY',
    cloudflareAccountId: 'CLOUDFLARE_ACCOUNT_ID',
    cloudflareApiToken: 'CLOUDFLARE_API_TOKEN',
    cloudflareAuthEmail: 'CLOUDFLARE_AUTH_EMAIL',
    fireworksApiKey: 'FIREWORKS_API_KEY',
    openRouterApiKey: 'OPENROUTER_API_KEY',
    planningModel: 'POG2_PLANNING_MODEL',
    codingModel: 'POG2_CODING_MODEL',
    orchestratorModel: 'POG2_ORCHESTRATOR_MODEL',
    visionModel: 'POG2_VISION_MODEL',
    voiceModel: 'POG2_VOICE_MODEL',
    codingHeavyModel: 'POG2_CODING_HEAVY_MODEL',
    codingFastModel: 'POG2_CODING_FAST_MODEL',
    embeddingModel: 'POG2_EMBEDDING_MODEL',
    criticModel: 'POG2_CRITIC_MODEL',
    lightAuditorModel: 'LIGHT_AUDITOR_MODEL',
    geminiFlashModel: 'GEMINI_FLASH_MODEL',
    geminiProModel: 'GEMINI_PRO_MODEL',
    geminiEmbeddingModel: 'GEMINI_EMBEDDING_MODEL',
    masterReasoningModel: 'MASTER_REASONING_MODEL',
    executiveCoderModel: 'EXECUTIVE_CODER_MODEL',
    reactiveAgentModel: 'REACTIVE_AGENT_MODEL',
    fastPathModel: 'FAST_PATH_MODEL',
    midPathModel: 'MID_PATH_MODEL',
    deepPathModel: 'DEEP_PATH_MODEL',
    masterFallbackModel: 'MASTER_FALLBACK_MODEL',
    masterLocalModel: 'MASTER_LOCAL_MODEL',
    imageGenModel: 'IMAGE_GEN_MODEL',
    huggingfaceFallbackModel: 'HUGGINGFACE_FALLBACK_MODEL',
    localFallbackModel: 'LOCAL_FALLBACK_MODEL',
    ollamaBaseUrl: 'OLLAMA_BASE_URL',
    projectId: 'PROJECT_ID',
    embeddingDimensions: 'EMBEDDING_DIMENSIONS',
    wsPort: 'WS_PORT',
    contextWindow: 'CONTEXT_WINDOW',
    temperature: 'TEMPERATURE',
    topP: 'TOP_P',
    repeatPenalty: 'REPEAT_PENALTY',
    numCtx: 'NUM_CTX',
    outputFormat: 'OUTPUT_FORMAT',
    logLevel: 'LOG_LEVEL',
    globeEnabled: 'POG2_GLOBE_ENABLED',
    globeEndpoint: 'POG2_GLOBE_ENDPOINT',
    sovereignRoot: 'POG_SOVEREIGN_ROOT',
    reputationDecayRate: 'REPUTATION_DECAY_RATE',
    baseExplorationEpsilon: 'EXPLORATION_EPSILON',
    laneAwareWeighting: 'LANE_AWARE_WEIGHTING',
    correctionModel: 'CORRECTION_MODEL',
    optimizationModel: 'OPTIMIZATION_MODEL',
    legacyModel: 'LEGACY_MODEL',
    prototypeModel: 'PROTOTYPE_MODEL',
    rscModel: 'RSC_MODEL',
    bioModel: 'BIO_MODEL',
    visionFastModel: 'VISION_FAST_MODEL'
};

export function loadConfig(configPath: string): SovereignConfig {
    // 1. Force load user-specified environments to ensure API keys exist globally
    loadEnvFile('.env');

    let fileConfig: Partial<SovereignConfig> = {};
    if (existsSync(configPath)) {
        try {
            fileConfig = JSON.parse(readFileSync(configPath, 'utf8'));
        } catch {
            // Silently fall back to defaults if JSON is malformed
        }
    }

    const config: any = { ...DEFAULT_CONFIG, ...fileConfig };

    // 2. Apply Environment Variable Overrides
    for (const [configKey, envKey] of Object.entries(ENV_VAR_MAP)) {
        const envVal = process.env[envKey];
        if (envVal !== undefined) {
            // Handle Type Conversion
            if (typeof (DEFAULT_CONFIG as any)[configKey] === 'number') {
                config[configKey] = Number(envVal);
            } else if (Array.isArray((DEFAULT_CONFIG as any)[configKey])) {
                try {
                    config[configKey] = JSON.parse(envVal);
                } catch {
                    // Maintain existing value if not valid JSON array
                }
            } else {
                config[configKey] = envVal;
            }
        }
    }

    config.primaryCloudApiKey = process.env['PRIMARY_CLOUD_API_KEY'] ?? process.env['HUGGINGFACE_API_KEY'] ?? config.primaryCloudApiKey;
    config.secondaryCloudApiKey = process.env['SECONDARY_CLOUD_API_KEY'] ?? process.env['GOOGLE_API_KEY'] ?? config.secondaryCloudApiKey;

    // Phase 105: Explicit YouTube Environment Mapping (Upstream Resilience)
    if (process.env['YOUTUBE_CLIENT_ID'] || process.env['YOUTUBE_CLIENT_SECRET'] || process.env['YOUTUBE_API_KEY'] || process.env['YOUTUBE_TOKEN_PATH']) {
        config.youtube = config.youtube || {};
        config.youtube.clientId = process.env['YOUTUBE_CLIENT_ID'] ?? config.youtube.clientId;
        config.youtube.clientSecret = process.env['YOUTUBE_CLIENT_SECRET'] ?? config.youtube.clientSecret;
        config.youtube.apiKey = process.env['YOUTUBE_API_KEY'] ?? config.youtube.apiKey;
        config.youtube.projectId = process.env['YOUTUBE_PROJECT_ID'] ?? config.youtube.projectId;
        config.youtube.channelId = process.env['YOUTUBE_CHANNEL_ID'] ?? config.youtube.channelId;
        config.youtube.youtubeId = process.env['YOUTUBE_YOUTUBE_ID'] ?? config.youtube.youtubeId;
        config.youtube.tokenPath = process.env['YOUTUBE_TOKEN_PATH'] ?? config.youtube.tokenPath;
    }

    // Phase 106: Normalize wsPort defaults (Default to 8765 if -1 or missing)
    if (config.wsPort === -1 || config.wsPort === undefined) {
        config.wsPort = 8765;
    }

    return config as SovereignConfig;
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
