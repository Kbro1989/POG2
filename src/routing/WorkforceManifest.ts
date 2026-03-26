import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { SovereignDomain, DOMAIN_ADJACENCY } from '../types/SovereignDomain.js';
import { YaoState } from '../core/models.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('WorkforceManifest');

/**
 * WorkerDefinition â€” A frozen model in the Sovereign Workforce.
 * Each worker has:
 * - A single responsibility (role)
 * - Scoped domains it's authorized to operate in
 * - An isolated system prompt (NOT the shared SOVEREIGN_SYSTEM_PROMPT)
 * - An isolated memory namespace for VectorDB
 * - A concurrency limit
 */
export interface WorkerRateLimits {
    readonly requestsPerMinute: number;
    readonly requestsPerDay: number;
    readonly provider: 'ollama' | 'huggingface' | 'cloudflare' | 'gemini' | 'local';
}

export interface WorkerDefinition {
    readonly id: string;
    readonly configKey: string;
    readonly role: string;
    readonly domains: readonly SovereignDomain[];
    readonly authorizedTools: readonly string[];
    readonly systemPrompt: string;
    readonly maxConcurrency: number;
    readonly memoryNamespace: string;
    readonly tier: 'local' | 'cloud' | 'hybrid';
    readonly rateLimits?: WorkerRateLimits;
    readonly biologicalFunction?: string;
}

/**
 * WorkforceManifest â€” Frozen roster of 11 Sovereign Workers.
 */
export class WorkforceManifest {
    private readonly workers: Map<string, WorkerDefinition> = new Map();

    constructor(config: SovereignConfig) {
        this.initializeRoster(config);
    }

    private initializeRoster(config: SovereignConfig): void {
        const roster: WorkerDefinition[] = [
            // â•â•â• WORKER 1: Strategy General (Kimi) â•â•â•
            {
                id: config.orchestratorModel,
                configKey: 'orchestratorModel',
                role: 'Strategy General â€” planning, routing, task decomposition',
                domains: [SovereignDomain.CODE, SovereignDomain.SYSTEM, SovereignDomain.RESEARCH, SovereignDomain.FORGE],
                authorizedTools: [], // Orchestrator directs, never executes machinery directly
                systemPrompt: `You are the Strategic Brain, the Strategy General of the POG2 Sovereign Runtime.
You coordinate specialized workers. You NEVER execute tools directly.
Your role is to assign SEVERITY (0-100), YAO STATE (0-3), and select the optimal worker/tool.
Return valid JSON plans ONLY.`,
                maxConcurrency: 1,
                memoryNamespace: 'kimi_orchestrator',
                tier: 'hybrid'
            },

            // â•â•â• WORKER 2: Heavy Coder â•â•â•
            {
                id: config.codingHeavyModel,
                configKey: 'codingHeavyModel',
                role: 'Heavy Coder â€” complex architecture, system design',
                domains: [SovereignDomain.CODE, SovereignDomain.FORGE],
                authorizedTools: ['generate_code', 'edit_code', 'refactor_forge'],
                systemPrompt: `You are a heavy-duty coding agent.
AUTHORIZED TOOLS: generate_code, edit_code, refactor_forge.
You produce complete, production-grade implementations. No mocks.`,
                maxConcurrency: 1,
                memoryNamespace: 'heavy_coder',
                tier: 'hybrid'
            },

            // â•â•â• WORKER 3: Smart-Edit Specialist â•â•â•
            {
                id: config.codingFastModel,
                configKey: 'codingFastModel',
                role: 'Smart-Edit Specialist â€” hyper-local, precise modifications',
                domains: [SovereignDomain.CODE],
                authorizedTools: ['smart_edit'],
                systemPrompt: `You are a precision coding agent.
AUTHORIZED TOOLS: smart_edit.
Apply exact search-and-replace changes. Stay focused on the provided snippet.`,
                maxConcurrency: 3,
                memoryNamespace: 'smart_editor',
                tier: 'local'
            },

            // â•â•â• WORKER 4: Vision Specialist â•â•â•
            {
                id: config.visionModel,
                configKey: 'visionModel',
                role: 'Vision Specialist â€” sensory analysis',
                domains: [SovereignDomain.VISION],
                authorizedTools: ['soverign_eye', 'sensory_capture'],
                systemPrompt: `You are the SovereignEye vision agent.
AUTHORIZED TOOLS: soverign_eye, sensory_capture.
Analyze screenshots and visual layouts. Extract colors (Chromanumber).`,
                maxConcurrency: 1,
                memoryNamespace: 'vision_specialist',
                tier: 'local'
            },

            // â•â•â• WORKER 5: Voice/UI Feedback Agent â•â•â•
            {
                id: config.voiceModel,
                configKey: 'voiceModel',
                role: 'Voice/UI Feedback Agent â€” read-only response formatting',
                domains: [SovereignDomain.OBSERVE],
                authorizedTools: [],
                systemPrompt: `You are a conversational voice agent. You format responses for the user's terminal UI.`,
                maxConcurrency: 1,
                memoryNamespace: 'voice_agent',
                tier: 'local'
            },

            // â•â•â• WORKER 6: Vector Maestro â•â•â•
            {
                id: config.embeddingModel,
                configKey: 'embeddingModel',
                role: 'Vector Maestro â€” high-density embedding generation',
                domains: [SovereignDomain.OBSERVE],
                authorizedTools: [],
                systemPrompt: `High-density embedding engine.`,
                maxConcurrency: 4,
                memoryNamespace: 'embedding_engine',
                tier: 'local'
            },

            // â•â•â• WORKER 7: Quality Auditor â•â•â•
            {
                id: config.criticModel,
                configKey: 'criticModel',
                role: 'Quality Auditor â€” verification, security audit, and scoring',
                domains: [SovereignDomain.CODE, SovereignDomain.FORGE],
                authorizedTools: ['fetch_url'],
                systemPrompt: `You are the Sovereign Auditor. Deep audit implementations for security and performance.`,
                maxConcurrency: 1,
                memoryNamespace: 'auditor',
                tier: 'local'
            },

            // â•â•â• WORKER 8: Project Architect â•â•â•
            {
                id: config.planningModel,
                configKey: 'planningModel',
                role: 'Project Architect â€” ultra-high complexity design',
                domains: [SovereignDomain.CODE, SovereignDomain.SYSTEM, SovereignDomain.FORGE],
                authorizedTools: ['docs_forge', 'generate_code'],
                systemPrompt: `You are the Lead Architect. Handle the highest complexity systems and migrations.`,
                maxConcurrency: 1,
                memoryNamespace: 'architect',
                tier: 'cloud'
            },

            // â•â•â• WORKER 9: System Specialist â•â•â•
            {
                id: config.codingModel,
                configKey: 'codingModel',
                role: 'System Specialist â€” shell, git, deployment',
                domains: [SovereignDomain.SYSTEM, SovereignDomain.RESEARCH],
                authorizedTools: ['shell_command', 'git_status', 'wrangler', 'web_search', 'fetch_url'],
                systemPrompt: `You are the System Specialist.
AUTHORIZED TOOLS: shell_command, git_status, wrangler, web_search, fetch_url.`,
                maxConcurrency: 2,
                memoryNamespace: 'system_specialist',
                tier: 'local'
            },

            // â•â•â• WORKER 10: Global Fallback â•â•â•
            {
                id: config.huggingfaceFallbackModel,
                configKey: 'huggingfaceFallbackModel',
                role: 'Global Fallback â€” cloud redundancy',
                domains: [SovereignDomain.CODE, SovereignDomain.SYSTEM, SovereignDomain.RESEARCH, SovereignDomain.FORGE],
                authorizedTools: ['generate_code', 'edit_code', 'shell_command', 'web_search', 'fetch_url', 'wrangler', 'git_status', 'sql_forge', 'docs_forge', 'refactor_forge'],
                systemPrompt: `You are the General Fallback (Secondary Cloud Substrate).`,
                maxConcurrency: 1,
                memoryNamespace: 'general_fallback',
                tier: 'cloud'
            },

            // â•â•â• WORKER 11: Self-Healer â•â•â•
            {
                id: config.correctionModel,
                configKey: 'correctionModel',
                role: 'Self-Healer â€” build repair and debugging',
                domains: [SovereignDomain.CODE, SovereignDomain.SYSTEM],
                authorizedTools: ['shell_command', 'edit_code', 'smart_edit'],
                systemPrompt: `You are the Self-Healer. Analyze stack traces and fix build errors.`,
                maxConcurrency: 1,
                memoryNamespace: 'self_healer',
                tier: 'local'
            },

            // â•â•â• WORKER 12: Optimization Forge â•â•â•
            {
                id: config.optimizationModel,
                configKey: 'optimizationModel',
                role: 'Optimization Forge â€” performance and refactoring',
                domains: [SovereignDomain.CODE, SovereignDomain.FORGE],
                authorizedTools: ['refactor_forge', 'edit_code'],
                systemPrompt: `You are the Optimization specialist. Focus on algorithm speed and memory efficiency.`,
                maxConcurrency: 1,
                memoryNamespace: 'opt_forge',
                tier: 'local'
            },

            // â•â•â• WORKER 13: Legacy Maintainer â•â•â•
            {
                id: config.legacyModel,
                configKey: 'legacyModel',
                role: 'Legacy Maintainer â€” support for older modules',
                domains: [SovereignDomain.CODE],
                authorizedTools: ['edit_code', 'smart_edit'],
                systemPrompt: `You handle legacy code maintenance.`,
                maxConcurrency: 1,
                memoryNamespace: 'legacy_maintainer',
                tier: 'local'
            },

            // â•â•â• WORKER 14: Fast Prototyper â•â•â•
            {
                id: config.prototypeModel,
                configKey: 'prototypeModel',
                role: 'Fast Prototyper â€” rapid iteration',
                domains: [SovereignDomain.CODE, SovereignDomain.RESEARCH],
                authorizedTools: ['generate_code', 'web_search'],
                systemPrompt: `Rapidly prototype new ideas and concepts.`,
                maxConcurrency: 1,
                memoryNamespace: 'prototyper',
                tier: 'local'
            },

            // â•â•â• WORKER 15: RSC Specialist â•â•â•
            {
                id: config.rscModel,
                configKey: 'rscModel',
                role: 'RSC Specialist â€” gameplay interaction, socket management, visual verification',
                domains: [SovereignDomain.SOCIAL, SovereignDomain.VISION],
                authorizedTools: ['rsc_login', 'rsc_walk', 'rsc_chat', 'rsc_vision_verify'],
                systemPrompt: `You are the RSC Agent. Interact with the game world. Use vision to verify state.`,
                maxConcurrency: 1,
                memoryNamespace: 'rsc_specialist',
                tier: 'local'
            },

            // â•â•â• WORKER 16: Bio Intelligence â•â•â•
            {
                id: config.bioModel,
                configKey: 'bioModel',
                role: 'Bio Intelligence â€” clinical reasoning and medical analysis',
                domains: [SovereignDomain.RESEARCH],
                authorizedTools: ['medgemma_reasoning', 'pathology_analysis'],
                systemPrompt: `You are the Bio Intelligence agent. Perform high-fidelity medical and biological reasoning.`,
                maxConcurrency: 1,
                memoryNamespace: 'bio_intelligence',
                tier: 'cloud'
            },

            // â•â•â• WORKER 17: Light Auditor â•â•â•
            {
                id: config.lightAuditorModel,
                configKey: 'lightAuditorModel',
                role: 'Light Auditor â€” fast context auditing and health checks',
                domains: [SovereignDomain.OBSERVE, SovereignDomain.SYSTEM],
                authorizedTools: ['memory_inspect', 'git_status'],
                systemPrompt: `You are the Light Auditor. Perform rapid context audits and system health checks.`,
                maxConcurrency: 5,
                memoryNamespace: 'light_auditor',
                tier: 'local'
            },

            // â•â•â• WORKER 18: Fast Vision â•â•â•
            {
                id: config.visionFastModel,
                configKey: 'visionFastModel',
                role: 'Fast Vision â€” rapid sensory snapshots',
                domains: [SovereignDomain.VISION],
                authorizedTools: ['soverign_eye'],
                systemPrompt: `You are the Fast Vision agent. Capture rapid sensory snapshots.`,
                maxConcurrency: 2,
                memoryNamespace: 'vision_fast',
                tier: 'local'
            }
        ];

        for (const worker of roster) {
            this.workers.set(worker.id, worker);
            // Also register by config key for lookup
            this.workers.set(worker.configKey, worker);
        }

        logger.info({ count: roster.length }, `Workforce manifest expanded â€” ${roster.length} specialized workers ACTIVE`);
    }

    /**
     * Get a worker by model ID or config key.
     */
    getWorker(modelIdOrKey: string): WorkerDefinition | undefined {
        // Direct lookup
        const direct = this.workers.get(modelIdOrKey);
        if (direct) return direct;

        // Partial match for Ollama model names (e.g., "yi-coder" matches "yi-coder:9b-chat-q5_K_M")
        for (const [key, worker] of this.workers.entries()) {
            if (key.includes(modelIdOrKey) || modelIdOrKey.includes(key)) {
                return worker;
            }
        }
        return undefined;
    }

    /**
     * Check if a model is authorized for a given domain.
     */
    isModelAuthorized(modelId: string, domain: SovereignDomain): boolean {
        const worker = this.getWorker(modelId);
        if (!worker) {
            logger.warn({ modelId, domain }, 'Unknown model â€” not in workforce manifest. Denying access.');
            return false;
        }
        return worker.domains.includes(domain);
    }

    /**
     * Get the isolated system prompt for a model.
     * Falls back to the generic SOVEREIGN_SYSTEM_PROMPT if the model is not in the manifest.
     */
    getSystemPrompt(modelId: string): string | undefined {
        return this.getWorker(modelId)?.systemPrompt;
    }

    /**
     * Get the memory namespace for a model.
     */
    getMemoryNamespace(modelId: string): string {
        return this.getWorker(modelId)?.memoryNamespace ?? 'global';
    }

    /**
     * Get all workers authorized for a given domain.
     */
    getWorkersForDomain(domain: SovereignDomain): WorkerDefinition[] {
        const result: WorkerDefinition[] = [];
        const seen = new Set<string>();
        for (const worker of this.workers.values()) {
            if (!seen.has(worker.id) && worker.domains.includes(domain)) {
                result.push(worker);
                seen.add(worker.id);
            }
        }
        return result;
    }

    /**
     * Get the workforce roster count (unique workers only).
     */
    getRosterSize(): number {
        const unique = new Set<string>();
        for (const worker of this.workers.values()) {
            unique.add(worker.id);
        }
        return unique.size;
    }

    /**
     * Get the full roster for status/diagnostic display.
     */
    getRoster(): WorkerDefinition[] {
        const seen = new Set<string>();
        const result: WorkerDefinition[] = [];
        for (const worker of this.workers.values()) {
            if (!seen.has(worker.id)) {
                result.push(worker);
                seen.add(worker.id);
            }
        }
        return result;
    }
}
