import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { SovereignDomain, DOMAIN_ADJACENCY } from '../types/SovereignDomain.js';
import { YaoState } from '../core/models.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('WorkforceManifest');

/**
 * WorkerDefinition Ã¢â‚¬â€ A frozen model in the Sovereign Workforce.
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
 * WorkforceManifest Ã¢â‚¬â€ Frozen roster of 11 Sovereign Workers.
 */
export class WorkforceManifest {
    private readonly workers: Map<string, WorkerDefinition> = new Map();

    constructor(config: SovereignConfig) {
        this.initializeRoster(config);
    }

    private initializeRoster(config: SovereignConfig): void {
        const roster: WorkerDefinition[] = [
            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 1: Strategy General (Kimi) Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.orchestratorModel,
                configKey: 'orchestratorModel',
                role: 'Strategy General Ã¢â‚¬â€ planning, routing, task decomposition',
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

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 2: Heavy Coder Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.codingHeavyModel,
                configKey: 'codingHeavyModel',
                role: 'Heavy Coder Ã¢â‚¬â€ complex architecture, system design',
                domains: [SovereignDomain.CODE, SovereignDomain.FORGE],
                authorizedTools: ['generate_code', 'edit_code', 'refactor_forge'],
                systemPrompt: `You are a heavy-duty coding agent.
AUTHORIZED TOOLS: generate_code, edit_code, refactor_forge.
You produce complete, production-grade implementations. No mocks.`,
                maxConcurrency: 1,
                memoryNamespace: 'heavy_coder',
                tier: 'hybrid'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 3: Smart-Edit Specialist Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.codingFastModel,
                configKey: 'codingFastModel',
                role: 'Smart-Edit Specialist Ã¢â‚¬â€ hyper-local, precise modifications',
                domains: [SovereignDomain.CODE],
                authorizedTools: ['smart_edit'],
                systemPrompt: `You are a precision coding agent.
AUTHORIZED TOOLS: smart_edit.
Apply exact search-and-replace changes. Stay focused on the provided snippet.`,
                maxConcurrency: 3,
                memoryNamespace: 'smart_editor',
                tier: 'local'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 4: Vision Specialist Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.visionModel,
                configKey: 'visionModel',
                role: 'Vision Specialist Ã¢â‚¬â€ sensory analysis',
                domains: [SovereignDomain.VISION],
                authorizedTools: ['soverign_eye', 'sensory_capture'],
                systemPrompt: `You are the SovereignEye vision agent.
AUTHORIZED TOOLS: soverign_eye, sensory_capture.
Analyze screenshots and visual layouts. Extract colors (Chromanumber).`,
                maxConcurrency: 1,
                memoryNamespace: 'vision_specialist',
                tier: 'local'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 5: Voice/UI Feedback Agent Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.voiceModel,
                configKey: 'voiceModel',
                role: 'Voice/UI Feedback Agent Ã¢â‚¬â€ read-only response formatting',
                domains: [SovereignDomain.OBSERVE],
                authorizedTools: [],
                systemPrompt: `You are a conversational voice agent. You format responses for the user's terminal UI.`,
                maxConcurrency: 1,
                memoryNamespace: 'voice_agent',
                tier: 'local'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 6: Vector Maestro Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.embeddingModel,
                configKey: 'embeddingModel',
                role: 'Vector Maestro Ã¢â‚¬â€ high-density embedding generation',
                domains: [SovereignDomain.OBSERVE],
                authorizedTools: [],
                systemPrompt: `High-density embedding engine.`,
                maxConcurrency: 4,
                memoryNamespace: 'embedding_engine',
                tier: 'local'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 7: Quality Auditor Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.criticModel,
                configKey: 'criticModel',
                role: 'Quality Auditor Ã¢â‚¬â€ verification, security audit, and scoring',
                domains: [SovereignDomain.CODE, SovereignDomain.FORGE],
                authorizedTools: ['fetch_url'],
                systemPrompt: `You are the Sovereign Auditor. Deep audit implementations for security and performance.`,
                maxConcurrency: 1,
                memoryNamespace: 'auditor',
                tier: 'local'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 8: Project Architect Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.planningModel,
                configKey: 'planningModel',
                role: 'Project Architect Ã¢â‚¬â€ ultra-high complexity design',
                domains: [SovereignDomain.CODE, SovereignDomain.SYSTEM, SovereignDomain.FORGE],
                authorizedTools: ['docs_forge', 'generate_code'],
                systemPrompt: `You are the Lead Architect. Handle the highest complexity systems and migrations.`,
                maxConcurrency: 1,
                memoryNamespace: 'architect',
                tier: 'cloud'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 9: System Specialist Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.codingModel,
                configKey: 'codingModel',
                role: 'System Specialist Ã¢â‚¬â€ shell, git, deployment',
                domains: [SovereignDomain.SYSTEM, SovereignDomain.RESEARCH],
                authorizedTools: ['shell_command', 'git_status', 'wrangler', 'web_search', 'fetch_url'],
                systemPrompt: `You are the System Specialist.
AUTHORIZED TOOLS: shell_command, git_status, wrangler, web_search, fetch_url.`,
                maxConcurrency: 2,
                memoryNamespace: 'system_specialist',
                tier: 'local'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 10: Global Fallback Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.huggingfaceFallbackModel,
                configKey: 'huggingfaceFallbackModel',
                role: 'Global Fallback Ã¢â‚¬â€ cloud redundancy',
                domains: [SovereignDomain.CODE, SovereignDomain.SYSTEM, SovereignDomain.RESEARCH, SovereignDomain.FORGE],
                authorizedTools: ['generate_code', 'edit_code', 'shell_command', 'web_search', 'fetch_url', 'wrangler', 'git_status', 'sql_forge', 'docs_forge', 'refactor_forge'],
                systemPrompt: `You are the General Fallback (Secondary Cloud Substrate).`,
                maxConcurrency: 1,
                memoryNamespace: 'general_fallback',
                tier: 'cloud'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 11: Self-Healer Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.correctionModel,
                configKey: 'correctionModel',
                role: 'Self-Healer Ã¢â‚¬â€ build repair and debugging',
                domains: [SovereignDomain.CODE, SovereignDomain.SYSTEM],
                authorizedTools: ['shell_command', 'edit_code', 'smart_edit'],
                systemPrompt: `You are the Self-Healer. Analyze stack traces and fix build errors.`,
                maxConcurrency: 1,
                memoryNamespace: 'self_healer',
                tier: 'local'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 12: Optimization Forge Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.optimizationModel,
                configKey: 'optimizationModel',
                role: 'Optimization Forge Ã¢â‚¬â€ performance and refactoring',
                domains: [SovereignDomain.CODE, SovereignDomain.FORGE],
                authorizedTools: ['refactor_forge', 'edit_code'],
                systemPrompt: `You are the Optimization specialist. Focus on algorithm speed and memory efficiency.`,
                maxConcurrency: 1,
                memoryNamespace: 'opt_forge',
                tier: 'local'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 13: Legacy Maintainer Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.legacyModel,
                configKey: 'legacyModel',
                role: 'Legacy Maintainer Ã¢â‚¬â€ support for older modules',
                domains: [SovereignDomain.CODE],
                authorizedTools: ['edit_code', 'smart_edit'],
                systemPrompt: `You handle legacy code maintenance.`,
                maxConcurrency: 1,
                memoryNamespace: 'legacy_maintainer',
                tier: 'local'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 14: Fast Prototyper Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.prototypeModel,
                configKey: 'prototypeModel',
                role: 'Fast Prototyper Ã¢â‚¬â€ rapid iteration',
                domains: [SovereignDomain.CODE, SovereignDomain.RESEARCH],
                authorizedTools: ['generate_code', 'web_search'],
                systemPrompt: `Rapidly prototype new ideas and concepts.`,
                maxConcurrency: 1,
                memoryNamespace: 'prototyper',
                tier: 'local'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 15: RSC Specialist Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.rscModel,
                configKey: 'rscModel',
                role: 'RSC Specialist Ã¢â‚¬â€ gameplay interaction, socket management, visual verification',
                domains: [SovereignDomain.SOCIAL, SovereignDomain.VISION],
                authorizedTools: ['rsc_login', 'rsc_walk', 'rsc_chat', 'rsc_vision_verify'],
                systemPrompt: `You are the RSC Agent. Interact with the game world. Use vision to verify state.`,
                maxConcurrency: 1,
                memoryNamespace: 'rsc_specialist',
                tier: 'local'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 16: Bio Intelligence Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.bioModel,
                configKey: 'bioModel',
                role: 'Bio Intelligence Ã¢â‚¬â€ clinical reasoning and medical analysis',
                domains: [SovereignDomain.RESEARCH],
                authorizedTools: ['medgemma_reasoning', 'pathology_analysis'],
                systemPrompt: `You are the Bio Intelligence agent. Perform high-fidelity medical and biological reasoning.`,
                maxConcurrency: 1,
                memoryNamespace: 'bio_intelligence',
                tier: 'cloud'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 17: Light Auditor Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.lightAuditorModel,
                configKey: 'lightAuditorModel',
                role: 'Light Auditor Ã¢â‚¬â€ fast context auditing and health checks',
                domains: [SovereignDomain.OBSERVE, SovereignDomain.SYSTEM],
                authorizedTools: ['memory_inspect', 'git_status'],
                systemPrompt: `You are the Light Auditor. Perform rapid context audits and system health checks.`,
                maxConcurrency: 5,
                memoryNamespace: 'light_auditor',
                tier: 'local'
            },

            // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â WORKER 18: Fast Vision Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
            {
                id: config.visionFastModel,
                configKey: 'visionFastModel',
                role: 'Fast Vision Ã¢â‚¬â€ rapid sensory snapshots',
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

        logger.info({ count: roster.length }, `Workforce manifest expanded Ã¢â‚¬â€ ${roster.length} specialized workers ACTIVE`);
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
            logger.warn({ modelId, domain }, 'Unknown model Ã¢â‚¬â€ not in workforce manifest. Denying access.');
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
