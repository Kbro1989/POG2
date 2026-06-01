import { EventEmitter } from 'events';
import { Result, BuildStatus, HealthStatus, ResourcePressure, UserEngagement, YaoState, Lesson, ContextCard, GenerativeAesthetics, ok, EmotionalState, type CognitivePermissionMatrix, LearningMode, CognitivePolarity, InterpretationContract, ChaosPhase } from '../core/models.js';
import { EpistemicTransitionKernel } from '../engines/core/EpistemicTransitionKernel.js';
import { HEXAGRAM_REGISTRY, DEFAULT_HEXAGRAM, HexagramDefinition } from '../core/HexagramDefinitions.js';
import { ModelClient } from '../clients/ModelClient.js';
import { POG2_PEDAGOGY_MODELS, type ModelRolodexEntry } from '../core/models.js';
import type { GhostSplatField } from '../substrates/GhostSplatEngine.js';
import type { EntityGhost } from '../core/EntityGhost.js';
import type { TransitionalVector } from '../engines/core/WaitDecisionMaker.js';
import type { MovingLine } from '../core/models.js';
import { CanonicalClock } from '../utils/CanonicalClock.js';

export interface KernelDiagnostics {
    phase: ChaosPhase;
    volatilityEMA: number;
    stabilityTrendEMA: number;
    predictionAccuracyEMA: number;
    totalTransitions: number;
    ticksSinceLastChange: number;
    latencyTrend: number;
    retryRate: number;
    entropyGrowth: number;
    phaseGateMultiplier: number;
    currentYao: YaoState;
    cacheParseTime?: number;
    cacheParseTimeTrend?: number;
    necromancerLatency?: number;
    tickElapsedMs?: number;
    lastTickDuration?: number;
}

export interface TransitionalState {
  primary: string;           // binary key '111111' etc
  future: string;            // after applying moving lines
  nuclear: string;           // lines 2-3-4 + 3-4-5
  movingLines: MovingLine[];
  transitionProgress: number;
  energyFlow: 'ASCENDING' | 'DESCENDING' | 'STABLE';
  falseStability: boolean;
}

const LINE_THRESHOLDS = {
  1: { metric: 'cacheParseTime', danger: 100, recovery: 20 },        // ms
  2: { metric: 'npcConfidence', danger: 0.3, recovery: 0.8 },        // 0-1
  3: { metric: 'threatDensity', danger: 0.4, recovery: 0.1 },        // ratio
  4: { metric: 'playerProjectionDrift', danger: 3, recovery: 0 },    // tiles
  5: { metric: 'predictionTimeout', danger: 500, recovery: 100 },    // ms
  6: { metric: 'tickOverrun', danger: 100, recovery: 0 }             // ms beyond 600
};

interface HexagramRow {
    lineIndex: number;
    title: string;
    content: string;
    importance: number;
    state: number;
}

export interface SystemState {
    buildPass: BuildStatus;
    cloudHealthy: HealthStatus;
    localModels: HealthStatus;
    noRecentErrors: HealthStatus;
    userActive: UserEngagement;
    lowResourcePressure: ResourcePressure;
    adminPresent?: boolean;
    dashboardHealthy?: HealthStatus;
    somaticLair?: boolean;
}

export class HexagramManager extends EventEmitter {
    public pinSynthesis(content: string): void {
        this.pushLine({
            lineIndex: (this.lines.length % 6) + 1,
            title: 'Sovereign Synthesis',
            content,
            state: YaoState.YoungMixed,
            importance: 1
        });
    }
    private static instance: HexagramManager | undefined;
    private static mode: 'production' | 'simulation' = 'production';
    private lines: ContextCard[] = [];
    private readonly projectId: string;

    public static getInstance(): HexagramManager {
        if (!HexagramManager.instance) {
            throw new Error('HexagramManager not initialized.');
        }
        return HexagramManager.instance;
    }

    public static initializeSimulation(): void {
        HexagramManager.mode = 'simulation';
        // Create a simulation instance — real HexagramManager logic, no vectorDB substrate required
        if (!HexagramManager.instance) {
            HexagramManager.instance = new HexagramManager(null, 'simulation-substrate');
        }
    }

    public static isSimulation(): boolean {
        return HexagramManager.mode === 'simulation';
    }

    public static resetInstance(): void {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('resetInstance is forbidden in production');
        }
        HexagramManager.instance = undefined;
        HexagramManager.mode = 'production';
    }

    public updateState(sensors: any): void {
        // Integrate somatic sensory feedback into the thought processor
    }

    /**
     * setYaoState - Direct state transformation override.
     * Pulse-governed nodes use this to force the organism into specific metabolic states.
     */
    public setYaoState(state: YaoState): void {
        // In the existing architecture, the state is derived from the lines.
        // To "set" the state, we inject a high-priority "Pulse" card that dominates the derivation.
        this.pushLine({
            lineIndex: 2, // Biological Pulse / System Vitality
            title: 'Substrate Health Pulse',
            content: `Pulse-driven transformation triggered by CNS Godhead. State: ${state}`,
            state: state,
            importance: 5.0 // High weight to dominate the majority calculation
        });
    }

    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: 'I Ching Router Online' };
    }

    /**
     * getTransitionalState — Computes the full transitional topology from
     * GhostSplat field metrics and kernel diagnostics.
     */
    public getTransitionalState(
        field: GhostSplatField,
        diagnostics: KernelDiagnostics
    ): TransitionalState {
        const movingLines = this.detectMovingLines(field, diagnostics);
        const primaryHex = this.getCurrentHexagram();
        const futureHex = this.computeFutureHexagram(primaryHex, movingLines);
        const nuclearHex = this.computeNuclearHexagram(primaryHex);

        return {
            primary: primaryHex,
            future: futureHex,
            nuclear: nuclearHex,
            movingLines,
            transitionProgress: this.computeTransitionProgress(diagnostics, movingLines),
            energyFlow: this.detectEnergyFlow(field),
            falseStability: this.detectFalseStability(movingLines, diagnostics)
        };
    }

    private detectMovingLines(
        field: GhostSplatField,
        diag: KernelDiagnostics
    ): MovingLine[] {
        const lines: MovingLine[] = [];
        const now = CanonicalClock.getInstance().simulatedNow();

        // ── Line 1: Cache Substrate Health (internal) ──
        const cacheTime = diag.cacheParseTime || 0;
        const cacheTrend = diag.cacheParseTimeTrend || 0;
        if (cacheTime > LINE_THRESHOLDS[1].danger) {
            lines.push({ position: 1, fromState: 'YANG', toState: 'YIN', confidence: Math.min(1.0, cacheTime / 200), source: 'CacheForensicsLimb', timestamp: now });
        } else if (cacheTime < LINE_THRESHOLDS[1].recovery && cacheTrend < 0) {
            lines.push({ position: 1, fromState: 'YIN', toState: 'YANG', confidence: Math.min(1.0, Math.abs(cacheTrend)), source: 'CacheForensicsLimb', timestamp: now });
        }

        // ── Line 2: NPC Prediction Confidence (intuitive) ──
        const npcConf = this.computeAvgConfidence(field.projections, 'npc_');
        if (npcConf < LINE_THRESHOLDS[2].danger) {
            lines.push({ position: 2, fromState: 'YANG', toState: 'YIN', confidence: 1.0 - npcConf, source: 'GhostSplatEngine', timestamp: now });
        } else if (npcConf > LINE_THRESHOLDS[2].recovery) {
            lines.push({ position: 2, fromState: 'YIN', toState: 'YANG', confidence: npcConf, source: 'GhostSplatEngine', timestamp: now });
        }

        // ── Line 3: Combat Threat Density (conscious activity) ──
        const threatDensity = this.computeThreatDensity(field);
        if (threatDensity > LINE_THRESHOLDS[3].danger) {
            lines.push({ position: 3, fromState: 'YIN', toState: 'YANG', confidence: Math.min(1.0, threatDensity), source: 'CombatRotationEngine', timestamp: now });
        } else if (threatDensity < LINE_THRESHOLDS[3].recovery) {
            lines.push({ position: 3, fromState: 'YANG', toState: 'YIN', confidence: 1.0 - threatDensity, source: 'CombatRotationEngine', timestamp: now });
        }

        // ── Line 4: Player Projection Drift (outer engagement) ──
        const playerDrift = this.computePlayerDrift(field);
        if (playerDrift > LINE_THRESHOLDS[4].danger) {
            lines.push({ position: 4, fromState: 'YANG', toState: 'YIN', confidence: Math.min(1.0, playerDrift / 5), source: 'PlayerAgent', timestamp: now });
        }

        // ── Line 5: NecromancerBrain Prediction (mastery) ──
        const predTimeout = diag.necromancerLatency || 0;
        if (predTimeout > LINE_THRESHOLDS[5].danger) {
            lines.push({ position: 5, fromState: 'YANG', toState: 'YIN', confidence: Math.min(1.0, predTimeout / 1000), source: 'NecromancerBrain', timestamp: now });
        }

        // ── Line 6: Tick Completion (culmination) ──
        const overrun = Math.max(0, (diag.lastTickDuration || 0) - 600);
        if (overrun > LINE_THRESHOLDS[6].danger) {
            lines.push({ position: 6, fromState: 'YANG', toState: 'YIN', confidence: Math.min(1.0, overrun / 200), source: 'TemporalHeartbeatLimb', timestamp: now });
        }

        return lines;
    }

    private computeAvgConfidence(projections: Map<string, EntityGhost>, prefix: string): number {
        let total = 0, count = 0;
        projections.forEach((ghost, id) => {
            if (id.startsWith(prefix)) {
                total += ghost.confidence;
                count++;
            }
        });
        return count > 0 ? total / count : 1.0;
    }

    private computeThreatDensity(field: GhostSplatField): number {
        let hotTiles = 0;
        for (let i = 0; i < field.heatmap.length; i++) {
            if (field.heatmap[i] > 0) hotTiles++;
        }
        return hotTiles / (66 * 66);
    }

    private computePlayerDrift(field: GhostSplatField): number {
        const playerGhost = Array.from(field.projections.values()).find(g => g.entityId.startsWith('player_'));
        if (!playerGhost) return 0;
        return playerGhost.confidence < 0.5 ? 5 : 0;
    }

    private computeTransitionProgress(diag: KernelDiagnostics, movingLines: MovingLine[]): number {
        const tickElapsed = diag.tickElapsedMs || 0;
        const volatility = diag.volatilityEMA || 0;
        const timeProgress = Math.min(1.0, tickElapsed / 300); // 300ms POG2 cycle
        const volatilityBoost = volatility * 0.3;
        const lineBoost = (movingLines.length / 6) * 0.2;
        return Math.min(1.0, timeProgress + volatilityBoost + lineBoost);
    }

    private detectEnergyFlow(field: GhostSplatField): 'ASCENDING' | 'DESCENDING' | 'STABLE' {
        const centerHeat = this.sampleRegion(field.heatmap, 28, 28, 38, 38);
        const peripheryHeat = this.sampleRegion(field.heatmap, 0, 0, 66, 66) - centerHeat;
        const centerAvg = centerHeat / 100;
        const peripheryAvg = peripheryHeat / (66 * 66 - 100);
        if (peripheryAvg > centerAvg * 1.3) return 'ASCENDING';
        if (centerAvg > peripheryAvg * 1.3) return 'DESCENDING';
        return 'STABLE';
    }

    private sampleRegion(heatmap: Uint8Array, x1: number, y1: number, x2: number, y2: number): number {
        let sum = 0;
        for (let y = y1; y < y2; y++) {
            for (let x = x1; x < x2; x++) {
                sum += heatmap[y * 66 + x];
            }
        }
        return sum;
    }

    private detectFalseStability(movingLines: MovingLine[], diag: KernelDiagnostics): boolean {
        if (movingLines.length > 0) return false;
        return [diag.latencyTrend, diag.retryRate, diag.entropyGrowth].some(m => (m || 0) > 0.6);
    }

    private computeFutureHexagram(primary: string, movingLines: MovingLine[]): string {
        const future = primary.split('');
        for (const line of movingLines) {
            const idx = 6 - line.position;
            future[idx] = line.toState === 'YANG' ? '1' : '0';
        }
        return future.join('');
    }

    private computeNuclearHexagram(primary: string): string {
        const p = primary.split('');
        if (p.length < 6) return '111111';
        return p[4] + p[3] + p[2] + p[3] + p[2] + p[1];
    }

    private getCurrentHexagram(): string {
        // Find corresponding hexagram for current YaoState
        const yao = this.getYaoState();
        return yao === YaoState.OldYin ? '000000' : '111111'; // Simplified, use binary string
    }

    private readonly FACET_MAP: Record<number, string> = {
        1: 'Foundation / Structural Roots',
        2: 'Biological Pulse / System Vitality',
        3: 'Transition / Current Activity',
        4: 'External Environment / Dependencies',
        5: 'Authority / Core Business Logic',
        6: 'Culmination / UI & User Perception'
    };

    private readonly DECISION_MATRIX: Record<number, Record<number, string>> = {
        [YaoState.OldYang]: {
            [YaoState.YoungYang]: 'EXPAND_SECURE: Aggressive growth on stable ground.',
            [YaoState.YoungYin]: 'TRANSFORM_WATCH: Radical change followed by deep observation.',
            [YaoState.YoungMixed]: 'Sovereign Pivot: High-tier architectural synthesis.',
            [YaoState.OldYang]: 'BURST_METABOLISM: Extreme iterative expansion.',
            [YaoState.OldYin]: 'CYCLIC_REBIRTH: Wholesale replacement of legacy structures.',
            [YaoState.OldMixed]: 'CHAOTIC_FLUX: Unstable rapid transformation.'
        },
        [YaoState.OldYin]: {
            [YaoState.YoungYang]: 'CONTRACT_BUILD: Pruning legacy to build new momentum.',
            [YaoState.YoungYin]: 'DEEP_DORMANCY: Structural withdrawal into silent observer mode.',
            [YaoState.YoungMixed]: 'ZEN_PRUNING: Minimalist optimization for unity.',
            [YaoState.OldYang]: 'REACTIVE_EXPLOSION: Sudden expansion from a compressed state.',
            [YaoState.OldYin]: 'ENTROPIC_COLLAPSE: Defensive archiving of failing systems.',
            [YaoState.OldMixed]: 'LEAKY_SUBSTRATE: Chaotic degradation/melancholy.'
        },
        [YaoState.OldMixed]: {
            [YaoState.YoungYang]: 'PIVOT_ACTION: Emerging from chaos into steady execution.',
            [YaoState.YoungYin]: 'PIVOT_SILENCE: Emerging from chaos into quiet research.',
            [YaoState.YoungMixed]: 'PIVOT_UNITY: Harmonizing chaotic signals into Zen code.',
            [YaoState.OldYang]: 'CHAOS_EXPANSION: Unpredictable growth patterns.',
            [YaoState.OldYin]: 'CHAOS_CONTRACTION: Unpredictable withdrawal.',
            [YaoState.OldMixed]: 'VORTEX: High-entropy re-indexing of all substrate data.'
        },
        [YaoState.YoungYang]: {
            [YaoState.YoungYang]: 'STEADY_FLOW: Maintaining productive momentum.',
            [YaoState.YoungYin]: 'EXECUTION_AUDIT: Pausing work for biological verification.',
            [YaoState.YoungMixed]: 'INTEGRATED_EXECUTION: Building with 100% architectural alignment.',
            [YaoState.OldYang]: 'STABLE_UPGRADE: Moving from steady work to radical expansion.',
            [YaoState.OldYin]: 'CONTROLLED_RETREAT: Abandoning unsuccessful paths logic.',
            [YaoState.OldMixed]: 'JITTER: Steady work interrupted by system noise.'
        },
        [YaoState.YoungYin]: {
            [YaoState.YoungYang]: 'AWAKENING: Moving from observation to active execution.',
            [YaoState.YoungYin]: 'MEDITATION: Pure research and learning mode.',
            [YaoState.YoungMixed]: 'SENSORY_SYNTHESIS: Combining all observations into a single intent.',
            [YaoState.OldYang]: 'RADICAL_AWAKENING: Instant pivot from silence to explosion.',
            [YaoState.OldYin]: 'SHADOW_WORK: Deep-diving into "unsafe" or complex failure files.',
            [YaoState.OldMixed]: 'SENSORY_OVERLOAD: Chaos emerging from deep observation.'
        },
        [YaoState.YoungMixed]: {
            [YaoState.YoungYang]: 'UNIFIED_ACTION: Holistic execution from a balanced center.',
            [YaoState.YoungYin]: 'UNIFIED_OBSERVATION: Balanced research across all domains.',
            [YaoState.YoungMixed]: 'ZEN_STATE: Optimal sovereign operation.',
            [YaoState.OldYang]: 'UNIFIED_TRANSFORM: Holistic radical change.',
            [YaoState.OldYin]: 'UNIFIED_WITHDRAWAL: Graceful shutdown/archival.',
            [YaoState.OldMixed]: 'ZEN_PIVOT: Precise re-alignment of chaotic systems.'
        }
    };

    public decide(current: YaoState, intent: YaoState): string {
        const c = current > 5 ? (current % 2 === 0 ? YaoState.YoungYang : YaoState.YoungYin) : current;
        const i = intent > 5 ? (intent % 2 === 0 ? YaoState.YoungYang : YaoState.YoungYin) : intent;
        const row = this.DECISION_MATRIX[c] || this.DECISION_MATRIX[YaoState.YoungYang];
        return row[i] || 'UNDEFINED_METABOLISM';
    }

    constructor(private readonly vectorDB: any, projectId: string) {
        super();
        this.projectId = projectId;
        HexagramManager.instance = this;

        // Action Pipeline Feedback Listener (Phase 11)
        try {
            const kernel = EpistemicTransitionKernel.getInstance();
            kernel.on('actionCommitted', (data: { actionType: string, confidence: number }) => {
                this.handleActionFeedback(data);
            });
        } catch (e) {
            // Kernel might not be initialized in all test contexts
        }
    }

    private handleActionFeedback(data: { actionType: string, confidence: number }): void {
        // Promote Line 3 (Action)
        // Line 3: "Sovereign intent resolved into physical pulse"
        this.pushLine({
            lineIndex: 3,
            title: 'Action Pipeline Commitment',
            content: `Kernel resolved intent: ${data.actionType} with confidence ${data.confidence.toFixed(2)}`,
            state: YaoState.OldYang, // Active movement/commitment
            importance: data.confidence * 2.0
        });
    }

    async initialize(): Promise<void> {
        if (this.vectorDB && typeof this.vectorDB.getHexagramContext === 'function') {
            const result = await this.vectorDB.getHexagramContext(this.projectId);
            if (result.ok) {
                const rows = (result.value as unknown as HexagramRow[]) || [];
                this.lines = rows
                    .filter(row => !!row)
                    .map((row) => ({
                        lineIndex: row.lineIndex || 0,
                        title: row.title || 'Untitled',
                        content: row.content || '',
                        importance: row.importance || 1,
                        state: (row.state as YaoState) || YaoState.YoungYang
                    }))
                    .filter(l => l.lineIndex >= 1 && l.lineIndex <= 6);
            }
        }

        while (this.lines.length < 6) {
            this.lines.push({
                lineIndex: this.lines.length + 1,
                title: 'Empty Slot',
                content: 'No context recorded for this pillar.',
                importance: 0,
                state: YaoState.YoungYang
            });
        }
    }

    async setLine(index: number, card: ContextCard): Promise<Result<void>> {
        if (index < 1 || index > 6) {
            return { ok: false, error: new Error('Invalid line index (1-6)') };
        }
        this.lines[index - 1] = card;
        if (this.vectorDB && typeof this.vectorDB.updateHexagramLine === 'function') {
            return this.vectorDB.updateHexagramLine(index, this.projectId, card.title, card.content, card.state);
        }
        return { ok: true, value: undefined };
    }

    public unpinCard(line: number): void {
        const card = this.lines.find(l => l.lineIndex === line);
        if (card) {
            card.isPinned = false;
            this.emit('change', this.lines);
        }
    }

    public async analyzeStrategicState(params: { intent: string, axes: any[] }, client: ModelClient): Promise<Result<any>> {
        const hex = this.getInterpretation();
        const prompt = `
ANALYZE STRATEGIC STATE
Intent: "${params.intent}"
Current Hexagram: ${hex.symbol} ${hex.name}
Strategy: ${hex.strategy}

AXES OF ANALYSIS:
${params.axes.map(a => `- ${a.axis}: ${a.positive} vs ${a.negative}`).join('\n')}

Respond in JSON ONLY:
{
    "manifestation": "...",
    "advice": "...",
    "analysis": "...",
    "scores": { "X": 0.5, "Y": 0.8, "Z": 0.2 }
}
`;
        const res = await client.call({
            model: client.config.midPathModel,
            prompt,
            temperature: 0.3,
            format: 'json'
        });

        if (!res.ok) return res as any;

        try {
            const data = JSON.parse(res.value.response);
            return ok(data);
        } catch (e) {
            return { ok: false, error: new Error('Failed to parse strategic analysis response.') };
        }
    }

    public pinPulse(state: YaoState, content: string): void {
        const card: ContextCard = {
            lineIndex: (this.lines.length % 6) + 1,
            title: 'Cognitive Pulse',
            content,
            state,
            importance: 1
        };
        this.pushLine(card);
    }

    /**
     * Broadcasts a high-frequency GhostSplat spatial telemetry pulse.
     * Integrates with the NXT padded-grid engine for real-time visualization.
     */
    public broadcastGhostSplat(splatId: string, intensity: number, sourceLabel: string, metadata?: any): void {
        const energyState = intensity > 0.8 ? YaoState.OldYang : (intensity < 0.3 ? YaoState.OldYin : YaoState.YoungYang);
        
        const card: ContextCard = {
            lineIndex: (this.lines.length % 6) + 1,
            title: `GhostSplat: ${sourceLabel}`,
            content: `[NXT Telemetry] Target: ${splatId} | Intensity: ${intensity.toFixed(2)} | Overdrive State: ${energyState === YaoState.OldYang ? 'BURST' : 'STABILE'}`,
            state: energyState,
            importance: intensity * 2.0 // High impact on metabolism based on physical/spatial intensity
        };
        
        this.pushLine(card);
        this.emit('ghost_splat', { splatId, intensity, sourceLabel, metadata, timestamp: CanonicalClock.getInstance().simulatedNow() });
    }

    public pinCognitiveCard(card: ContextCard): void {
        this.pushLine(card);
    }

    public formatForPrompt(): string {
        const hex = this.getInterpretation();
        return `Hexagram: ${hex.symbol} ${hex.name}\nInterpretation: ${hex.strategy}\nLines:\n${this.lines.map(l => `- Line ${l.lineIndex} [${l.state}]: ${l.title}: ${l.content}`).join('\n')}`;
    }

    public compareThoughts(a: ContextCard, b: ContextCard): number {
        return Math.abs(a.importance - b.importance);
    }

    public async consultOracle(params: { intent: string, axes: any[] }, client: ModelClient): Promise<Result<any>> {
        return this.analyzeStrategicState(params, client);
    }

    async pinCard(index: number, title: string, content: string, state: YaoState = YaoState.YoungYang): Promise<Result<void>> {
        if (index < 1 || index > 6) return { ok: false, error: new Error('Invalid index') };
        const card: ContextCard = { lineIndex: index, title, content, state, importance: 1 };
        return this.setLine(index, card);
    }

    getInterpretation(): HexagramDefinition {
        const binaryId = this.calculateHexagramId(this.lines, false);
        const def = HEXAGRAM_REGISTRY[binaryId];
        if (!def) {
            return {
                ...DEFAULT_HEXAGRAM,
                binary: binaryId,
                name: `Unmapped Substrate (${binaryId})`,
                strategy: `GENERIC_STABILIZATION: No specific archetype for ${binaryId}. Operating on baseline safety protocols.`,
                emotion: EmotionalState.Zen
            };
        }
        return def;
    }

    public getEmotionalState(): EmotionalState {
        const interpretation = this.getInterpretation();
        return interpretation.emotion || EmotionalState.Zen;
    }

    public getGenerativeAesthetics(): GenerativeAesthetics {
        const interpretation = this.getInterpretation();
        const yao = this.getYaoState();
        const aesthetics = { ...interpretation.aesthetics };

        if (yao === YaoState.OldYang || yao === YaoState.OldYin || yao === YaoState.OldMixed) {
            (aesthetics as any).thermalVariance = Math.min(1.0, aesthetics.thermalVariance + 0.2);
            (aesthetics as any).prosody = {
                ...aesthetics.prosody,
                chaos: Math.min(1.0, aesthetics.prosody.chaos + 0.3)
            };
        }
        return aesthetics;
    }

    public pushLine(line: ContextCard): void {
        this.lines.push(line);
        if (this.lines.length > 6) {
            this.lines.shift();
        }
        this.emit('cognitive_pulse', line);
    }

    public getLines(): ContextCard[] {
        return [...this.lines];
    }

    public getYaoState(): YaoState {
        if (this.lines.length === 0) return YaoState.YoungYang;

        // Track all 6 states independently â€” Old states must not collapse into Young.
        // This preserves chaotic/changing signals from accumulated context,
        // enabling Phase 27 generative bias to trigger organically.
        const counts: Record<number, number> = {
            [YaoState.YoungYang]: 0,
            [YaoState.YoungYin]: 0,
            [YaoState.YoungMixed]: 0,
            [YaoState.OldYang]: 0,
            [YaoState.OldYin]: 0,
            [YaoState.OldMixed]: 0
        };

        this.lines.forEach(l => {
            const state = l.state ?? YaoState.YoungYang;
            if (counts[state] !== undefined) {
                counts[state]++;
            } else {
                counts[YaoState.YoungYang]++;
            }
        });

        const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
        return parseInt(sorted[0][0], 10) as YaoState;
    }

    private getPermissions(): CognitivePermissionMatrix {
        const state = this.getYaoState();
        
        // Phase 230: The Shadow Learning Paradigm
        // We no longer strictly disable learning. We shift its MODE.
        const matrix: CognitivePermissionMatrix = {
            mode: LearningMode.SHADOW, // Default to Shadow (Anomalies only)
            allowPedagogy: false,
            allowPatternExtraction: false,
            allowInvariantCompilation: false,
            allowMemoryConsolidation: false,
            allowForensics: false,
            allowClinicalAudit: false,
            allowSubstrateIngestion: false
        };

        // 1. Determine Global Learning Mode
        if (state === YaoState.YoungYang || state === YaoState.YoungMixed) {
            matrix.mode = LearningMode.SAFE;
        } else if (state === YaoState.OldYang || state === YaoState.OldYin || state === YaoState.YoungYin) {
            matrix.mode = LearningMode.HYBRID;
        } else {
            matrix.mode = LearningMode.SHADOW;
        }

        // 2. Individual Authority Mapping
        // Receptive state (YoungYin / OldYin): Allows observation and crystallization
        if (state === YaoState.YoungYin || state === YaoState.OldYin) {
            matrix.allowForensics = true;
            matrix.allowSubstrateIngestion = true;
            if (state === YaoState.OldYin) {
                matrix.allowMemoryConsolidation = true;
                matrix.allowInvariantCompilation = true;
            }
        }

        // Creative/Stable Momentum (YoungYang / OldYang): Allows active learning and pedagogy
        if (state === YaoState.YoungYang || state === YaoState.OldYang) {
            matrix.allowPatternExtraction = true;
            if (state === YaoState.OldYang) {
                matrix.allowPedagogy = true;
                matrix.allowClinicalAudit = true;
            }
        }
        
        // Mixed states: Transitional/Integrated learning
        if (state === YaoState.YoungMixed) {
            matrix.allowPatternExtraction = true;
            matrix.allowPedagogy = true;
        }

        // Chaos (OldMixed): SHADOW MODE ONLY.
        // All flags remain false, but matrix.mode is SHADOW, 
        // which tells downstream engines to record but not update.
        if (state === YaoState.OldMixed) {
             // Observation remains open even in chaos for anomaly capture
             matrix.allowForensics = true;
        }

        // Sovereign states: High-level authority
        if (state === YaoState.SovereignAvatar || state === YaoState.SovereignEngine) {
            matrix.allowForensics = true;
            matrix.allowClinicalAudit = true;
        }

        return matrix;
    }

    public isYin(): boolean {
        const interpretation = this.getInterpretation();
        const yinCount = (interpretation.binary.match(/0/g) || []).length;
        return yinCount >= 3;
    }

    public isYang(): boolean {
        const interpretation = this.getInterpretation();
        const yangCount = (interpretation.binary.match(/1/g) || []).length;
        return yangCount >= 3;
    }

    public getTernaryState(): 'Yin' | 'Yang' | 'YinYang' {
        const yin = this.isYin();
        const yang = this.isYang();
        if (yin && yang) return 'YinYang';
        if (yin) return 'Yin';
        return 'Yang';
    }

    /**
     * selectPedagogyModel — Tiered model selection for pedagogy tasks.
     * Routing: Local Merged (Warm) -> Cloud LoRA (Limb Specific) -> Gemini Premium (Complex) -> GhostLimb (Base)
     */
    public selectPedagogyModel(
        hexagram: any, // Replace with HexagramState if available
        requireVerified: boolean,
        limbDomain: string,
        modelClient: ModelClient
    ): ModelRolodexEntry {
        // Tier 1: Check if local merged model is warm (Ollama loaded)
        const local = POG2_PEDAGOGY_MODELS.find(m => m.tier === "local");
        if (local && modelClient.getRolodex()?.isModelHealthy(local.id)) {
            // Verify if hexagram fits (simplified: always fits for local)
            return local;
        }

        // Tier 2: Fireworks LoRA for limb-specific routing
        const cloud = POG2_PEDAGOGY_MODELS.find(m =>
            m.tier === "cloud-standard" &&
            m.loraId?.includes(limbDomain)
        );
        if (cloud && modelClient.getRolodex()?.isModelHealthy(cloud.id)) {
            return cloud;
        }

        // Tier 3: Gemini via Cloudflare Gateway for deep reasoning
        const premium = POG2_PEDAGOGY_MODELS.find(m => m.tier === "cloud-premium");
        if (premium && modelClient.getRolodex()?.isModelHealthy(premium.id)) {
            // Use premium if high complexity ( la 5 threshold)
            if (hexagram.complexity > 0.8) {
                return premium;
            }
        }

        // Tier 5: GhostLimb — return a generic high-capability base model if all else fails
        return POG2_PEDAGOGY_MODELS[0];
    }

    public getContract(): InterpretationContract {
        const state = this.getYaoState();
        const ternary = this.getTernaryState();
        const permissions = this.getPermissions();
        const aesthetics = this.getGenerativeAesthetics();
        
        // Phase-aware gating: Replace hard booleans with kernel multiplier.
        // The kernel's getPhaseGateMultiplier() returns 0.0-1.0 based on
        // ChaosPhase (STABLE=1.0, RECOVERING=0.7, EXPLORING=0.4, DEGRADING=0.1).
        // Gates now degrade gracefully instead of slamming shut.
        let phaseMultiplier = 1.0;
        let currentPhase = ChaosPhase.STABLE;
        try {
            const kernel = EpistemicTransitionKernel.getInstance();
            phaseMultiplier = kernel.getPhaseGateMultiplier();
            currentPhase = kernel.getCurrentPhase();
        } catch {
            // Kernel not yet initialized — fall back to legacy boolean logic
        }

        // Phase-aware gates: use multiplier threshold instead of enum equality
        const gates = {
            allowStructuralRepair: phaseMultiplier > 0.3, // Blocked only in DEGRADING
            allowActiveRecovery: phaseMultiplier > 0.05,  // Always allowed (survival instinct)
            allowForeignDirectives: phaseMultiplier > 0.5 || ternary === 'YinYang',
            allowDestructiveCommands: phaseMultiplier > 0.6 && state !== YaoState.OldYin && state !== YaoState.YoungYin
        };

        return {
            polarity: ternary === 'YinYang' ? CognitivePolarity.YINYANG : (ternary === 'Yin' ? CognitivePolarity.YIN : CognitivePolarity.YANG),
            mode: permissions.mode,
            permissions,
            aesthetics,
            behavioralBias: this.getBehavioralBias(state, ternary),
            gates,
            phase: currentPhase,
            phaseGateMultiplier: phaseMultiplier
        };
    }

    private getBehavioralBias(state: YaoState, ternary: 'Yin' | 'Yang' | 'YinYang'): { riskTolerance: number, creativeTemperature: number, metabolicCeiling: number } {
        let riskTolerance = 0.5;
        let creativeTemperature = 1.0;
        let metabolicCeiling = 80;

        // State-driven overrides
        if (state === YaoState.OldMixed) {
            riskTolerance = 0.1; // Minimal risk during chaos
            creativeTemperature = 1.5; // High chaos/creative flux
            metabolicCeiling = 50; // Throttle to prevent crash
        } else if (state === YaoState.OldYang) {
            riskTolerance = 0.9;
            creativeTemperature = 1.2;
            metabolicCeiling = 100;
        } else if (state === YaoState.YoungYin) {
            riskTolerance = 0.3;
            creativeTemperature = 0.7;
            metabolicCeiling = 70;
        }

        // Ternary-driven refinement
        if (ternary === 'YinYang') {
            riskTolerance = 0.5;
            creativeTemperature = 1.0;
            metabolicCeiling = 90; // High ceiling for balanced integration
        }

        return { riskTolerance, creativeTemperature, metabolicCeiling };
    }

    public getEmotionalPool(): Record<string, number> {
        const primary = this.getInterpretation();
        const futureBinary = this.calculateHexagramId(this.lines, true);
        const future = HEXAGRAM_REGISTRY[futureBinary] || { ...DEFAULT_HEXAGRAM, binary: futureBinary };
        
        const pool: Record<string, number> = {
            [primary.emotion]: 1.0,
            [EmotionalState.Zen]: 0.5
        };

        // Add future (changing) emotion if different, with lower weight
        if (future.emotion !== primary.emotion) {
            pool[future.emotion] = (pool[future.emotion] || 0) + 0.6;
        }

        // Somatic Metabolic Influence — real YaoState-driven simulation of emotional arousal from changing lines
        // If many lines are "Old" (Changing), increase Agitation or Excitement
        const changingLines = this.lines.filter(l => l.state === YaoState.OldYang || l.state === YaoState.OldYin || l.state === YaoState.OldMixed).length;
        if (changingLines >= 3) {
            pool[EmotionalState.Agitated] = (pool[EmotionalState.Agitated] || 0) + 0.4;
        } else if (changingLines >= 1) {
            pool[EmotionalState.Curious] = (pool[EmotionalState.Curious] || 0) + 0.3;
        }

        return pool;
    }

    private calculateHexagramId(cards: ContextCard[], future: boolean): string {
        let binary = '';
        for (let i = 1; i <= 6; i++) {
            const card = (cards || []).find(c => c && c.lineIndex === i);
            const state = card ? (card.state ?? YaoState.YoungYang) : YaoState.YoungYang;
            let isYang: boolean;

            if (future) {
                if (state === YaoState.OldYang) isYang = false;
                else if (state === YaoState.OldYin) isYang = true;
                else isYang = (state === YaoState.YoungYang || state === YaoState.YoungMixed);
            } else {
                isYang = (state === YaoState.YoungYang || state === YaoState.OldYang || state === YaoState.YoungMixed || state === YaoState.OldMixed);
            }
            binary = (isYang ? '1' : '0') + binary;
        }
        return binary;
    }

    private getYaoSymbol(state: YaoState): string {
        if (state === YaoState.OldYang || state === YaoState.YoungYang) return 'âšŠ';
        if (state === YaoState.OldYin || state === YaoState.YoungYin) return 'âš‹';
        return 'Balanced';
    }
}

