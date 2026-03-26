import { EventEmitter } from 'events';
import { Result, BuildStatus, HealthStatus, ResourcePressure, UserEngagement, YaoState, Lesson, ContextCard, GenerativeAesthetics, ok, EmotionalState } from '../core/models.js';
import { HEXAGRAM_REGISTRY, DEFAULT_HEXAGRAM, HexagramDefinition } from '../core/HexagramDefinitions.js';
import { ModelClient } from '../clients/ModelClient.js';

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
    pinSynthesis(arg0: string) {
        throw new Error('Method not implemented.');
    }
    private static instance: HexagramManager | undefined;
    private lines: ContextCard[] = [];
    private readonly projectId: string;

    public static getInstance(): HexagramManager {
        if (!HexagramManager.instance) {
            throw new Error('HexagramManager not initialized.');
        }
        return HexagramManager.instance;
    }

    public updateState(sensors: any): void {
        // Integrate somatic sensory feedback into the thought processor
    }

    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: 'I Ching Router Online' };
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
        return HEXAGRAM_REGISTRY[binaryId] || { ...DEFAULT_HEXAGRAM, binary: binaryId };
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

        // Track all 6 states independently — Old states must not collapse into Young.
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

    public getEmotionalPool(): Record<string, number> {
        const interpretation = this.getInterpretation();
        return {
            [interpretation.emotion]: 1.0,
            [EmotionalState.Zen]: 0.5
        };
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
        if (state === YaoState.OldYang || state === YaoState.YoungYang) return '⚊';
        if (state === YaoState.OldYin || state === YaoState.YoungYin) return '⚋';
        return 'Balanced';
    }
}
