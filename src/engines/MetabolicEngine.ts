import { ModelClient } from '../clients/ModelClient.js';
import { 
    type Result, 
    type EngineOutput, 
    YaoState, 
    ok, 
    err, 
    type ThinkingNexus, 
    type ContextCard, 
    CircuitState, 
    EmotionalState,
    type SessionLog,
    type MetabolicAudit,
    type SovereignViolation
} from '../core/models.js';
import { extractJson } from '../utils/JsonExtractor.js';
import { CognitiveEngine } from './CognitiveEngine.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { DiscoveryEngine } from './DiscoveryEngine.js';
import { MemoryConsolidationEngine } from './MemoryConsolidationEngine.js';
import { readFileSync, existsSync } from 'fs';
import { promises as fs } from 'fs';
import { join } from 'path';
import { getSovereignRoot } from '../utils/SovereignPathResolver.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('MetabolicEngine');

/**
 * MetabolicEngine
 * 
 * Expands a single intent into a 6-line directional reflection nexus.
 * Enforces Sovereign Law through clinical audits and placeholder detection.
 */
export class MetabolicEngine {
    private readonly projectRoot: string;
    private readonly PLACEHOLDER_PATTERNS = [
        /TODO|FIXME|XXX|HACK|placeholder|temp|temporary/gi,
        /console\.log\(.*\)/g, // Debug artifacts in production
        /any\s*=\s*any/g, // TypeScript abdication
        /\/\/.*/g // Comments that explain bad code instead of fixing it
    ];

    constructor(
        private readonly client: ModelClient,
        private readonly hexagram: HexagramManager,
        private readonly cognitive?: CognitiveEngine,
        private readonly search?: DiscoveryEngine,
        private readonly consolidation?: MemoryConsolidationEngine
    ) {
        this.projectRoot = getSovereignRoot();
    }

    /**
     * reflect - Sovereign Law Enforcement.
     * Scans session exhaust for clinical violations and pedagogical gaps.
     */
    async reflect(sessionLog: SessionLog): Promise<MetabolicAudit> {
        logger.info({ modifiedCount: sessionLog.modifiedFiles.length }, 'Commencing clinical metabolic audit...');
        const violations: SovereignViolation[] = [];
        
        // 1. Clinical Audit: Scan all touched files for placeholders/mocks
        for (const file of sessionLog.modifiedFiles) {
            try {
                if (!existsSync(file)) continue;
                const content = await fs.readFile(file, 'utf8');
                const lines = content.split('\n');
                
                lines.forEach((line, idx) => {
                    if (this.PLACEHOLDER_PATTERNS.some(p => p.test(line))) {
                        violations.push({
                            type: 'PLACEHOLDER_DETECTED',
                            file,
                            line: idx + 1,
                            severity: 'CRITICAL',
                            context: line.trim()
                        });
                    }
                });
            } catch (err) {
                logger.warn({ file, err }, 'Failed to audit file for Sovereign Law');
            }
        }

        // 2. Pedagogical Audit: Verify tasks referenced VectorDB principles
        for (const task of sessionLog.completedTasks) {
            if (!task.referencesPedagogyId) {
                violations.push({
                    type: 'MISSING_PEDAGOGY_REFERENCE',
                    file: 'N/A', // Task-level violation
                    line: 0,
                    severity: 'WARNING',
                    context: `Task ID: ${task.id}`
                });
            }
        }

        const metabolicScore = Math.max(0, 1 - (violations.filter(v => v.severity === 'CRITICAL').length * 0.2));

        // 3. Auto-trigger consolidation if significant violations found
        if (violations.length > 0 && this.consolidation) {
            logger.warn({ violationCount: violations.length }, 'Sovereign Law violations detected. Triggering Repair Consolidation.');
            await this.consolidation.consolidate(sessionLog, { 
                focus: 'SOVEREIGN_LAW_REPAIR',
                violations 
            } as any);
        }

        return {
            timestamp: Date.now(),
            violations,
            metabolicScore,
            consolidationRecommendations: this.generateRemediations(violations)
        };
    }

    private generateRemediations(violations: SovereignViolation[]): string[] {
        return violations.map(v => {
            if (v.type === 'PLACEHOLDER_DETECTED') {
                return `SOVEREIGN LAW VIOLATION: ${v.file}:${v.line} contains ephemeral code. Implement or excise.`;
            }
            return `Review ${v.context} for pedagogical grounding.`;
        });
    }

    /**
     * expand - Single thought -> 6x Directional Reflections (3x Young, 3x Old)
     * Plus Curiosity-driven reflection on Sovereign Laws.
     */
    async expand(intent: string): Promise<Result<ThinkingNexus>> {
        // --- PHASE 14 SHORT-CIRCUIT: Internal Substrate Commands ---
        const lowerIntent = intent.toLowerCase().trim();
        const isInternalCommand = lowerIntent.startsWith('pog2 ') || 
                                  lowerIntent.startsWith('/') || 
                                  ['pipeline', 'health', 'status', 'ping', 'memory'].some(cmd => lowerIntent.includes(cmd));
        
        if (isInternalCommand) {
            logger.debug({ intent }, 'Stage 0 internal command detected: bypassing semantic expansion & Wiki fallback.');
            return ok({
                yao: YaoState.YoungYang,
                emotionalValence: 0.5,
                metabolicPressure: 0.1,
                substrateHealth: CircuitState.Stable,
                originalIntent: intent,
                thoughts: [{
                    lineIndex: 0,
                    title: 'System Diagnostic',
                    content: 'Executing Stage 0 bypass.',
                    state: YaoState.YoungYang,
                    reflection: 'Immediate resolution path chosen.',
                    importance: 1.0,
                    weight: 1.0
                }],
                emotionalPool: { focused: 1.0 } as any,
                curiosity: 0, // 0 = No curiosity metric for internal operations
                metabolicFriction: 0.0,
                bottleneckPaths: [intent]
            });
        }
        // -----------------------------------------------------------

        const sovereignContext = this.gatherSovereignContext();

        let wisdomContext = '';
        if (this.cognitive) {
            const wisdomRes = await this.cognitive.getActiveWisdom(intent);
            if (wisdomRes.ok) wisdomContext = wisdomRes.value;
        }

        // Phase 72/114: Search-driven Informational Recovery
        // Only trigger Wiki search if the intent lacks wisdom AND appears to be a knowledge query
        const isKnowledgeQuery = !isInternalCommand && 
                                 (lowerIntent.includes('what') || 
                                  lowerIntent.includes('who') || 
                                  lowerIntent.includes('explain') || 
                                  lowerIntent.includes('research') ||
                                  lowerIntent.split(' ').length > 4); // Complex sentences might need context

        if (!wisdomContext && this.search && isKnowledgeQuery) {
            logger.info({ intent }, 'Primary wisdom missing for knowledge query. Triggering Discovery Substrate recovery (Wiki)...');

            // Extract core subject noun to avoid searching Wikipedia for conversational padding
            let wikiQuery = intent;
            const queryRes = await this.client.resilientCall({
                model: this.client.config.fastPathModel,
                prompt: `Extract the single most important Wikipedia search subject/noun from this intent. Return ONLY the search term, nothing else. No conversational text.\nIntent: "${intent}"`,
                temperature: 0.1,
                yaoState: YaoState.YoungYang
            });

            if (queryRes.ok) {
                // Clean up any quotes or markdown the model might leak
                wikiQuery = queryRes.value.response.trim().replace(/^['"]|['"]$/g, '');
            }

            logger.info({ intent, wikiQuery }, 'Extracted Wiki topic from intent');

            const searchRes = await this.search.searchWiki(wikiQuery);
            if (searchRes.ok) {
                wisdomContext = `[RECOVERED VIA SEARCH SUBSTRATE]:\n${searchRes.value}`;
            } else {
                logger.warn({ wikiQuery, error: searchRes.error?.message }, 'Wiki recovery failed, proceeding without literal wisdom');
            }
        } else if (!wisdomContext) {
            logger.debug({ intent }, 'Primary wisdom missing, but intent does not warrant Wiki recovery. Proceeding with raw intent.');
        }

        logger.info({ intent }, 'Expanding intent into metabolic nexus with Sovereign Curiosity and Literary Wisdom');

        const prompt = `
EXPAND INTENT INTO METABOLIC NEXUS (6 LINES + CURIOSITY)
Intent: "${intent}"

[CURRENT STRUCTURAL EMOTION]: ${this.hexagram.getEmotionalState() || 'Unknown'} (The emotion radiating from the POG2 Hexagram)

SOVEREIGN CONTEXT (Laws & Manifest):
${sovereignContext}

[ACTIVATED LITERARY WISDOM]:
${wisdomContext || 'No primary literary wisdom available for this substrate query.'}

Generate 6 "Thought Cards" following this mandatory I Ching Metabolic structure:
Lines 1-3: "New" (Change/Future) YaoStates - Growth, innovation, upcoming execution.
Lines 4-6: "Old" (Present/Past) YaoStates - Legacy context, established state, recent history.

States to use (must use at least once): 
- YoungYang, YoungYin, YangYao (New/Neutral)
- OldYang, OldYin, YinYao (Stable/Moving)

Each card must include:
- lineIndex (1-6)
- state: enum value
- reflection: Directed thought
- emotion: pool weight
- direction: forward | backward | lateral
- weight: 0.0 to 1.0

ADDITIONAL MANDATORY FIELD: "curiosity"
Perform a "Deep Reflection" on the Sovereign Context and literal wisdom provided. 
- Are there any potential rule violations in the planned action?
- MANDATORY: Search for any clinical violations (Mocks, Placeholders, Weak Typing, Stubbed APIs).
- How does this task align with the long-term "AI Hive Mind" hierarchy?
- Flag "metabolicFriction" (0.0 to 1.0). Friction is HIGH if the [CURRENT STRUCTURAL EMOTION] severely conflicts with the semantic tone of the prompt (e.g., Structural is 'Zen' but the Intent is highly Aggressive). Also flag friction if ANY deviance from SOVEREIGN_LAWS is detected.
- If a task involves "Yang" complexity but lacks an adversarial audit turn, flag it here.

Respond in JSON ONLY with structure:
{
    "thoughts": ThoughtCard[],
    "emotionalPool": Record<EmotionalState, number>,
    "curiosity": string,
    "metabolicFriction": number
}
`;

        const res = await this.client.resilientCall({
            model: this.client.config.midPathModel, // Phase 78: Mid Path (Execution / Validation)
            prompt,
            temperature: 0.7,
            format: 'json',
            yaoState: YaoState.YoungYang
        });

        if (!res.ok) {
            this.hexagram.pushLine({
                lineIndex: 0,
                importance: 0.5,
                title: 'Metabolic Friction',
                content: `Expansion call failed: ${res.error?.message || 'Unknown substrate error'}`,
                state: YaoState.OldYin
            });
            return res as any;
        }

        try {
            const cleanJson = extractJson(res.value.response);
            const data = JSON.parse(cleanJson);

            const nexus: ThinkingNexus = {
                yao: YaoState.YoungYin, // Starting state for the expansion
                emotionalValence: data.emotionalValence ?? 0,
                metabolicPressure: data.metabolicPressure ?? 0,
                substrateHealth: CircuitState.Stable,
                originalIntent: intent,
                thoughts: data.thoughts,
                emotionalPool: data.emotionalPool,
                curiosity: data.curiosity,
                metabolicFriction: data.metabolicFriction,
                bottleneckPaths: []
            };

            // Phase 1.5: Emotional Yao Casting (Bottom-Up Resonance)
            // Identify dominant semantic emotion and cast it to the global structure
            if (data.emotionalPool) {
                let dominantEmotion = EmotionalState.Zen;
                let maxWeight = -1;
                for (const [emo, weight] of Object.entries(data.emotionalPool)) {
                    if (typeof weight === 'number' && weight > maxWeight) {
                        maxWeight = weight;
                        // Coerce string key to Enum if possible
                        const match = Object.values(EmotionalState).find(v => v.toString().toLowerCase() === emo.toLowerCase());
                        if (match) dominantEmotion = match as EmotionalState;
                    }
                }

                if (maxWeight > 0.3) {
                    const mappedYao = this.mapEmotionToYao(dominantEmotion);
                    
                    logger.info({ dominantEmotion, mappedYao, friction: data.metabolicFriction }, 'Casting Semantic Emotional Yao line');
                    
                    await this.hexagram.pushLine({
                        lineIndex: 0,
                        importance: maxWeight,
                        title: 'Semantic Emotion Binding',
                        content: `Metabolic Engine parsed dominant semantic emotion [${dominantEmotion}]. Friction with global state: ${data.metabolicFriction}`,
                        state: mappedYao
                    });
                }
            }

            // Phase 2: Bottlenecking
            const bottleneckRes = await this.bottleneck(nexus);
            if (!bottleneckRes.ok) return bottleneckRes as any;

            nexus.bottleneckPaths = bottleneckRes.value;
            return ok(nexus);
        } catch (e) {
            const errMsg = (e as Error).message;
            logger.error({
                error: errMsg,
                rawResponse: res.value.response.substring(0, 500) + '...'
            }, 'Metabolic expansion JSON parse failure');

            this.hexagram.pushLine({
                lineIndex: 0,
                importance: 0.5,
                title: 'Metabolic Friction',
                content: `JSON Parse Failure: ${errMsg.substring(0, 50)}...`,
                state: YaoState.OldYin
            });

            return err(new Error(`Metabolic expansion malformed: ${errMsg}`));
        }
    }

    /**
     * bottleneck - Synthesizes 6 thoughts into a consolidated list of paths.
     */
    async bottleneck(nexus: ThinkingNexus): Promise<Result<string[]>> {
        const prompt = `
BOTTLENECK METABOLIC THOUGHTS
Intent: "${nexus.originalIntent}"

EXPANDED THOUGHTS:
${(nexus.thoughts || []).map(t => `- Line ${t.lineIndex} [${YaoState[t.state]}]: ${t.reflection} (Weight: ${t.weight})`).join('\n')}

EMOTIONAL WEIGHING:
${JSON.stringify(nexus.emotionalPool || {})}

CONSOLIDATE these reflections into exactly 3-5 distinct "Strategic Paths".
Each path should be a clear, actionable directive for the Sovereign Substrate.

Respond in JSON: { "paths": string[] }
`;

        const res = await this.client.resilientCall({
            model: this.client.config.fastPathModel, // Phase 78: Fast Path (Trivial Consolidation)
            prompt,
            temperature: 0.1,
            format: 'json'
        });

        if (!res.ok) return res as any;

        try {
            const data = JSON.parse(extractJson(res.value.response));
            return ok(data.paths);
        } catch (e) {
            return err(new Error('Bottleneck synthesis failed.'));
        }
    }

    /**
     * gatherSovereignContext - Reads local rule and manifest files to inform thinking.
     */
    private gatherSovereignContext(): string {
        const paths = [
            join(this.projectRoot, '.rules.md'),
            join(this.projectRoot, 'pog2.md'),
            join(this.projectRoot, 'manifest.md'),
            join(this.projectRoot, 'POG2_KNOWLEDGEBASE.md'),
            // Local fallback
            join(process.cwd(), '.rules.md'),
            join(process.cwd(), 'pog2.md')
        ];

        let context = '';
        const seen = new Set<string>();
        for (const p of paths) {
            if (existsSync(p)) {
                try {
                    const content = readFileSync(p, 'utf8');
                    // Simple hash or name check to avoid redundant context if files were just moved
                    const name = p.split(/[\\/]/).pop();
                    if (name && seen.has(name)) continue;
                    if (name) seen.add(name);

                    context += `\nFILE: ${p}\n---\n${content}\n---\n`;
                } catch (e) {
                    logger.warn({ path: p }, 'Failed to read context file');
                }
            }
        }
        return context || 'No Sovereign Context found.';
    }

    public healthCheck(): { online: boolean; details: string } {
        const rulesExists = existsSync(join(this.projectRoot, '.rules.md')) || existsSync(join(process.cwd(), '.rules.md'));
        const manifestExists = existsSync(join(this.projectRoot, '.manifest.md')) || existsSync(join(process.cwd(), '.manifest.md'));

        return {
            online: rulesExists && manifestExists,
            details: `Sovereign Context: Rules(${rulesExists}), Manifest(${manifestExists})`
        };
    }

    /**
     * Maps a semantic emotion to a structural YaoState line.
     */
    private mapEmotionToYao(emotion: EmotionalState): YaoState {
        switch (emotion) {
            // OldYang (Volatile / Aggressive)
            case EmotionalState.Agitated:
            case EmotionalState.Frustrated:
            case EmotionalState.Excited:
                return YaoState.OldYang;
            
            // YoungYang (Stable Active)
            case EmotionalState.Decisive:
            case EmotionalState.Inspired:
            case EmotionalState.Steady:
                return YaoState.YoungYang;

            // OldYin (Reactive / Chaotic)
            case EmotionalState.Surprised:
            case EmotionalState.Curious:
                return YaoState.OldYin;

            // YoungYin (Receptive / Calm)
            case EmotionalState.Zen:
            case EmotionalState.Quiet:
            case EmotionalState.Pensive:
            case EmotionalState.Melancholy:
            default:
                return YaoState.YoungYin;
        }
    }
}
