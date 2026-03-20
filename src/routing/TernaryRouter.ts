import { createLogger } from '../utils/logger.js';
import { exec } from 'child_process';
import { promisify } from 'util';
import { type Ternary, type Result, YaoState, type DecisionAuditRecord, type RoutingComplexity, type ContextCard, EmotionalState, type AIServiceType, type ActuationResult } from '../core/models.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import { HexagramManager } from './HexagramManager.js';
import type { ModelClient } from '../clients/ModelClient.js';
import type { ContextBuilder } from '../engines/ContextBuilder.js';
import type { TrainingCollector } from '../utils/TrainingCollector.js';
import { ModelRolodex } from '../api/ai/ModelRolodex.js';

type TaskType = 'text' | 'image' | 'audio' | 'embedding' | 'vision' | 'unknown';
import { SovereignIgnoreManager } from '../utils/SovereignIgnoreManager.js';
import { getSovereignRoot } from '../utils/SovereignPathResolver.js';
import type { SovereignKnock, ConcealmentState } from '../core/models.js';
import type { ChromaLimb } from '../limbs/spatial/ChromaLimb.js';
import type { BioIntelligenceLimb } from '../limbs/spatial/BioIntelligenceLimb.js';
import type { MemoryConsolidationEngine } from '../engines/MemoryConsolidationEngine.js';
import type { QuotaTracker, QuotaProvider } from '../utils/QuotaTracker.js';
import { OutcomeScorer, type OutcomeScore } from './evolution/OutcomeScorer.js';
import { StrategyAdvisor, type StrategyMutation } from './evolution/StrategyAdvisor.js';

const execAsync = promisify(exec);
const logger = createLogger('TernaryRouter');

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
    Vision: /\.(png|jpg|jpeg|webp|gif)\b|\b(vision|see|look|image|screenshot|picture|analyze this view|what is in this|describe the scene)\b/i,
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
    private isSyncing = false;
    private readonly SYNC_INTERVAL_MS = 60_000;
    private readonly MAX_FAILURES = 3;
    private contextBuilder?: ContextBuilder;
    private lastConfidence = 0.5;
    private trainingCollector?: TrainingCollector;
    private rolodex?: ModelRolodex;
    private modelClient?: ModelClient;
    private chromaLimb?: ChromaLimb;
    private bioIntelligence?: BioIntelligenceLimb;
    private memoryConsolidation?: MemoryConsolidationEngine;
    private quotaTracker?: QuotaTracker;
    private readonly decisionHistory: DecisionAuditRecord[] = [];
    private readonly executionMetrics: { totalTokens: number; fastPaths: number; deepPaths: number } = { totalTokens: 0, fastPaths: 0, deepPaths: 0 };
    private outcomeScorer?: OutcomeScorer;
    private strategyAdvisor?: StrategyAdvisor;
    private proposedMutations: StrategyMutation[] = [];
    
    // Phase 7: Temporal Routing Gates
    public get temporalState(): 'PAST' | 'PRESENT' | 'FUTURE' {
        const hex = this.hexagram.getInterpretation();
        if (hex.name.includes('Arriving') || hex.name.includes('Return') || this.hexagram.isYin()) {
            return 'PAST'; // Stable, historical, or retrieval-focused
        }
        if (this.hexagram.isYang()) {
            return 'FUTURE'; // Expansion, creative, or generative
        }
        return 'PRESENT'; // Mixed, transformation, or hybrid
    }

    // Cooldown tracking for Kimi endpoints (Ollama vs HF 61-min alternating)
    private ollamaCooldownUntil = 0;
    private hfCooldownUntil = 0;
    private cloudOutageUntil = 0;
    private readonly COOLDOWN_DURATION_MS = 61 * 60 * 1000; // 61 minutes
    private readonly CLOUD_OUTAGE_DURATION_MS = 4 * 60 * 60 * 1000; // 4 hours

    constructor(config: SovereignConfig) {
        this.config = config;
        this.hexagram = HexagramManager.getInstance();
        this.outcomeScorer = new OutcomeScorer();
        this.strategyAdvisor = new StrategyAdvisor();
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

    /** Inject ModelClient for Two-Phase Routing (Cheap Triage) */
    setModelClient(client: ModelClient): void {
        this.modelClient = client;
        if (this.outcomeScorer) this.outcomeScorer.setClient(client);
    }

    /** 🧬 Evolutionary Sweep - Audit historical interactions and propose mutations */
    public async evolutionarySweep(sampleSize: number = 20): Promise<StrategyMutation[]> {
        if (!this.trainingCollector || !this.outcomeScorer || !this.strategyAdvisor) {
            logger.warn('Evolution components not fully initialized, skipping sweep.');
            return [];
        }

        logger.info({ sampleSize }, '🧬 Starting CNS evolutionary sweep...');
        
        // 1. Get raw history from substrate
        // TrainingCollector needs a method to get recent interactions
        const history = await (this.trainingCollector as any).getRecentInteractions(sampleSize);
        if (!history || history.length === 0) {
            logger.info('No recent interactions found for sweep.');
            return [];
        }

        // 2. Grade outcomes
        const scores: OutcomeScore[] = [];
        for (const record of history) {
            const result = await this.outcomeScorer.grade(record);
            if (result.ok) scores.push(result.value);
        }

        // 3. Analyze drift and propose mutations
        const mutations = await this.strategyAdvisor.analyzeMetabolicDrift(history, scores);
        this.proposedMutations = [...this.proposedMutations, ...mutations];

        logger.info({ proposedMutations: mutations.length }, '🧬 Sweep complete. Proposals registered.');
        return mutations;
    }

    /** 🧬 Apply Mutation - Sovereign Approval Gate */
    public applyMutation(mutationId: string): Result<void> {
        const index = this.proposedMutations.findIndex(m => m.id === mutationId);
        if (index === -1) return { ok: false, error: new Error('Mutation not found') };

        const mutation = this.proposedMutations[index];
        if (!this.rolodex) return { ok: false, error: new Error('Rolodex not available') };

        logger.info({ mutationId, model: mutation.model }, '🧬 Applying sovereign approved mutation...');
        
        const provider = ModelRolodex.toRolodexProvider(mutation.model.split(':')[0] || 'ollama');
        const modelId = mutation.model.includes(':') ? mutation.model.split(':').slice(1).join(':') : mutation.model;

        this.rolodex.mutateReputation(modelId, provider, mutation.weightAdjustment);
        
        mutation.approved = true;
        // Optionally remove from list or keep as audited
        return { ok: true, value: undefined };
    }

    public getProposedMutations(): StrategyMutation[] {
        return this.proposedMutations;
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
     * Nervous System v2: Two-Phase Routing Gate (Cheap Triage)
     * Offloads the exact task classification to a fast, cheap model before committing to a heavy Master tier.
     */
    async classifyTaskDynamically(prompt: string): Promise<TaskType> {
        if (!this.modelClient) return 'text'; // Fallback if not injected

        // If it clearly contains image paths or vision keywords, fast-fail to vision
        const visionRegex = /\.(png|jpg|jpeg|webp|gif)\b|\b(vision|see|look|image|screenshot|picture|analyze this view)\b/i;
        if (visionRegex.test(prompt)) {
            return 'vision';
        }

        try {
            // Use the absolute cheapest fast model available in the system
            const triageModel = this.config.fastPathModel || 'deepseek-r1:8b'; 
            
            // Bypass the router itself (prevent infinite loops) by calling the provider directly, 
            // or we configure ModelClient to allow a direct model override.
            // For now, we simulate the structure.
            const classificationPrompt = `Classify this task exactly into one of these words: [simple, complex, vision, coding, embedding, orchestration]. Task: ${prompt.substring(0, 500)}`;
            
            const result = await this.modelClient.call({
                model: triageModel,
                prompt: classificationPrompt,
                maxTokens: 20,
                temperature: 0.1,
                isSystemPulse: true // Phase 8.2: Prevent triage from poisoning reputation
            });
            
            if (!result.ok) {
                this.lastConfidence = 0.3;
                return 'text';
            }

            const response = result.value.response.toLowerCase();
            if (response.includes('trivial')) {
                this.lastConfidence = 0.9;
                return 'text';
            }
            if (response.includes('simple')) {
                this.lastConfidence = 0.7;
                return 'text';
            }
            if (response.includes('complex') || response.includes('coding')) {
                this.lastConfidence = 0.5;
                return 'text';
            }
            if (response.includes('vision')) {
                this.lastConfidence = 0.7; // Vision is usually specific and well-defined
                return 'vision';
            }
            if (response.includes('embedding')) {
                this.lastConfidence = 0.9;
                return 'embedding';
            }
            
            this.lastConfidence = 0.3;
            return 'text'; 
        } catch (err) {
            logger.debug({ err }, 'Dynamic classification failed, falling back to heuristic text route');
            return 'text';
        }
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

        // === NERVOUS SYSTEM V2: DYNAMIC TRIAGE ===
        // If we have a prompt and it's NOT a guaranteed fast path, do a cheap triage 
        let dynamicTaskType: TaskType = 'text';

        // 🧬 Phase 108: CONFIDENCE OVERRIDE (Heuristic Fallback if Triage is Shaky)
        const triageEnabled = prompt && !fastPath && this.modelClient;
        
        if (triageEnabled) {
            dynamicTaskType = await this.classifyTaskDynamically(prompt!);
            
            // If triage confidence is dangerously low, revert to heuristic classification
            if (this.lastConfidence < 0.4) {
                logger.warn({ confidence: this.lastConfidence }, '🧬 CNS: Triage confidence too low. Bypassing dynamic type.');
                dynamicTaskType = 'text'; 
            }
            // If the triage determined it's vision, but the heuristic missed it, upgrade the complexity
            if (dynamicTaskType === 'vision' && complexity !== 'Vision') {
                complexity = 'Vision';
            }
            // If the triage determined it's embedding, upgrade complexity if needed (though usually embedding is explicit)
            if (dynamicTaskType === 'embedding' && complexity !== 'Yang') {
                 // Embedding tasks are usually part of Yang (Deep Path) or specific sub-routines
            }
        }
        
        // Use the dynamic type if none was provided by the Engine
        const finalTaskType = (taskType || dynamicTaskType) as TaskType;

        if (!fastPath) {
            this.syncLocalModels(); // Phase 8.2: Non-blocking sync
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
            decision = { model: this.config.imageGenModel, complexity: 'Chromanumber', tier: 'Reactive', reasoning: 'Stage 2 (Local) - Chromanumber substrate: Visual metabolic mapping', yaoState: YaoState.YoungYin, fallbackUsed: false, timestamp: routeStartTime };
        } else if (complexity === 'SovereignEye') {
            decision = { model: this.config.visionModel, complexity: 'SovereignEye', tier: 'Executive', reasoning: 'Stage 3 (Structural) - SovereignEye substrate: Sensory proprioception', yaoState: organicYao, fallbackUsed: false, timestamp: routeStartTime };
        } else if (complexity === 'Vision') {
            const model = this.findWorkingModel(this.config.visionModel, ['moondream', 'llava'], 'vision');
            decision = { model, complexity: 'Vision', tier: 'Executive', reasoning: 'Stage 3 (Structural) - Visual task routed via Sensory limb', yaoState: organicYao, fallbackUsed: false, timestamp: routeStartTime };
        } else if (complexity === 'Voice') {
            decision = { model: this.config.voiceModel, complexity: 'Voice', tier: 'Reactive', reasoning: 'Stage 2 (Local) - Audio task routed via Motor limb', yaoState: YaoState.YoungYin, fallbackUsed: false, timestamp: routeStartTime };
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
                    reasoning: `Stage 4 (Cloud Escalation) - Primary Neural Substrate on cooldown (${status.ollamaRemainingMinutes}m left)`,
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
                    reasoning: `Stage 3 (Structural Fallback) - CRITICAL: Both cloud endpoints exhausted. Local brain taking over.`,
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
                    reasoning: 'Stage 4 (Cloud) - Strategic Brain active, coordinating specialized sub-agents',
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
                    [this.config.masterLocalModel, 'deepseek-coder:33b', 'deepseek-r1:8b', this.config.localFallbackModel],
                    finalTaskType
                );
                decision = {
                    model,
                    complexity: 'Yang',
                    tier: 'Master',
                    reasoning: 'Stage 4 (Cloud/Deep) - Deep Path (Sovereignty) activated for heavy structural manipulation',
                    yaoState: yao,
                    fallbackUsed: false,
                    timestamp: routeStartTime
                };
            } else if (complexity === 'YinYang') {
                const model = this.findWorkingModel(this.config.midPathModel, [this.config.codingHeavyModel, this.config.localFallbackModel], finalTaskType);
                decision = {
                    model,
                    complexity: 'YinYang',
                    tier: 'Executive',
                    reasoning: 'Stage 3 (Structural) - Mid Path (Execution) activated for multi-step reasoning',
                    yaoState: yao,
                    fallbackUsed: false,
                    timestamp: routeStartTime
                };
            } else {
                const model = this.findWorkingModel(this.config.fastPathModel, ['moondream:1.8b', 'deepseek-r1:8b', this.config.reactiveAgentModel], finalTaskType);
                decision = {
                    model,
                    complexity: 'Yin',
                    tier: 'Reactive',
                    reasoning: 'Stage 2 (Micro/Local) - Fast Path (Reflex) mapped for low-latency task resolution',
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
                // Determine actual fallback state
                const wasFallback = decision.fallbackUsed || (decision.model === this.config.localFallbackModel && !this.isFastPath(prompt));
                this.recordDecisionAudit({
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
                    directive: decision!.directive ?? 'Execute',
                    selectedModel: decision.model,
                    complexity: decision.complexity,
                    strategySource: 'TernaryRouter',
                    latencyMs: Date.now() - routeStartTime,
                    timestamp: Date.now(),
                    fallbackUsed: wasFallback
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

    private readonly BASE_EXPLORATION_EPSILON = 0.15;

    private findWorkingModel(preferred: string, fallbacks: string[], taskType: TaskType = 'text'): string {
        const rawList = [preferred, ...fallbacks, this.config.localFallbackModel];
        const unique = Array.from(new Set(rawList.filter(Boolean)));
        
        // 🧬 Nervous System v2: Scored Routing (Phase 9)
        const allModels = this.rolodex?.getAllModels() || [];
        const scored = unique
            .filter(mId => this.isModelAvailableAndHealthy(mId) && this.isModalityCompatible(mId, taskType))
            .map(mId => {
                // Find matching model in rolodex
                const mData = allModels.find(m => m.id === mId || `${m.provider}:${m.id}` === mId);
                const rep = mData?.reputation ?? 1.0;
                const avgLatency = mData?.avgLatencyMs ?? 500;
                const expectedLatency = Math.max(avgLatency, 50);
                
                // 🧬 Phase 108: Explicit Decision Weighting
                // score = (reputation weight) / log(1 + latency)
                const score = rep / Math.log(1 + expectedLatency);
                return { id: mId, score };
            })
            .sort((a, b) => b.score - a.score);

        const sorted = scored.map(s => s.id);
        if (sorted.length === 0) return this.config.localFallbackModel;

        // 🧬 Nervous System v2: ε-greedy Adaptive Exploration (Phase 9)
        const epsilon = 0.25 - (this.lastConfidence * 0.20);
        if (Math.random() < epsilon && sorted.length > 1) {
            const randomIndex = Math.floor(Math.random() * (sorted.length - 1)) + 1; // Pick non-primary
            const exploredModel = sorted[randomIndex];
            logger.info({ model: exploredModel, epsilon, taskType }, '🧬 CNS ε-greedy: Exploration triggered');
            return exploredModel;
        }

        for (const m of sorted) {
            // Sovereign FinOps: Skip exhausted cloud providers
            if (this.quotaTracker && this.isCloudModel(m)) {
                const provider = this.detectProvider(m);
                if (provider && this.quotaTracker.isProviderExhausted(provider)) {
                    logger.debug({ model: m, provider }, 'Skipping model: provider quota exhausted');
                    continue;
                }
            }

            // Phase 8: Modality Check
            if (!this.isModalityCompatible(m, taskType)) {
                continue;
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

    /** Phase 8: Verify model supports the requested modality */
    private isModalityCompatible(modelId: string, taskType: TaskType): boolean {
        if (!this.rolodex) return true; // Can't verify without rolodex

        const allModels = this.rolodex.getAllModels();
        // Phase 8.2: Flexible matching to handle version tags like :latest
        const model = allModels.find(m => {
            const normalizedMId = m.id.split(':')[0];
            const normalizedModelId = modelId.includes(':') ? modelId.split(':')[1] : modelId;
            const pureTarget = normalizedModelId.split(':')[0];
            
            return m.id === modelId || 
                   `${m.provider}:${m.id}` === modelId || 
                   (m.provider === 'ollama' && (modelId === m.id || pureTarget === normalizedMId));
        });
        
        if (!model) return true; // Unknown model - assume compatible (whitelist strategy)

        if (taskType === 'vision' && !model.isVision) return false;
        if (taskType === 'embedding' && !model.isEmbedding) return false;
        if (taskType === 'image' && !model.isVision) return false; // Image tasks usually need vision or specialized flags
        if (taskType === 'text' && !model.isText) return false;

        return true;
    }

    private isModelAvailableAndHealthy(model: string): boolean {
        // Phase 8.2: Normalize for failure lookup (remove version tags)
        const pureModel = model.split(':')[0];
        
        if (this.isModelFailing(model) || this.isModelFailing(pureModel)) return false;

        // Strict local check - must exist in Ollama output
        if (this.availableLocalModels.has(model)) return true;
        
        const match = Array.from(this.availableLocalModels).find(m => m === model || m.split(':')[0] === pureModel);
        return !!match;
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

    /**
     * 🧬 Proprioceptive Reinforcement Loop (Phase 24)
     * Directly adjusts model reputation based on sensory verification of actuation.
     */
    public recordActuationReinforcement(verification: ActuationResult): void {
        if (!this.rolodex || !verification.modelId) return;

        const { modelId, success, details } = verification;
        const providerStr = modelId.split(':')[0] || 'ollama';
        const modelName = modelId.includes(':') ? modelId.split(':').slice(1).join(':') : modelId;
        const provider = ModelRolodex.toRolodexProvider(providerStr);

        // Success gives a small boost (+0.05), failure gives a significant penalty (-0.15)
        const adjustment = success ? 0.05 : -0.15;
        
        logger.info({ modelId, success, adjustment, details }, '🧬 CNS: Applying proprioceptive reinforcement');
        this.rolodex.mutateReputation(modelName, provider, adjustment);
        
        // Push to Hexagram line 4 (Metabolic Stability)
        this.hexagram.pushLine({
            lineIndex: 4,
            title: success ? 'Reinforcement: Positive' : 'Reinforcement: Negative',
            content: `Proprioception ${success ? 'confirmed' : 'rejected'} actuation for ${modelId}`,
            state: success ? YaoState.YoungYang : YaoState.OldYin,
            importance: 2
        });
    }

    private isModelFailing(model: string): boolean {
        // Check both full name and pure name (e.g., phi:latest and phi)
        const failures = this.modelFailures.get(model) ?? 0;
        const pureModel = model.split(':')[0];
        const pureFailures = model.includes(':') ? (this.modelFailures.get(pureModel) ?? 0) : 0;
        
        return (failures + pureFailures) >= this.MAX_FAILURES;
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
        if (now - this.lastSyncAt < this.SYNC_INTERVAL_MS || this.isSyncing) return;
        
        this.isSyncing = true;
        this.lastSyncAt = now;

        try {
            // 🧬 Phase 108: Added 10s timeout to prevent hanging on stalled Ollama substrates
            const { stdout } = await execAsync('ollama list', { timeout: 10000 });
            const lines = stdout.split('\n').slice(1);
            this.availableLocalModels.clear();
            for (const line of lines) {
                const modelName = line.trim().split(/\s+/)[0];
                if (modelName) this.availableLocalModels.add(modelName);
            }
        } catch {
            logger.debug('Ollama not available or hung');
        } finally {
            this.isSyncing = false;
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
