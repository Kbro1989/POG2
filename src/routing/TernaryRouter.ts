import pino from 'pino';
import { exec } from 'child_process';
import { promisify } from 'util';
import { type Ternary, type Result, YaoState, type DecisionAuditRecord, type RoutingComplexity, type ContextCard, EmotionalState } from '../core/models.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import { HexagramManager } from './HexagramManager.js';
import type { ContextBuilder } from '../engines/ContextBuilder.js';
import type { TrainingCollector } from '../utils/TrainingCollector.js';
import type { ModelRolodex } from '../api/ai/ModelRolodex.js';
import { SovereignIgnoreManager } from '../utils/SovereignIgnoreManager.js';
import { getSovereignRoot } from '../utils/SovereignPathResolver.js';
import type { SovereignKnock, ConcealmentState } from '../core/models.js';
import type { ChromaLimb } from '../limbs/spatial/ChromaLimb.js';
import type { BioIntelligenceLimb } from '../limbs/spatial/BioIntelligenceLimb.js';
import type { MemoryConsolidationEngine } from '../engines/MemoryConsolidationEngine.js';
import type { QuotaTracker, QuotaProvider } from '../utils/QuotaTracker.js';

const execAsync = promisify(exec);
const logger = pino({ name: 'TernaryRouter', base: { hostname: 'POG2' } });

/**
 * Ternary routing decisions:
 *   Yang     = High complexity
 *   YinYang  = Medium
 *   Yin      = Low complexity
 */
export interface RouteDecision {
    model: string;
    complexity: RoutingComplexity;
    tier: 'Master' | 'Executive' | 'Reactive';
    reasoning: string;
    yaoState: YaoState;
    fallbackUsed: boolean;
    fallbackReason?: string;
    directive?: string;
    metadata?: Record<string, any>;
    timestamp?: number;
}

const COMPLEXITY_KEYWORDS: Record<string, RegExp> = {
    Yang: /\b(architect|system|design|microservice|refactor entire|migrate|restructure|complex|enterprise|distributed|concurrent|async.*pipeline|multi.*step)\b/i,
    YinYang: /\b(implement|create|generate|write|improve|update|fix|add feature|integrate)\b/i,
    Yin: /\b(explain|what is|rename|format|comment|simple|quick|small|trivial|lint)\b/i,
    Vision: /\b(see|look|image|screenshot|picture|analyze this view)\b/i,
    Voice: /\b(speak|say|listen|voice|audio)\b/i,
    Orchestrator: /\b(plan|orchestrate|decide|manage|coordinate)\b/i,
    Chromanumber: /\b(decompile|color map|hex code|pixel|lines between colors|palette)\b/i,
    SovereignEye: /\b(windows process|screenshot current|view screen|full screen|api search result)\b/i,
    Telemetry: /\b(telemetry|heartbeat|pulse|monitor|stream|audit|clinical|medical|stream)\b/i
};

export class TernaryRouter {
    private readonly config: SovereignConfig;
    private readonly hexagram: HexagramManager;
    private readonly availableLocalModels: Set<string> = new Set();
    private readonly modelFailures: Map<string, number> = new Map();
    private lastSyncAt = 0;
    private readonly SYNC_INTERVAL_MS = 60_000;
    private readonly MAX_FAILURES = 3;
    private contextBuilder?: ContextBuilder;
    private trainingCollector?: TrainingCollector;
    private rolodex?: ModelRolodex;
    private chromaLimb?: ChromaLimb;
    private bioIntelligence?: BioIntelligenceLimb;
    private memoryConsolidation?: MemoryConsolidationEngine;
    private quotaTracker?: QuotaTracker;
    private readonly decisionHistory: DecisionAuditRecord[] = [];
    private readonly executionMetrics: { totalTokens: number; fastPaths: number; deepPaths: number } = { totalTokens: 0, fastPaths: 0, deepPaths: 0 };

    // Cooldown tracking for Kimi endpoints (Ollama vs HF 61-min alternating)
    private ollamaCooldownUntil = 0;
    private hfCooldownUntil = 0;
    private cloudOutageUntil = 0;
    private readonly COOLDOWN_DURATION_MS = 61 * 60 * 1000; // 61 minutes
    private readonly CLOUD_OUTAGE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

    constructor(config: SovereignConfig) {
        this.config = config;
        this.hexagram = HexagramManager.getInstance();
    }

    /** Inject ContextBuilder for FPRAG retrieval (called after construction) */
    setContextBuilder(cb: ContextBuilder): void {
        this.contextBuilder = cb;
    }

    /** Inject TrainingCollector for FPRAG decision persistence */
    setTrainingCollector(tc: TrainingCollector): void {
        this.trainingCollector = tc;
    }

    /** Inject ModelRolodex for dynamic model discovery and sovereign override */
    setRolodex(rolodex: ModelRolodex): void {
        this.rolodex = rolodex;
    }

    getRolodex(): ModelRolodex | undefined {
        return this.rolodex;
    }

    setChromaLimb(limb: ChromaLimb): void {
        this.chromaLimb = limb;
    }

    setBioIntelligence(limb: BioIntelligenceLimb): void {
        this.bioIntelligence = limb;
    }

    setMemoryConsolidationEngine(engine: MemoryConsolidationEngine): void {
        this.memoryConsolidation = engine;
    }

    /** Inject QuotaTracker for free-tier FinOps gating */
    setQuotaTracker(qt: QuotaTracker): void {
        this.quotaTracker = qt;
    }

    getQuotaTracker(): QuotaTracker | undefined {
        return this.quotaTracker;
    }

    /**
     * sovereignKnock - Core authentication primitive for Sovereign Substrate.
     * Uses metaphysical and structural proofs to validate access.
     */
    public async sovereignKnock(knock: SovereignKnock): Promise<Result<ConcealmentState>> {
        // 1. Hexagram validation
        if (!knock.iChingSequence || knock.iChingSequence.length !== 6) {
            return { ok: false, error: new Error('Invalid sequence: Require 6 Hexagrams') };
        }
        // In full impl, this validates the actual progression of the I Ching sequences
        // against the current HexagramManager instance state.

        // 2. Chroma verification
        if (this.chromaLimb) {
            const chromaValid = await this.chromaLimb.validateChromaticSoul(knock.chromaticSoul);
            if (!chromaValid) return { ok: false, error: new Error('Chromatic mismatch') };
        }

        // 3. Temporal fingerprint (replay protection)
        if (this.memoryConsolidation) {
            const nonceValid = await this.memoryConsolidation.validateNonce(knock.temporalFingerprint);
            if (!nonceValid) return { ok: false, error: new Error('Replay detected') };
        }

        // 4. Anatomical proof (33-limb consensus)
        if (this.bioIntelligence) {
            const anatomyValid = await this.bioIntelligence.validateStructure(knock.anatomicalProof);
            if (!anatomyValid) return { ok: false, error: new Error('Structural failure: Anatomical proof invalid') };
        }

        // 5. State transition
        logger.info('✨ SovereignKnock sequence validated successfully. Concealment state updated to: isnot');
        return { ok: true, value: 'isnot' };
    }

    /**
     * Functional probe for Ollama substrate.
     */
    public async pingSubstrate(): Promise<{ online: boolean; modelCount: number; details: string }> {
        try {
            await this.syncLocalModels();
            return {
                online: this.availableLocalModels.size > 0,
                modelCount: this.availableLocalModels.size,
                details: `Ollama responsive with ${this.availableLocalModels.size} models.`
            };
        } catch (e) {
            return { online: false, modelCount: 0, details: `Ollama unreachable: ${(e as Error).message}` };
        }
    }

    public getExecutionMetrics() {
        return { ...this.executionMetrics };
    }

    public getHexagram(): HexagramManager {
        return this.hexagram;
    }

    /**
     * Classify prompt complexity and intent.
     */
    async classify(prompt: string): Promise<RoutingComplexity> {
        if (COMPLEXITY_KEYWORDS.Chromanumber.test(prompt)) return 'Chromanumber';
        if (COMPLEXITY_KEYWORDS.SovereignEye.test(prompt)) return 'SovereignEye';
        if (COMPLEXITY_KEYWORDS.Vision.test(prompt)) return 'Vision';
        if (COMPLEXITY_KEYWORDS.Voice.test(prompt)) return 'Voice';
        if (COMPLEXITY_KEYWORDS.Orchestrator.test(prompt)) return 'Orchestrator';

        // Standard code complexity scoring...
        const wordCount = prompt.split(/\s+/).length;
        const codeDensity = (prompt.match(/\b(function|class|const|interface|type|async|await|import|export)\b/g) || []).length;

        let score = 0;

        // Phase 85: Ignore-Aware Routing
        // If the prompt refers to ignored paths, it's likely a trivial or "Yin" request.
        const systemRoot = getSovereignRoot();
        const pathMatches = prompt.match(/[a-zA-Z0-9._/-]+/g) || [];
        for (const p of pathMatches) {
            if (p.includes('/') && SovereignIgnoreManager.isIgnored(systemRoot, p)) {
                score -= 2; // Significant penalty for focusing on boilerplate
            }
        }

        if (wordCount > 80) score += 2;
        if (codeDensity > 5) score += 2;
        if (COMPLEXITY_KEYWORDS.Yang.test(prompt)) score += 3;
        else if (COMPLEXITY_KEYWORDS.YinYang.test(prompt)) score += 1;
        else if (COMPLEXITY_KEYWORDS.Yin.test(prompt)) score -= 1;

        if (score >= 4) return 'Yang';
        if (score >= 1) return 'YinYang';
        return 'Yin';
    }

    /**
     * Determine if a task qualifies for the "Fast Path" (bypassing heavy sync/retrieval).
     */
    private isFastPath(prompt: string): boolean {
        // Trivial/Reactive keywords that don't need deep context or master-tier models
        const fastKeywords = /\b(rename|format|comment|lint|what is|how do i|who are you|hello|hi|clear|status|health)\b/i;
        const lowComplexity = prompt.split(/\s+/).length < 20 && !/\b(function|class|interface|refactor|restructure)\b/i.test(prompt);
        return fastKeywords.test(prompt) || lowComplexity;
    }

    /**
     * Classify the Yao state based on intent (Stability vs Transformation) + Emotional Hooks.
     */
    classifyYao(prompt: string, complexity: RoutingComplexity): YaoState {
        const lower = prompt.toLowerCase();
        const isTransform = /\b(refactor|migrate|restructure|delete|remove|revert|rollback|escalate|extreme|critical|pivot)\b/i.test(lower);

        // Emotional Hooks: Organic influence from the Hexagram substrate
        const interpretation = this.hexagram.getInterpretation();
        const emotion = interpretation.emotion;

        // Agitated/Decisive states favor Transformation (Old)
        const emotionalPush = (emotion === EmotionalState.Agitated || emotion === EmotionalState.Decisive);

        if (complexity === 'Yang' || complexity === 'Vision' || complexity === 'Orchestrator') {
            return (isTransform || emotionalPush) ? YaoState.OldYang : YaoState.YoungYang;
        } else {
            return (isTransform || emotionalPush) ? YaoState.OldYin : YaoState.YoungYin;
        }
    }

    /**
     * Route to the best model based on role and complexity.
     * FPRAG Pipeline: Retrieval â†’ State Derivation â†’ Decision â†’ Audit
     * @param complexity - The ternary complexity classification
     * @param taskType - Optional task type hint
     * @param prompt - Optional raw prompt for FPRAG pre-flight (retrieval + organism state)
     */
    async route(complexity: RoutingComplexity, taskType?: string, prompt?: string): Promise<RouteDecision> {
        const routeStartTime = Date.now();

        // === PHASE 6: SOVEREIGN OVERRIDE (Cloud-Down Detection) ===
        if (this.rolodex?.isAllCloudDown() && this.rolodex.isOllamaAlive()) {
            logger.warn('🛡️ SOVEREIGN OVERRIDE: All cloud endpoints DOWN. Routing ALL traffic to local Ollama.');
            const ollamaModels = this.rolodex.getModelsForProvider('ollama');
            const bestLocal = ollamaModels.length > 0 ? ollamaModels[0].id : this.config.localFallbackModel;
            return {
                model: bestLocal,
                complexity,
                tier: 'Master',
                reasoning: 'SOVEREIGN OVERRIDE: All cloud endpoints unreachable. Local Ollama substrate taking full control.',
                yaoState: YaoState.OldYang,
                fallbackUsed: true,
                fallbackReason: 'All cloud providers offline — sovereign local override active',
                timestamp: routeStartTime
            };
        }

        // === FAST PATH OPTIMIZATION ===
        const fastPath = prompt ? this.isFastPath(prompt) : false;

        if (!fastPath) {
            await this.syncLocalModels();
        } else {
            this.executionMetrics.fastPaths++;
        }

        // === FPRAG PRE-FLIGHT ===
        // 1. Retrieve lessons from VectorDB (if prompt and ContextBuilder available and NOT fast path)
        let lessons: any[] = [];
        if (prompt && this.contextBuilder && !fastPath) {
            try {
                lessons = await this.contextBuilder.queryLessons(prompt);
            } catch (err) {
                // Non-fatal retrieval failure
            }
        }

        // 2. Derive organism state from hexagram lines
        const currentHexLines = this.hexagram.getLines();
        const currentYao = this.deriveOrganismState(currentHexLines);

        // 3. Derive intent state from ternary signals
        const localAvailability = this.availableLocalModels.size > 0 ? YaoState.YoungYang : YaoState.OldYin;
        const historySignal = this.deriveHistorySignal();
        const architectureAlignmentState = lessons.length > 0 ? YaoState.YoungYang : YaoState.YoungYin;
        const intentYao = this.deriveIntentState(localAvailability, historySignal, architectureAlignmentState);

        // 4. Consult hexagram decision matrix
        const directive = this.hexagram.decide(currentYao, intentYao);

        let decision: RouteDecision;

        // Organic Polarized Routing for Specialized Substrates
        const organicYao = this.hexagram.isYin() ? YaoState.YoungYin : YaoState.YoungYang;

        // 1. Specialized Substrate Routing
        if (complexity === 'Chromanumber') {
            decision = { model: this.config.imageGenModel, complexity: 'Chromanumber', tier: 'Reactive', reasoning: 'Chromanumber substrate: Visual metabolic mapping', yaoState: YaoState.YoungYin, fallbackUsed: false, timestamp: routeStartTime };
        } else if (complexity === 'SovereignEye') {
            decision = { model: this.config.visionModel, complexity: 'SovereignEye', tier: 'Executive', reasoning: 'SovereignEye substrate: Sensory proprioception', yaoState: organicYao, fallbackUsed: false, timestamp: routeStartTime };
        } else if (complexity === 'Vision') {
            const model = this.findWorkingModel(this.config.visionModel, ['moondream', 'llava']);
            decision = { model, complexity: 'Vision', tier: 'Executive', reasoning: 'Visual task routed via Sensory limb', yaoState: organicYao, fallbackUsed: false, timestamp: routeStartTime };
        } else if (complexity === 'Voice') {
            decision = { model: this.config.voiceModel, complexity: 'Voice', tier: 'Reactive', reasoning: 'Audio task routed via Motor limb', yaoState: YaoState.YoungYin, fallbackUsed: false, timestamp: routeStartTime };
        }

        // 2. Orchestration Routing (Kimi)
        else if (complexity === 'Orchestrator') {
            const usingHfAllowed = !!this.config.primaryCloudApiKey;
            const ollamaOnCooldown = this.isOllamaOnCooldown();
            const hfOnCooldown = this.isHfOnCooldown();

            if (ollamaOnCooldown && usingHfAllowed && !hfOnCooldown) {
                const status = this.getCooldownStatus();
                decision = {
                    model: this.config.huggingfaceFallbackModel,
                    complexity: 'Orchestrator',
                    tier: 'Master',
                    reasoning: `Primary Neural Substrate on cooldown (${status.ollamaRemainingMinutes}m left) â€” failing over to Secondary Substrate`,
                    yaoState: YaoState.OldYang,
                    fallbackUsed: true,
                    fallbackReason: `Primary Substrate cooldown (${status.ollamaRemainingMinutes}m remaining)`,
                    timestamp: routeStartTime
                };
            } else if (ollamaOnCooldown && hfOnCooldown) {
                decision = {
                    model: this.config.localFallbackModel,
                    complexity: 'Orchestrator',
                    tier: 'Master',
                    reasoning: `CRITICAL: Both cloud endpoints exhausted. Local brain (${this.config.localFallbackModel}) taking over.`,
                    yaoState: YaoState.OldYang,
                    fallbackUsed: true,
                    fallbackReason: 'CRITICAL: Both Ollama cloud and HF rate limited â€” local fallback active',
                    timestamp: routeStartTime
                };
            } else {
                decision = {
                    model: this.config.orchestratorModel,
                    complexity: 'Orchestrator',
                    tier: 'Master',
                    reasoning: 'Strategic Brain active, coordinating specialized sub-agents',
                    yaoState: YaoState.YoungYang,
                    fallbackUsed: false,
                    timestamp: routeStartTime
                };
            }
        }

        // 3. Code & Logic Routing
        else {
            const yao = this.classifyYao(taskType || '', complexity);

            if (complexity === 'Yang') {
                const model = this.findWorkingModel(
                    this.config.deepPathModel, // Phase 78: Deep Path (Sovereignty)
                    [this.config.masterLocalModel, 'deepseek-coder:33b', 'qwen2.5-coder:32b', this.config.localFallbackModel]
                );
                decision = {
                    model,
                    complexity: 'Yang',
                    tier: 'Master',
                    reasoning: 'Deep Path (Sovereignty) activated for heavy structural manipulation or architectural intent',
                    yaoState: yao,
                    fallbackUsed: false,
                    timestamp: routeStartTime
                };
            } else if (complexity === 'YinYang') {
                const model = this.findWorkingModel(this.config.midPathModel, [this.config.codingHeavyModel, this.config.localFallbackModel]);
                decision = {
                    model,
                    complexity: 'YinYang',
                    tier: 'Executive',
                    reasoning: 'Mid Path (Execution) activated for multi-step reasoning and file modifications',
                    yaoState: yao,
                    fallbackUsed: false,
                    timestamp: routeStartTime
                };
            } else {
                const model = this.findWorkingModel(this.config.fastPathModel, ['moondream:1.8b', 'qwen2.5-coder:latest', this.config.reactiveAgentModel]);
                decision = {
                    model,
                    complexity: 'Yin',
                    tier: 'Reactive',
                    reasoning: 'Fast Path (Reflex) mapped for sub-3s latency task classification & syntax logic',
                    yaoState: yao,
                    fallbackUsed: false,
                    timestamp: routeStartTime
                };
            }
        }

        // Inject directive and timestamp into decision (if not already handled)
        decision!.directive = directive;
        decision!.timestamp = routeStartTime;

        // Push to Hexagram before returning
        this.hexagram.pushLine({
            lineIndex: 3, // Current Activity
            title: `Route: ${decision!.tier}`,
            content: `${decision!.model} (${decision!.complexity}) [${directive}]`,
            state: decision!.yaoState,
            importance: 1
        });

        // FPRAG: Record decision audit trail
        if (prompt) {
            if (decision) {
                this.trainingCollector?.recordFPRAGDecision({
                    task: prompt.substring(0, 100),
                    input: prompt,
                    route: decision as any,
                    context: {
                        localAvailability,
                        historySignal,
                        architectureAlignmentState,
                        buildPass: true,
                        userActive: true,
                        noRecentErrors: true,
                        substrateHealthy: true,
                        authorityLocal: true,
                        auditSync: true
                    },
                    hexagram: this.hexagram.getInterpretation().name,
                    directive: (decision as any).directive, // Use decision.directive
                    selectedModel: decision.model,
                    complexity: decision.complexity,
                    strategySource: 'TernaryRouter',
                    latencyMs: Date.now() - routeStartTime,
                    timestamp: Date.now(),
                    fallbackUsed: decision.fallbackUsed
                });
            }
        }

        return decision!;
    }

    public getFailoverSequence(tier: 'Master' | 'Executive' | 'Reactive', taskType: 'text' | 'image' | 'audio' | 'embedding' | 'vision' = 'text'): string[] {
        let rawSequence: string[] = [];
        switch (tier) {
            case 'Master': // Deep Path
                rawSequence = [
                    this.config.masterReasoningModel,
                    this.config.masterFallbackModel,
                    this.config.deepPathModel,
                    'openrouter:deepseek/deepseek-r1',
                    'fireworks:deepseek-r1',
                    this.config.huggingfaceFallbackModel,
                    this.config.masterLocalModel
                ];
                break;
            case 'Executive': // Mid Path
                rawSequence = [
                    this.config.executiveCoderModel,
                    this.config.codingHeavyModel,
                    this.config.midPathModel,
                    'fireworks:qwen2p5-coder-32b',
                    'openrouter:qwen/qwen-2.5-coder-32b-instruct',
                    this.config.huggingfaceFallbackModel,
                    this.config.localFallbackModel
                ];
                break;
            case 'Reactive': // Fast Path
                rawSequence = [
                    this.config.reactiveAgentModel,
                    this.config.codingFastModel,
                    this.config.fastPathModel,
                    'fireworks:fina-7b',
                    'openrouter:google/gemini-flash-1.5-8b',
                    this.config.lightAuditorModel,
                    this.config.huggingfaceFallbackModel,
                    this.config.localFallbackModel
                ];
                break;
            default:
                rawSequence = [this.config.localFallbackModel];
        }

        // Phase 9: Augment failover with Rolodex-discovered healthy models of same task type
        if (this.rolodex) {
            const rolodexModels = this.rolodex.getHealthyModelsByTaskType(taskType);
            const existingSet = new Set(rawSequence);
            
            // If the task IS NOT text, we PREPEND specialized models to avoid Master reasoning hijacking
            if (taskType !== 'text') {
                const specialized = rolodexModels.filter(rm => !existingSet.has(rm));
                rawSequence = [...specialized, ...rawSequence];
            } else {
                // For text, we append them as fallback to our high-level Config choices
                for (const rm of rolodexModels) {
                    if (!existingSet.has(rm)) {
                        rawSequence.push(rm);
                    }
                }
            }
        }

        return this.sortModelsBySovereignPriority(rawSequence);
    }

    private sortModelsBySovereignPriority(models: string[]): string[] {
        if (models.length === 0) return [];
        const unique = Array.from(new Set(models.filter(Boolean)));
        
        // The first model is considered the "preferred" target, keep it at [0] if it's healthy/available
        const preferred = unique[0];
        const rest = unique.slice(1);

        const local: string[] = [];
        const cloudflareHf: string[] = [];
        const others: string[] = [];

        for (const m of rest) {
            if (m.startsWith('huggingface:') || m.startsWith('@cf/') || m.includes('cloudflare') || m.startsWith('fireworks:') || m.startsWith('openrouter:')) {
                cloudflareHf.push(m);
            } else if (m.startsWith('gemini:') || m.includes('openai') || m.includes('anthropic') || m.includes(':cloud')) {
                others.push(m);
            } else {
                // Determine via omission: Ollama / Local Substrate
                local.push(m);
            }
        }

        // Optimal Cloud-First/Local-Fallback: 
        // 1. Preferred target
        // 2. Other Clouds / APIs
        // 3. Local Substrate
        // 4. Guaranteed universal Local Fallback
        const result = [preferred, ...others, ...cloudflareHf, ...local];
        
        // Ensure the absolute sovereign local fallback is pushed to the very end if not already
        const finalFallback = this.config.localFallbackModel;
        const fallbackFiltered = result.filter(m => m !== finalFallback);
        fallbackFiltered.push(finalFallback);

        return Array.from(new Set(fallbackFiltered));
    }

    private isCloudModel(model: string): boolean {
        return model.startsWith('huggingface:') ||
            model.startsWith('@cf/') ||
            model.includes('cloudflare') ||
            model.startsWith('fireworks:') ||
            model.startsWith('openrouter:') ||
            model.startsWith('gemini:') ||
            model.includes(':cloud');
    }

    private findWorkingModel(preferred: string, fallbacks: string[]): string {
        const sorted = this.sortModelsBySovereignPriority([preferred, ...fallbacks, this.config.localFallbackModel]);
        for (const m of sorted) {
            // Sovereign FinOps: Skip exhausted cloud providers
            if (this.quotaTracker && this.isCloudModel(m)) {
                const provider = this.detectProvider(m);
                if (provider && this.quotaTracker.isProviderExhausted(provider)) {
                    logger.debug({ model: m, provider }, 'Skipping model: provider quota exhausted');
                    continue;
                }
            }
            if (this.isModelAvailableAndHealthy(m)) {
                // Phase 2: Latency Check for Fast Path
                if (preferred === this.config.fastPathModel && this.rolodex) {
                    const modelStats = this.rolodex.getAllModels().find(rm => rm.id === m || `ollama:${rm.id}` === m);
                    if (modelStats && modelStats.avgLatencyMs > 10000) {
                        logger.debug({ model: m }, 'Skipping model for fast path: high latency');
                        continue;
                    }
                }
                return m;
            }
            // Cloud models are assumed available unless explicitly marked failing
            if (this.isCloudModel(m) && !this.isModelFailing(m)) return m;
        }
        return this.config.localFallbackModel;
    }

    private isModelAvailableAndHealthy(model: string): boolean {
        // Strict local check - must exist in Ollama output
        if (this.availableLocalModels.has(model) && !this.isModelFailing(model)) return true;
        const match = Array.from(this.availableLocalModels).find(m => m.includes(model));
        return !!match && !this.isModelFailing(match);
    }

    recordSuccess(model: string): void {
        this.modelFailures.delete(model);
        logger.debug({ model }, 'Model success recorded');
    }

    recordFailure(model: string): void {
        const current = this.modelFailures.get(model) ?? 0;
        this.modelFailures.set(model, current + 1);
        logger.warn({ model, failureCount: current + 1 }, 'Model failure recorded');
    }

    private isModelFailing(model: string): boolean {
        return (this.modelFailures.get(model) ?? 0) >= this.MAX_FAILURES;
    }

    /** Detect provider from model string for quota lookups */
    private detectProvider(model: string): QuotaProvider | null {
        if (model.startsWith('gemini:')) return 'gemini';
        if (model.startsWith('huggingface:')) return 'huggingface';
        if (model.startsWith('fireworks:')) return 'fireworks';
        if (model.startsWith('openrouter:')) return 'openrouter';
        if (model.startsWith('@cf/') || model.includes('cloudflare')) return 'cloudflare';
        return null; // local/ollama — no quota
    }

    private async syncLocalModels(): Promise<void> {
        const now = Date.now();
        if (now - this.lastSyncAt < this.SYNC_INTERVAL_MS) return;
        this.lastSyncAt = now;

        try {
            const { stdout } = await execAsync('ollama list');
            const lines = stdout.split('\n').slice(1);
            this.availableLocalModels.clear();
            for (const line of lines) {
                const modelName = line.trim().split(/\s+/)[0];
                if (modelName) this.availableLocalModels.add(modelName);
            }
        } catch {
            logger.debug('Ollama not available');
        }
    }

    public activateOllamaCooldown(): void {
        this.ollamaCooldownUntil = Date.now() + this.COOLDOWN_DURATION_MS;
    }

    public activateHfCooldown(): void {
        this.hfCooldownUntil = Date.now() + this.COOLDOWN_DURATION_MS;
    }

    public isOllamaOnCooldown(): boolean {
        return Date.now() < this.ollamaCooldownUntil;
    }

    public isHfOnCooldown(): boolean {
        return Date.now() < this.hfCooldownUntil;
    }

    public getCooldownStatus() {
        const ollamaRem = Math.max(0, this.ollamaCooldownUntil - Date.now());
        const hfRem = Math.max(0, this.hfCooldownUntil - Date.now());
        return {
            ollamaOnCooldown: ollamaRem > 0,
            ollamaRemainingMinutes: Math.ceil(ollamaRem / 60_000),
            hfOnCooldown: hfRem > 0,
            hfRemainingMinutes: Math.ceil(hfRem / 60_000)
        };
    }

    clearOllamaCooldown(): void {
        this.ollamaCooldownUntil = 0;
    }

    // === FPRAG PIPELINE METHODS (Ported from FreeModelRouter) ===

    /**
     * Derive the organism's CURRENT state from hexagram lines.
     * Dominant YaoState across all 6 lines determines the organism's posture.
     * Old states = moving/changing, Young states = stable/holding.
     */
    private deriveOrganismState(lines: ContextCard[]): YaoState {
        if (lines.length === 0) return YaoState.YoungYang;

        const counts = new Map<YaoState, number>();
        for (const line of lines) {
            const state = line.state ?? YaoState.YoungYang;
            counts.set(state, (counts.get(state) || 0) + 1);
        }

        // Find dominant state
        let dominant = YaoState.YoungYang;
        let maxCount = 0;
        for (const [state, count] of counts) {
            if (count > maxCount) {
                maxCount = count;
                dominant = state;
            }
        }
        return dominant;
    }

    /**
     * Derive the INTENT state from ternary signals.
     * Synthesizes local availability, history, and architecture alignment
     * into a single YaoState representing where the organism WANTS to go.
     */
    private deriveIntentState(
        localAvailability: YaoState,
        historySignal: YaoState,
        architectureAlignment: YaoState
    ): YaoState {
        // Score each signal: OldYang(+2), YoungYang(+1), YoungYin(0), OldYin(-1)
        const scoreMap: Record<number, number> = {
            [YaoState.OldYang]: 2,
            [YaoState.YoungYang]: 1,
            [YaoState.YoungYin]: 0,
            [YaoState.OldYin]: -1,
            // [YaoState.YangYao]: 1.5, // Duplicate with YoungYang
            // [YaoState.YinYao]: -0.5  // Duplicate with YoungYin
        };

        const signals = [localAvailability, historySignal, architectureAlignment];
        const total = signals.reduce((sum, s) => sum + (scoreMap[s] ?? 0), 0);

        if (total >= 5) return YaoState.OldYang;       // All escalating
        if (total >= 2) return YaoState.YoungYang;     // Mostly positive
        if (total >= 0) return YaoState.YoungYin;      // Mostly passive
        return YaoState.OldYin;                        // All failing
    }

    /**
     * Derive history signal from model failure tracking.
     * Many failures = retreat (OldYin), no failures = execute (YoungYang).
     */
    private deriveHistorySignal(): YaoState {
        const totalFailures = Array.from(this.modelFailures.values()).reduce((s, v) => s + v, 0);
        if (totalFailures === 0) return YaoState.YoungYang;  // Clean record
        if (totalFailures <= 2) return YaoState.YoungYin;    // Minor issues
        if (totalFailures <= 5) return YaoState.OldYang;     // Escalation needed
        return YaoState.OldYin;                               // Critical retreat
    }

    /**
     * Record a decision audit for organismal learning.
     */
    private recordDecisionAudit(audit: DecisionAuditRecord): void {
        this.decisionHistory.push(audit);
        // Keep last 100 decisions in memory
        if (this.decisionHistory.length > 100) {
            this.decisionHistory.shift();
        }
        logger.info({
            model: audit.selectedModel,
            directive: audit.directive,
            hexagram: audit.hexagram,
            latencyMs: audit.latencyMs,
            fallbackUsed: audit.fallbackUsed
        }, 'FPRAG: Decision audit recorded');

        // Pipe to TrainingCollector for D:\ persistence
        if (this.trainingCollector) {
            this.trainingCollector.recordFPRAGDecision(audit).catch(() => { /* non-blocking */ });
        }
    }

    /** Get recent decision history for learning/status reporting */
    getDecisionHistory(): ReadonlyArray<DecisionAuditRecord> {
        return this.decisionHistory;
    }
}
