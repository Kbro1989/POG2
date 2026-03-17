/**
 * Core type definitions for pog2-sovereign.
 * Aggregator and Domain-Specific Taxonomy.
 */

import { join, basename } from 'path';
// HealthReport and ServiceHealthState defined below to resolve broken import
import type { RoutingDecision, RoutingContext } from '../routing/types.js';
import { SovereignDomain } from '../types/SovereignDomain.js';

export { RoutingDecision, RoutingContext, SovereignDomain };

export type ServiceHealthState = 'READY' | 'DEGRADED' | 'CRITICAL_FAILURE' | 'OFFLINE';

export type TodoStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface HealthReport {
    state: ServiceHealthState | 'RATE_LIMITED';
    cooldownSeconds?: number;
    error?: string;
}

export enum TaskType {
    CODE = 'CODE',
    RESEARCH = 'RESEARCH',
    SYSTEM = 'SYSTEM',
    VISION = 'VISION',
    FORGE = 'FORGE',
    SOCIAL = 'SOCIAL',
    MOTOR = 'MOTOR',
    SENSORY = 'SENSORY'
}

export enum YaoState {
    OldYang = 3,    // Change
    YoungYang = 2,  // Stable
    OldYin = 1,     // Change
    YoungYin = 0,   // Stable
    OldMixed = 4,   // Chaotic
    YoungMixed = 5, // Emerging
    YangYao = 2,    // Alias
    YinYao = 0      // Alias
}

export enum EmotionalState {
    Inspired = 'INSPIRED',
    Steady = 'STEADY',
    Agitated = 'AGITATED',
    Curious = 'CURIOUS',
    Quiet = 'QUIET',
    Surprised = 'SURPRISED',
    Decisive = 'DECISIVE',
    Zen = 'ZEN',
    Excited = 'EXCITED',
    Frustrated = 'FRUSTRATED',
    Pensive = 'PENSIVE',
    Melancholy = 'MELANCHOLY'
}

export enum CircuitState {
    Closed = 'CLOSED',   // Flowing (Stable)
    Open = 'OPEN',       // Broken (Tripped)
    HalfOpen = 'HALF_OPEN',
    Stable = 'STABLE'    // Legacy/Preferred alias
}

export enum ModelAbility {
    Text = 'text',
    Vision = 'vision',
    Tools = 'tools',
    Embed = 'embed'
}

export enum ModelType {
    Ollama = 'ollama',
    Cloudflare = 'cloudflare',
    OpenRouter = 'openrouter',
    Anthropic = 'anthropic',
    OpenAI = 'openai'
}

export enum YangState {
    Expansion = 'EXPANSION',
    Solidify = 'SOLIDIFY'
}

export enum YinState {
    Receiving = 'RECEIVING',
    yielding = 'YIELDING'
}

export enum HealthStatus {
    Critical = 'Critical',
    Degraded = 'Degraded',
    Ready = 'Ready',
    Offline = 'Offline',
    HEALTHY = 'Ready',
    UNHEALTHY = 'Critical',
    UNKNOWN = 'Offline'
}

export enum BuildStatus {
    Failed = 'Failed',
    Warning = 'Warning',
    Passed = 'Passed',
    Unknown = 'Unknown',
    PASS = 'Passed',
    FAIL = 'Failed',
    BUILDING = 'Warning'
}

export enum ResourcePressure {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
    CRITICAL = 'CRITICAL'
}

export enum UserEngagement {
    ACTIVE = 'ACTIVE',
    IDLE = 'IDLE',
    AWAY = 'AWAY',
    UNKNOWN = 'UNKNOWN'
}

export enum SovereignTaxonomy {
    CLINICAL = 'CLINICAL',
    ORGANIC = 'ORGANIC',
    CHAOTIC = 'CHAOTIC'
}

export type Ternary = 1 | 0 | -1;

export type Result<T, E = Error> =
    | { ok: true; value: T; error?: never }
    | { ok: false; error: E; value?: never };

export const ok = <T>(value: T): Result<T, any> => ({ ok: true, value });
export const err = <E>(error: E): Result<any, E> => ({ ok: false, error });
export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; value: T } => result.ok;

export interface MCPContent {
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
}

export interface MCPToolResult {
    content: MCPContent[];
    isError?: boolean;
}

export interface TSCError {
    readonly message: string;
    readonly code?: string | number;
    readonly file?: string;
    readonly line?: number;
    readonly context?: string;
}

export interface FileContext {
    path: string;
    content: string;
}

export interface CodeContext {
    primary?: string;
    imports?: string[];
    sameDirectory?: string[];
    related?: string[];
}

export interface SovereignMetadata {
    readonly id: string;
    readonly timestamp: number;
    readonly domain: SovereignDomain;
    readonly tags: string[];
    readonly hash?: string;
}

export interface SovereignRecord<T = any> {
    readonly metadata: SovereignMetadata;
    readonly data: T;
}

export interface ValidationResult {
    readonly ok: boolean;
    readonly value?: any;
    readonly error?: {
        reason: string;
        suggestion?: string;
    };
}

export interface Intent {
    readonly query: string;
    readonly domain: SovereignDomain;
    readonly logic: Ternary;
    readonly complexity: number;
}

export interface Execution {
    readonly tool: string;
    readonly output: any;
    readonly success: boolean;
    readonly metadata?: Record<string, any>;
}

export interface EngineOutput {
    readonly output: string;
    readonly execution?: Execution;
    readonly data?: any;               // Added for cross-substrate compatibility
    readonly metadata?: Record<string, any>;
    readonly actuation?: ActuationIntent; // Phase 15: Link perception to action
}

/**
 * ActuationIntent — CNS-driven structural or environmental change.
 */
export interface ActuationIntent {
    readonly action: 'mutate_shader' | 'capture_frame' | 'update_model' | 'ui_actuate' | 'rsmv_control';
    readonly target: string;
    readonly parameters: Record<string, any>;
    readonly reasoning?: string;
}

/**
 * ActuationResult — Feedback from the motor/vision substrate after actuation.
 */
export interface ActuationResult {
    readonly success: boolean;
    readonly details?: string;
    readonly data?: any;
}

/**
 * PedagogyProfile — Distilled metrics from professional production assets.
 * Used for "Training" the AI on pro-level 3D standards.
 */
export interface PedagogyProfile {
    readonly id: string;
    readonly name: string;
    readonly type: 'NPC' | 'OBJECT' | 'ITEM';
    readonly metrics: {
        readonly polyCount: number;
        readonly boneCount: number;
        readonly materialComplexity: number;
        readonly rigLogic: 'SKELETAL' | 'VERTEX_ANIM' | 'STATIC';
        readonly surfaceArea?: number;
    };
    readonly semantics: {
        readonly role: string;
        readonly race?: string;
        readonly intent: string; // e.g., "Hero NPC", "Background Prop"
        readonly wikiUrl?: string;
    };
    readonly timestamp: number;
}

export interface ContextCard {
    readonly lineIndex: number;
    readonly title: string;
    readonly content: string;
    readonly state: YaoState;
    readonly importance: number;
    readonly reflection?: string;
    readonly weight?: number;
    readonly aesthetics?: GenerativeAesthetics; // Bridging thought to output
    isPinned?: boolean;
}

export interface ThinkingNexus {
    readonly yao: YaoState;
    readonly emotionalValence: number;
    readonly substrateHealth: CircuitState;
    readonly metabolicPressure?: number;
    readonly curiosity?: number;
    readonly metabolicFriction?: number;
    readonly originalIntent?: string;
    readonly reflection?: string;       // Added for OrchestrateEngine
    readonly emotionalPool?: Record<string, number>;
    thoughts?: ContextCard[];
    bottleneckPaths?: string[];
    readonly output?: string;      // Compatibility shim
    readonly response?: string;    // Compatibility shim
}

export interface FreeModelConfig {
    readonly model: string;
    readonly provider: string;
    readonly priority?: number;
    readonly name?: string;
}

export interface ModelPerformance {
    readonly model: string;
    readonly latencyMs: number;
    readonly success: boolean;
    readonly timestamp: number;
}

export interface ArchitectureManifest {
    readonly domainModel: Record<string, { file: string; properties: string[] }>;
    readonly dependencyRules: Record<string, string[]>;
    readonly primaryGoal: string;
}

export interface Todo {
    id: string;
    task: string;
    status: TodoStatus;
    rollback?: string;
}
export interface Plan {
    readonly goal: string;
    readonly steps: string[];
    readonly tool?: string;
    readonly model?: string;
    readonly severity: number;
    readonly yaoState: YaoState;
    readonly archetype?: string;
    readonly parameters?: Record<string, any>;
    readonly reasoning?: string;
    readonly output?: string;
    readonly response?: string;
    readonly interaction: 'text' | 'voice' | 'vision' | 'silent';
    readonly todos: Todo[];
    readonly rollback?: string;
    readonly timestamp?: number;
    readonly dialectics?: {
        kimi: string;
        agent: string;
    };
}

export interface ModelResponse {
    readonly response: string;
    readonly model: string;
    readonly tokensUsed?: number;
    readonly latency?: number;
}

export interface ProsodyVector {
    readonly chaos: number;
    readonly whimsy: number;
    readonly darkTone: number;
    readonly coherence: number;
}

export interface GenerativeAesthetics {
    readonly visualFilter?: string;      // e.g., 'vibrant', 'noir', 'dreamy'
    readonly thermalVariance: number;    // 0.0 to 1.0 (influence on temperature/chaos)
    readonly scale: 'Grand' | 'Intimate' | 'Abstract';
    readonly palette?: string[];         // Preferred colors
    readonly prosody: ProsodyVector;
}

export interface SystemSensors {
    readonly buildPass: boolean;
    readonly userActive: boolean;
    readonly noRecentErrors: boolean;
    readonly substrateHealthy: boolean;
    readonly authorityLocal: boolean;
    readonly auditSync: boolean;
    readonly metabolicPressure?: number;
    readonly memoryPressure?: number;
}



export interface DecisionAuditRecord {
    readonly task: string;
    readonly input: any;
    readonly route: RoutingDecision;
    readonly context: any;
    readonly hexagram: string | number;
    readonly directive?: string;
    readonly selectedModel?: string;
    readonly complexity?: RoutingComplexity;
    readonly strategySource?: string;
    readonly latencyMs?: number;
    readonly timestamp?: number;   // Restored for TernaryRouter compatibility
    readonly fallbackUsed?: boolean;
    readonly fallbackReason?: string;
    readonly error?: string;
    readonly value?: string;
    readonly code?: string;
}

export interface Lesson {
    readonly id: string;
    readonly text: string;
    readonly embedding: Float32Array;
    readonly sessionId?: string;
    readonly projectId: string;
    readonly domainNamespace: string;
    readonly errorType?: string;
    readonly createdAt: number;
    readonly regretLikelihood?: number;
    readonly metadata: Record<string, any>;
    readonly hash?: string;
    readonly type?: string;
}

export type AIServiceType =
    | 'GEMINI' | 'CLOUDFLARE' | 'OLLAMA' | 'HUGGINGFACE' | 'OPENAI' | 'ANTHROPIC' | 'LOCAL' | 'NONE'
    | 'CLOUD_VISION' | 'DOCUMENT_AI' | 'HEALTH_AI' | 'VERTEX_AI' | 'SPEECH' | 'GEOSPATIAL'
    | 'MEDIA_FORGE' | 'GUTENBERG' | 'DISCOVERY' | 'GOOGLE';

export type AITaskType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'HEALTH' | 'GEO' | 'EMBEDDING' | 'VISION';

export interface AICapability {
    id: string;
    name: string;
    serviceType: AIServiceType;
    taskType: AITaskType;
    description: string;
    passthroughEnabled: boolean;
    modelId?: string;
    fallback?: string;
}

export interface ModelCallParams {
    model: string;
    prompt: string;
    systemPrompt?: string;
    maxTokens?: number;
    temperature?: number;
    maxRetries?: number;
    category?: string;
    format?: 'text' | 'json';
    images?: string[];
    tier?: 'Master' | 'Executive' | 'Reactive';
    yaoState?: YaoState;
    signal?: AbortSignal;
    isSystemPulse?: boolean;
}

export interface ModelExecutor {
    execute(params: ModelCallParams): Promise<Result<string>>;
    embed?(text: string): Promise<Result<Float32Array>>;
}

export interface ModelCallResult {
    ok: boolean;
    value: { response: string };
    error?: Error;
}

export type RoutingComplexity = 'low' | 'medium' | 'high' | 'extreme' | 'Vision' | 'Voice' | 'Orchestrator' | 'Chromanumber' | 'SovereignEye' | 'Yang' | 'Yin' | 'YinYang';

export enum CognitiveChoice {
    SIMPLE = 'simple',
    COMPLEX = 'complex',
    META = 'meta',
    EXTERNAL = 'external'
}

export interface TernaryDecision {
    logic: Ternary;
    reasoning: string;
}

export interface OraclePlan {
    steps: string[];
    goal: string;
}

export interface ExecutionStep {
    id: string;
    tool: string;
    params: any;
    args?: Record<string, any>;
    reasoning?: string;
    description?: string;
}

export interface ExecutionPlan {
    id: string;
    steps: ExecutionStep[];
}

export interface Validator {
    readonly name: string;
    validate(output: string, context?: any): Promise<ValidationResult>;
}

export type ConcealmentState = 'is' | 'isif' | 'isnot';

export interface ProductionPrerequisites {
    mandateAdversarialAudit: boolean;
    mandateBuildVerification: boolean;
    mandateHealthAudit: boolean;
    mandateMemoryConsolidation: boolean;
    severityThreshold: number;
}

/**
 * PRODUCTION PREREQUISITES MAP
 * Maps YaoState to strict enforcement rules for the AI Hive Mind.
 */
export const YAO_PRODUCTION_PREREQUISITES: Record<YaoState, ProductionPrerequisites> = {
    [YaoState.OldYang]: {
        mandateAdversarialAudit: true,
        mandateBuildVerification: true,
        mandateHealthAudit: false,
        mandateMemoryConsolidation: false,
        severityThreshold: 70
    },
    [YaoState.YoungYang]: {
        mandateAdversarialAudit: false,
        mandateBuildVerification: true,
        mandateHealthAudit: false,
        mandateMemoryConsolidation: false,
        severityThreshold: 30
    },
    [YaoState.OldYin]: {
        mandateAdversarialAudit: false,
        mandateBuildVerification: false,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: true,
        severityThreshold: 50
    },
    [YaoState.YoungYin]: {
        mandateAdversarialAudit: false,
        mandateBuildVerification: false,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: false,
        severityThreshold: 20
    },
    [YaoState.OldMixed]: {
        mandateAdversarialAudit: true,
        mandateBuildVerification: true,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: true,
        severityThreshold: 90
    },
    [YaoState.YoungMixed]: {
        mandateAdversarialAudit: false,
        mandateBuildVerification: true,
        mandateHealthAudit: true,
        mandateMemoryConsolidation: false,
        severityThreshold: 10
    }
};

export interface SovereignKnock {
    iChingSequence: string[];
    chromaticSoul: string;
    temporalFingerprint: string;
    anatomicalProof: {
        limbCount: number;
        structuralIntegrity: number;
    };
}
