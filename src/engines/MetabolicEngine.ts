import pino from 'pino';
import { ModelClient } from '../clients/ModelClient.js';
import { type Result, type EngineOutput, YaoState, ok, err, type ThinkingNexus, type ContextCard, CircuitState } from '../core/models.js';
import { extractJson } from '../utils/JsonExtractor.js';
import { CognitiveEngine } from './CognitiveEngine.js';
import { HexagramManager } from '../routing/HexagramManager.js';
import { DiscoveryEngine } from './DiscoveryEngine.js';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const logger = pino({ name: 'MetabolicEngine', base: { hostname: 'POG2' } });

/**
 * MetabolicEngine
 * 
 * Expands a single intent into a 6-line directional reflection nexus.
 * Bottlenecks expanded thoughts into consolidated strategic paths.
 */
export class MetabolicEngine {
    private readonly projectRoot: string;

    constructor(
        private readonly client: ModelClient,
        private readonly hexagram: HexagramManager,
        private readonly cognitive?: CognitiveEngine,
        private readonly search?: DiscoveryEngine
    ) {
        this.projectRoot = process.cwd();
    }

    /**
     * expand - Single thought -> 6x Directional Reflections (3x Young, 3x Old)
     * Plus Curiosity-driven reflection on Sovereign Laws.
     */
    async expand(intent: string): Promise<Result<ThinkingNexus>> {
        const sovereignContext = this.gatherSovereignContext();

        let wisdomContext = '';
        if (this.cognitive) {
            const wisdomRes = await this.cognitive.getActiveWisdom(intent);
            if (wisdomRes.ok) wisdomContext = wisdomRes.value;
        }

        // Phase 72: Search-driven Informational Recovery
        if (!wisdomContext && this.search) {
            logger.info({ intent }, 'Primary wisdom missing. Triggering Discovery Substrate recovery (Wiki)...');

            // Extract core subject noun to avoid searching Wikipedia for conversational padding
            let wikiQuery = intent;
            const queryRes = await this.client.resilientCall({
                model: this.client.config.fastPathModel,
                prompt: `Extract the single most important Wikipedia search subject/noun from this intent. Return ONLY the search term, nothing else. No conversational text.\nIntent: "${intent}"`,
                temperature: 0.1
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
        }

        logger.info({ intent }, 'Expanding intent into metabolic nexus with Sovereign Curiosity and Literary Wisdom');

        const prompt = `
EXPAND INTENT INTO METABOLIC NEXUS (6 LINES + CURIOSITY)
Intent: "${intent}"

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
Perform a "Deep Reflection" on the Sovereign Context provided. 
- Are there any potential rule violations in the planned action?
- How does this task align with the long-term "Sovereign Edition" goals?
- Flag "metabolicFriction" (0.0 to 1.0) if any deviance from SOVEREIGN_LAWS is detected.

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
            format: 'json'
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
            join(this.projectRoot, '.pog2.md'),
            join(this.projectRoot, '.manifest.md'),
            // Legacy fallbacks
            join(this.projectRoot, '.agent', 'rules', 'pog2-rules.md'),
            join(this.projectRoot, 'pog2.md'),
            join(this.projectRoot, 'manifest.md'),
            join(this.projectRoot, 'POG2_KNOWLEDGEBASE.md')
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
}
