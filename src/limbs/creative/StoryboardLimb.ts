import { type Result, type ProsodyVector, ok } from '../../core/models.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { GutenbergLimb } from './GutenbergLimb.js';
import { NarrativeSegment } from '../../utils/NarrativeExtractor.js';

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import pino from 'pino';

import { HexagramManager } from '../../routing/HexagramManager.js';

const logger = pino({ name: 'StoryboardLimb', base: { hostname: 'POG2' } });

export interface StoryboardScene {
    index: number;
    description: string;
    visualPrompts: string[];
    styleInfluence: string;
    prosody?: ProsodyVector;
    speaker?: string; // Autonomous character identification
}

export class StoryboardLimb {
    constructor(
        private readonly client: ModelClient,
        private readonly gutenberg: GutenbergLimb,
        private readonly hexagram: HexagramManager,
        private readonly modelName: string = 'qwen2.5-coder:14b-instruct-q5_K_M'
    ) { }

    /**
     * analyzeGlobalContext - "Reads the story before making scenes".
     * Extracts a narrative blueprint to guide the entire storyboard.
     */
    public async analyzeGlobalContext(bookId: number): Promise<Result<{ blueprint: string; characterMap: Record<string, string> }>> {
        const styleRes = await this.gutenberg.analyzeStyle(bookId);
        if (!styleRes.ok) return styleRes as any;

        const { book, profile } = styleRes.value;

        // Get a broader sample of the book for context (e.g., first 20,000 chars)
        const segmentsRes = await this.gutenberg.getSequencedSegments(bookId, 1);
        const leadText = segmentsRes.ok ? segmentsRes.value[0]?.text.substring(0, 20000) : "Title and style only.";

        const prompt = `
ANALYZE NARRATIVE BLUEPRINT: "${book.title}"
Style: ${JSON.stringify(profile)}

LEAD NARRATIVE EXCERPT:
${leadText}

TASK:
1. Understand the "Soul" and "Directions" of this story (Arc, Pacing, Themes).
2. Identify the MAIN CHARACTERS and assign them distinct VOCAL TRAITS for a TTS engine.
   - Traits should include pitch (high/low), speed (fast/slow), and energy (jittery/booming/whispery).

Respond strictly in this JSON format:
{
  "blueprint": "Summary of arc, pacing, and themes...",
  "characterMap": {
    "Character Name": "vocal traits description",
    "Narrator": "The default storytelling voice"
  }
}
`;

        const res = await this.client.resilientCall({
            model: this.client.config.vocalAnalysisModel,
            prompt,
            temperature: 0.3,
            format: "json",
            tier: 'Reactive'
        });

        if (!res.ok) {
            logger.warn({ bookId, error: res.error }, 'Global context analysis failed. Using default placeholders.');
            return ok({
                blueprint: "Default narrative flow based on style profile.",
                characterMap: { "Narrator": "Balanced, professional storytelling voice." }
            });
        }

        try {
            const data = JSON.parse(res.value.response);
            return ok({
                blueprint: data.blueprint || res.value.response,
                characterMap: data.characterMap || { "Narrator": "Standard storytelling voice." }
            });
        } catch {
            return ok({
                blueprint: res.value.response,
                characterMap: { "Narrator": "Standard storytelling voice." }
            });
        }
    }

    public async generateScenes(bookId: number, sceneCount = 5, blueprint?: string, personality?: string, outputPath?: string): Promise<Result<StoryboardScene[]>> {
        const actingBlueprint = blueprint || (await this.analyzeGlobalContext(bookId)).ok ? (await this.analyzeGlobalContext(bookId) as any).value.blueprint : "Standard narrative flow.";

        const styleRes = await this.gutenberg.analyzeStyle(bookId);
        if (!styleRes.ok) return styleRes as any;
        const { profile, book } = styleRes.value;

        const segmentsRes = await this.gutenberg.getSequencedSegments(bookId, sceneCount);
        if (!segmentsRes.ok) {
            logger.warn({ bookId, error: segmentsRes.error }, 'Failed to fetch sequential segments. Falling back to style-only generation.');
        }
        const segments = segmentsRes.ok ? segmentsRes.value : [];

        return this.generateFromSegments(book, profile, segments, sceneCount, actingBlueprint, outputPath, personality);
    }

    /**
     * generateFromSegments - Internal generator that takes raw segments and profile.
     * Integrates Dual Ternary Brain logic (YaoState, Yin/Yang, Hexagrams).
     */
    public async generateFromSegments(
        book: any,
        profile: any,
        segments: NarrativeSegment[],
        sceneCount: number,
        blueprint?: string,
        outputPath?: string,
        personality?: string
    ): Promise<Result<StoryboardScene[]>> {
        // Retrieve current YaoState/Hexagram context
        const yaostate = this.hexagram.getYaoState();
        const interpretation = this.hexagram.getInterpretation();
        const emotionalPool = this.hexagram.getEmotionalPool();
        const yinYang = this.hexagram.isYin() ? 'Yin (Static/Receptive)' : 'Yang (Active/Projective)';
        const aesthetics = this.hexagram.getGenerativeAesthetics();

        const prompt = `
GENERATE SEQUENTIAL STORYBOARD SCENES (DUAL TERNARY BRAIN MODE)
Source Material: "${book.title}" by ${book.author}.
Style Profile: ${JSON.stringify(profile)}

--- [INSTRUCTION_LAYER / COGNITIVE OVERLAY] ---
NEUROLOGICAL CONTEXT (Sets Tone and Direction):
- Hexagram: ${interpretation.id}. ${interpretation.name} (${interpretation.judgment})
- YaoState: ${yaostate}
- Polarity: ${yinYang}
- Emotional Pool: ${JSON.stringify(emotionalPool)}
- Active Personality: ${personality || 'Sovereign Narrator'}
- Metabolic Aesthetics:
    * Visual Filter: ${aesthetics.visualFilter}
    * Thermal Variance: ${aesthetics.thermalVariance}
    * Scale: ${aesthetics.scale}
    * Palette: ${aesthetics.palette?.join(', ')}

--- [CONTENT_LAYER / SOURCE SUBSTRATE] ---
NARRATIVE SEGMENTS (Provides Spoken/Literal Content):
${segments.map(s => `[Scene ${s.index} - Location: ${s.location}]:
${s.text.substring(0, 1500)} // (Truncated for context balancing)
`).join('\n---\n')}

TASK:
Create ${sceneCount} dramatic narrative beats that follow the progression of the segments above. 
Adapt each beat specifically to the corresponding segment's JSON schema requirements.

For each beat, provide the metadata mapping:
1. "index": The strict integer index matching the [Scene X] anchor provided above.
2. "speaker": The name of the character currently speaking or taking central action. Use "Narrator" if it's general exposition.
3. "visualPrompts": Exactly THREE (3) distinct, high-fidelity visual prompts representing a sequential cinematic progression (Scene Start, Mid-Action Shift, Scene Resolution).
4. "styleInfluence": A short sentence on how the book's specific style (tone: ${profile.tone}) and the current YaoState (${yaostate}) influences the scene's emotional weight.
5. "prosody": Emotional ratings (0.0 to 1.0) for the mood. **CRITICAL: Demand high variance. Do NOT default to 0.5. If the scene is intense, use 0.9+. If calm, use 0.1. We need extreme emotional contrast for the TTS engine.**

DO NOT repeat the narrative text. We only need the structural mapping and visual synthesis.

Respond strictly in this JSON format:
{ 
  "scenes": [ 
    { 
      "index": number, 
      "speaker": string,
      "visualPrompts": ["prompt 1", "prompt 2", "prompt 3"], 
      "styleInfluence": string,
      "prosody": { 
        "chaos": float,
        "whimsy": float,
        "darkTone": float,
        "coherence": float
      } 
    } 
  ] 
}
`;

        try {
            const res = await this.client.resilientCall({
                model: this.client.config.storyboardModel,
                prompt,
                temperature: 0.7,
                format: 'json',
                tier: 'Executive'
            });

            if (res.ok) {
                const rawResponse = res.value.response.match(/\{[\s\S]*\}/)?.[0] || '{}';
                const data = JSON.parse(rawResponse);
                let scenes = data.scenes || [];

                // Validate length to prevent silent pipeline creation of empty folders
                if (scenes.length === 0) {
                    logger.error({ id: book.id }, 'LLM generated 0 valid scenes or returned invalid JSON format.');
                    return { ok: false, error: new Error('Storyboard generation yielded 0 scenes.') };
                }

                // Map the literal text back into the "description" field to satisfy PipelineController's literal fidelity rule
                scenes = scenes.map((scene: any) => {
                    const matchedSegment = segments.find(s => s.index === scene.index);
                    // Use matched segment or fallback if indices scrambled
                    const literalText = matchedSegment ? matchedSegment.text : (segments[scenes.indexOf(scene)]?.text || 'Text alignment error.');

                    return {
                        ...scene,
                        description: literalText
                    };
                });

                // Persist the storyboard
                if (outputPath) {
                    // Save to the provided path (usually stage-1 folder)
                    writeFileSync(outputPath, JSON.stringify({ bookId: book.id, bookTitle: book.title, profile, scenes, neurologicalContext: { yaostate, yinYang } }, null, 2));
                    logger.info({ outputPath, bookId: book.id, sceneCount: scenes.length }, 'Storyboard successfully generated and persisted locally.');
                } else {
                    logger.warn({ bookId: book.id }, 'No outputPath provided for storyboard. Skipping persistence to global substrate.');
                }

                return { ok: true, value: scenes };
            } else {
                logger.error({ id: book.id, error: res.error }, 'LLM generation failed for storyboard.');
                return { ok: false, error: res.error };
            }
        } catch (err) {
            logger.error({ id: book.id, err }, 'Critical error in storyboard generation.');
            return { ok: false, error: err as Error };
        }
    }

    /**
     * generateCollectiveStoryboard - Merges multiple literary styles into a single narrative.
     * Applies Dual Ternary Brain logic (YaoState, Hexagrams).
     */
    public async generateCollectiveStoryboard(bookIds: number[], prompt: string): Promise<Result<StoryboardScene[]>> {
        const yaostate = this.hexagram.getYaoState();
        const interpretation = this.hexagram.getInterpretation();

        const styleProfiles: any[] = [];
        for (const id of bookIds) {
            const res = await this.gutenberg.analyzeStyle(id);
            if (res.ok) styleProfiles.push({ title: res.value.book.title, profile: res.value.profile });
        }

        const systemPrompt = `
GENERATE COLLECTIVE STORYBOARD (DUAL TERNARY SYNTHESIS)
You are a master storyteller synthesizing multiple literary styles into a unified whole.

--- [INSTRUCTION_LAYER] ---
NEUROLOGICAL BIAS (Sets Tone and Direction): 
- Current Hexagram: ${interpretation.id}. ${interpretation.name}
- Current YaoState: ${yaostate}
- Decision Matrix: Dual Ternary (Yin/Yang/Yao)

--- [CONTENT_LAYER] ---
STYLES TO MERGE:
${styleProfiles.map(s => `- ${s.title}: ${JSON.stringify(s.profile)}`).join('\n')}

Task: "${prompt}"

Respond in JSON format:
{
    "scenes": [
        {
            "index": number,
            "description": string,
            "visualPrompt": string,
            "styleInfluence": string,
            "prosody": {
                "chaos": float,
                "whimsy": float,
                "darkTone": float,
                "coherence": float
            }
        }
    ]
}
Note: Ensure the "prosody" vectors vary based on the narrative tension and the ${yaostate} influence (e.g., high chaos for conflict, high coherence for resolution).
`;

        const res = await this.client.resilientCall({
            model: this.client.config.storyboardModel,
            prompt: systemPrompt,
            temperature: 0.8,
            format: 'json',
            tier: 'Master'
        });

        if (!res.ok) return res;

        try {
            const rawResponse = res.value.response.match(/\{[\s\S]*\}/)?.[0] || '{}';
            const data = JSON.parse(rawResponse);
            return ok(data.scenes || []);
        } catch (err) {
            logger.error({ err }, 'Collective storyboard parsing failed.');
            return { ok: false, error: new Error('Collective storyboard generation failed.') };
        }
    }

    /**
     * generateFromPrompt - Freeform scene generation from any creative prompt.
     * No bookId required. The organism's imagination, unbound.
     * Runs through the full ternary/hexagram cognitive substrate.
     */
    public async generateFromPrompt(prompt: string, sceneCount: number = 5, style?: string): Promise<Result<StoryboardScene[]>> {
        const yaostate = this.hexagram.getYaoState();
        const interpretation = this.hexagram.getInterpretation();

        const systemPrompt = `
GENERATE FREEFORM STORYBOARD (SOVEREIGN IMAGINATION)
You are a master visual storyteller. Create ${sceneCount} cinematic scenes from the following prompt.

--- [COGNITIVE_LAYER] ---
NEUROLOGICAL BIAS:
- Hexagram: ${interpretation.id}. ${interpretation.name}
- Strategy: ${interpretation.strategy}
- YaoState: ${yaostate}
${style ? `- Style Override: ${style}` : ''}

--- [CREATIVE_LAYER] ---
PROMPT: "${prompt}"

Generate ${sceneCount} scenes with rich visual detail and emotional prosody vectors.

JSON format:
{
    "scenes": [
        {
            "index": number,
            "description": "Detailed narrative description",
            "visualPrompts": ["image gen prompt 1", "prompt 2"],
            "styleInfluence": "artistic style and mood",
            "prosody": { "chaos": float, "whimsy": float, "darkTone": float, "coherence": float }
        }
    ]
}
Vary prosody based on narrative tension and ${yaostate} influence.
`;

        const res = await this.client.resilientCall({
            model: this.client.config.storyboardModel,
            prompt: systemPrompt,
            temperature: 0.8,
            format: 'json',
            tier: 'Executive'
        });

        if (!res.ok) return res;

        try {
            const rawResponse = res.value.response.match(/\{[\s\S]*\}/)?.[0] || '{}';
            const data = JSON.parse(rawResponse);
            const scenes: StoryboardScene[] = (data.scenes || []).map((s: any, i: number) => ({
                index: s.index ?? i + 1,
                description: s.description || '',
                visualPrompts: Array.isArray(s.visualPrompts) ? s.visualPrompts : [s.visualPrompt || ''],
                styleInfluence: s.styleInfluence || style || 'cinematic',
                prosody: s.prosody,
                speaker: s.speaker
            }));
            logger.info({ sceneCount: scenes.length, prompt: prompt.substring(0, 100) }, 'Freeform storyboard generated');
            return ok(scenes);
        } catch (err) {
            logger.error({ err }, 'Freeform storyboard parse failed');
            return { ok: false, error: new Error('Freeform storyboard generation failed.') };
        }
    }

    public healthCheck(): { online: boolean; details: string } {
        return {
            online: true,
            details: 'Storyboard limb operational.'
        };
    }
}
