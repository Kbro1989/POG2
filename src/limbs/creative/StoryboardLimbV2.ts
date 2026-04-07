
import { type Result, type ProsodyVector, ok, YaoState } from '../../core/models.js'
import { ModelClient } from '../../clients/ModelClient.js';
import { GutenbergLimb } from './GutenbergLimb.js';
import { NarrativeSegment } from '../../utils/NarrativeExtractor.js';
import { BioIntelligenceLimb } from '../spatial/BioIntelligenceLimb.js';
import { VectorDB } from '../../utils/VectorDB.js';
import { PedagogyLimb } from '../technical/PedagogyLimb.js';
import { KinematicsLimb } from '../technical/KinematicsLimb.js';
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { HexagramManager } from '../../routing/HexagramManager.js';
import { createLogger } from "../../utils/logger.js";
import { getSovereignRoot } from '../../utils/SovereignPathResolver.js';
import { CacheForensicsLimb } from '../spatial/CacheForensicsLimb.js';

const logger = createLogger('StoryboardLimb');

/** Reserved ID range for Born-Digital entities (50,000 - 149,999) */
const BORN_DIGITAL_ID_BASE = 50_000;
const BORN_DIGITAL_ID_RANGE = 100_000;

export interface StoryboardScene {
    dataType: string;
    spotAnimId: number;
    callSignals: any;
    audioId: number;
    boneCount: any;
    isSkeletal: any;
    index: number;
    description: string;
    visualPrompts: string[];
    styleInfluence: string;
    prosody?: ProsodyVector;
    speaker?: string; // Autonomous character identification
    modelId?: number; //rsmv Model ID (Forensic Casting)
    animationId?: number; //rsmv Sequence ID (Forensic Acting)
    duration?: number;
    durationSeconds?: number; // Real game-tick duration
    kinematicId?: string | number; // Pedagogy Kinematic ID
    cameraNotes?: string;
    audioPrompt?: string;
    location?: { x: number, y: number, plane: number };
    pose?: { npcId: number, x: number, y: number, z: number }; // Precise world placement
}

export class StoryboardLimbV2 {
    constructor(
        private readonly client: ModelClient,
        private readonly gutenberg: GutenbergLimb,
        private readonly hexagram: HexagramManager,
        private readonly vectorDB: VectorDB,
        private readonly bioIntel: BioIntelligenceLimb,
        private readonly pedagogy: PedagogyLimb,
        private readonly kinematics: KinematicsLimb,
        private readonly forensics: CacheForensicsLimb,
        private readonly modelName: string = 'deepseek-r1:8b'
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
                tier: 'Executive',
                yaoState: this.hexagram.getYaoState()
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

                // Map the literal text back into the "description" field BEFORE casting
                scenes = scenes.map((scene: any) => {
                    const matchedSegment = segments.find(s => s.index === scene.index);
                    // Use matched segment or fallback if indices scrambled
                    const literalText = matchedSegment ? matchedSegment.text : (segments[scenes.indexOf(scene)]?.text || 'Text alignment error.');

                    return {
                        ...scene,
                        description: literalText
                    };
                });

                // Stage 2.5: Forensic Casting & Acting
                const castingRes = await this.performForensicCasting(scenes);
                if (!castingRes.ok) {
                    logger.error({ id: book.id, error: castingRes.error }, 'Forensic Casting failed.');
                    return { ok: false, error: castingRes.error };
                }
                scenes = castingRes.value;

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

    /**
     * performForensicCasting - Maps characters torsmv IDs using affective resonance.
     */
    public async performForensicCasting(scenes: StoryboardScene | StoryboardScene[]): Promise<Result<StoryboardScene[]>> {
        const sceneList = Array.isArray(scenes) ? scenes : [scenes];
        logger.info({ sceneCount: sceneList.length }, 'Initiating Forensic Casting protocol.');

        logger.info({ sceneCount: sceneList.length }, 'Initiating Generalized Forensic Casting protocol (Total Substrate Awareness).');

        // Stage 0.5: Specialized Substrate Detection (KBD/Project Specific)
        const isKbdContext = sceneList.some(s => (s.description || "").toLowerCase().includes('kbd') || (s.speaker || "").toLowerCase().includes('kbd'));

        let localConfigs: any[] = [];
        let boneAudit: Record<string, any> = {};

        if (isKbdContext) {
            logger.info('Specialized KBD context detected. Loading specialized substrates.');
            const kbdSubstratePath = join(process.cwd(), 'audit_output', 'kbd_arena', 'assets', 'kbd_legion_configs.json');
            const boneAuditPath = join(process.cwd(), 'kbd_bone_audit.json');

            if (existsSync(kbdSubstratePath)) {
                try {
                    localConfigs = JSON.parse(readFileSync(kbdSubstratePath, 'utf8'));
                    logger.debug({ count: localConfigs.length }, 'Loaded local KBD substrate.');
                } catch (e) { logger.warn('Failed to parse kbd_legion_configs.json'); }
            }

            if (existsSync(boneAuditPath)) {
                try {
                    boneAudit = JSON.parse(readFileSync(boneAuditPath, 'utf8'));
                    logger.debug('Loaded KBD bone audit signals.');
                } catch (e) { logger.warn('Failed to parse kbd_bone_audit.json'); }
            }
        }

        let kinematicsSubstrate: any = { kinematics: [] };
        const kinematicsPath = join(getSovereignRoot(), 'memory', 'pedagogy', 'kinematics.json');
        if (existsSync(kinematicsPath)) {
            try {
                kinematicsSubstrate = JSON.parse(readFileSync(kinematicsPath, 'utf8'));
                logger.debug({ count: kinematicsSubstrate.kinematics.length }, 'Loaded verified Kinematics substrate.');
            } catch (e) { logger.warn('Failed to parse kinematics.json'); }
        }

        for (const scene of sceneList) {
            const description = (scene.description || "").toLowerCase();
            const prosody = scene.prosody || { darkTone: 0.5 };

            const speaker = (scene.speaker || "").toLowerCase();

            // Fallback for Player/POV (Generic mapping)
            if (!scene.pose && (speaker.includes('player') || speaker.includes('pov'))) {
                scene.pose = { npcId: 15516, x: 3213, y: 3424, z: 0 }; // Default Varrock center for player
            }

            // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            // STAGE 1: SUBSTRATE FORENSICS â€” High-Fidelity Match
            // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            if (speaker && speaker !== 'narrator' && speaker !== 'pov' && speaker !== 'player') {
                const searchRes = this.forensics.searchByName(speaker, 'npc');
                if (searchRes.ok && searchRes.value.length > 0) {
                    const bestMatch = searchRes.value[0];
                    if (bestMatch.matchScore === 1.0) { // Exact match
                        const details = await this.forensics.getNpcDetails(bestMatch.id);
                        if (details.ok) {
                            scene.modelId = bestMatch.id;
                            scene.pose = {
                                npcId: bestMatch.id,
                                x: 3213, // Fallback location if spawn unknown
                                y: 3424,
                                z: 0
                            };
                            logger.info({ scene: scene.index, name: bestMatch.name, npcId: bestMatch.id }, 'Forensic Casting: Exact Substrate Match Resolved.');
                        }
                    }
                }
            }

            // Fallback to VectorDB if no exact match found
            if (!scene.modelId) {
                // 1. Casting Query
                // Search for an NPC that matches the description + affective resonance
                const query = `NPC entity matching description: ${description}. Speaker: ${speaker}. Affective resonance: ${JSON.stringify(prosody)}.`;
                const embedRes = await this.client.embed(query);

                if (embedRes.ok) {
                    const results = this.vectorDB.searchSimilar(embedRes.value, 5, 'global', 'pedagogy');
                    if (results.ok && results.value.length > 0) {
                        // Filter for NPC types and apply BioIntelligence validation
                        for (const lesson of results.value) {
                            const profile = lesson.metadata;
                            if (profile.type === 'NPC') {
                                const npcId = parseInt(profile.id);

                                // BioIntelligence Gate: Anatomical proof
                                const proof = {
                                    limbCount: profile.metrics.boneCount > 100 ? 33 : 10, // Heuristic
                                    structuralIntegrity: 10
                                };

                                if (await this.bioIntel.validateStructure(proof)) {
                                    scene.modelId = npcId;
                                    logger.info({ scene: scene.index, npcId, name: profile.name }, 'Forensic Casting: Match Found via VectorDB/BioIntel.');
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            // PHASE 27: GENERATIVE NPC FALLBACK â€” "Forge of the Future"
            // Novelty bias flows through the Hexagram's YaoState:
            //   OldMixed (Chaotic)  â†’ Maximum invention, wild traits
            //   OldYang  (Decisive) â†’ Bold but structured creation
            //   YoungYin (Receptive)â†’ Conservative, close to known archetypes
            // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            if (!scene.modelId && speaker && speaker !== 'narrator') {
                const yao = this.hexagram.getYaoState();
                const chaosTemp = yao === YaoState.OldMixed ? 1.2
                    : yao === YaoState.OldYang ? 0.9
                        : yao === YaoState.YoungMixed ? 0.8
                            : 0.6; // YoungYin/YoungYang â€” grounded invention

                const bornDigitalId = BORN_DIGITAL_ID_BASE + Math.floor(Math.random() * BORN_DIGITAL_ID_RANGE);
                const capitalizedName = speaker.charAt(0).toUpperCase() + speaker.slice(1);

                const traitPrompt = `Invent a RuneScape-style NPC named "${capitalizedName}".
Context: ${description.substring(0, 500)}
Hexagram Guidance: ${this.hexagram.getInterpretation().judgment}
Respond JSON ONLY: {"race":"string","role":"string","combatLevel":number,"boneCount":number,"lore":"1 sentence"}`;

                let traits = { race: 'Human', role: 'Quest NPC', combatLevel: 1, boneCount: 45, lore: `A figure known as ${capitalizedName}.` };
                try {
                    const traitRes = await this.client.call({
                        model: this.client.config.fastPathModel,
                        prompt: traitPrompt,
                        temperature: chaosTemp,
                        format: 'json'
                    });
                    if (traitRes.ok) {
                        const parsed = JSON.parse(traitRes.value.response.match(/\{[\s\S]*\}/)?.[0] || '{}');
                        traits = { ...traits, ...parsed };
                    }
                } catch { /* Use defaults */ }

                scene.modelId = bornDigitalId;
                scene.pose = scene.pose || {
                    npcId: bornDigitalId,
                    x: 3200 + Math.floor(Math.random() * 100),
                    y: 3400 + Math.floor(Math.random() * 100),
                    z: 0
                };
                scene.boneCount = traits.boneCount;

                logger.info({ scene: scene.index, npcId: bornDigitalId, name: capitalizedName, race: traits.race, yao }, 'ðŸ”¥ BORN-DIGITAL: New NPC forged. YaoState drove invention temperature.');

                // Substrate Feedback Loop â€” persist for self-evolution
                this.persistBornDigital(capitalizedName, bornDigitalId, traits, description);
            }

            // 2. Acting Query (Animations)
            // If we have a model, find a suitable animation
            if (scene.modelId) {
                // 2.5 Signal Detection (Call Signals / VFX / Audio)
                if (description.includes('fire') || description.includes('flame')) {
                    scene.spotAnimId = 393; // standard fire breath GFX
                    scene.callSignals = { ...scene.callSignals, vfx_trigger: 'primary_attack' };
                }
                if (description.includes('roar') || description.includes('growl')) {
                    scene.audioId = 401; // dragon roar sfx
                    scene.callSignals = { ...scene.callSignals, audio_trigger: 'voice_primary' };
                }

                // 3. Acting Query (Animations)
                const verbs = ['roar', 'walk', 'attack', 'run', 'die', 'laugh', 'idle'];
                let selectedVerb = 'idle';
                for (const v of verbs) {
                    if (description.includes(v)) {
                        selectedVerb = v;
                        break;
                    }
                }

                // Check verified kinematics substrate first
                const matchedKinematic = kinematicsSubstrate.kinematics.find((k: any) =>
                    k.semantics?.role?.toLowerCase().includes(selectedVerb) ||
                    k.semantics?.intent?.toLowerCase().includes(selectedVerb)
                );

                if (matchedKinematic) {
                    scene.kinematicId = matchedKinematic.id;
                    // Match game ticks from retrieved info in D:\ kinematics substrate
                    if (matchedKinematic.durationTicks) {
                        scene.durationSeconds = matchedKinematic.durationTicks * 0.6;
                        logger.debug({ scene: scene.index, ticks: matchedKinematic.durationTicks }, 'Synced scene timing to game ticks from kinematics substrate.');
                    }
                    scene.animationId = parseInt(matchedKinematic.id);
                    scene.duration = matchedKinematic.metrics?.durationSeconds;
                    scene.isSkeletal = matchedKinematic.metrics?.isSkeletal;
                    if (matchedKinematic.metrics?.linkedSpotanims?.length > 0) {
                        scene.spotAnimId = matchedKinematic.metrics.linkedSpotanims[0].id;
                    }
                    logger.info({ scene: scene.index, animationId: scene.animationId, duration: scene.duration, verb: selectedVerb }, 'Forensic Acting: Substrate Match Found.');
                } else if (scene.modelId) {
                    // Fallback to VectorDB
                    const animQuery = `Animation for ${selectedVerb}. Affective resonance: ${JSON.stringify(prosody)}.`;
                    const animEmbed = await this.client.embed(animQuery);
                    let vectorAnimFound = false;
                    if (animEmbed.ok) {
                        const animResults = this.vectorDB.searchSimilar(animEmbed.value, 5, 'global', 'kinematics');
                        if (animResults.ok && animResults.value.length > 0) {
                            const animId = parseInt(animResults.value[0].id);
                            scene.animationId = animId;
                            vectorAnimFound = true;

                            const kinRes = await this.kinematics.extractKinematics(animId);
                            if (kinRes.ok) {
                                scene.duration = kinRes.value.metrics.durationSeconds;
                                scene.isSkeletal = kinRes.value.metrics.isSkeletal;
                                if (kinRes.value.metrics.linkedSpotanims?.length) {
                                    scene.spotAnimId = kinRes.value.metrics.linkedSpotanims[0].id;
                                }
                            }
                            logger.info({ scene: scene.index, animationId: scene.animationId, duration: scene.duration }, 'Forensic Acting: VectorDB Match Found.');
                        }
                    }

                    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                    // PHASE 27: ANIMATION EXTRAPOLATION â€” Novel Moves
                    // No kinematic match? Extrapolate from the verb itself.
                    // Every action deserves motion. Carpe diem.
                    // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
                    if (!vectorAnimFound && !scene.animationId) {
                        const syntheticAnimId = BORN_DIGITAL_ID_BASE + Math.floor(Math.random() * BORN_DIGITAL_ID_RANGE);
                        scene.animationId = syntheticAnimId;
                        scene.duration = 1.8 + Math.random() * 3.0; // 1.8s to 4.8s
                        scene.isSkeletal = true;
                        scene.kinematicId = `SYNTH_${selectedVerb.toUpperCase()}_${syntheticAnimId}`;
                        logger.info({ scene: scene.index, verb: selectedVerb, syntheticAnimId }, 'âš¡ BORN-DIGITAL: Synthetic animation extrapolated from narrative verb.');
                    }
                }
            }
        }

        return ok(sceneList);
    }

    /**
     * persistBornDigital â€” Substrate Feedback Loop.
     * Anchors a Born-Digital NPC into D:\sovereign\memory\pedagogy
     * so the system learns from its own creations.
     */
    private persistBornDigital(name: string, id: number, traits: any, context: string): void {
        try {
            const pedagogyDir = join(getSovereignRoot(), 'memory', 'pedagogy');
            if (!existsSync(pedagogyDir)) mkdirSync(pedagogyDir, { recursive: true });

            const profile = {
                id: `BORN_DIGITAL_${id}`,
                name,
                type: 'NPC',
                origin: 'BORN_DIGITAL',
                metrics: {
                    polyCount: 0,
                    boneCount: traits.boneCount || 45,
                    materialComplexity: 1,
                    combatLevel: traits.combatLevel || 1
                },
                semantics: {
                    role: traits.role || 'Unknown',
                    race: traits.race || 'Human',
                    intent: 'born_digital_npc',
                    lore: traits.lore || ''
                },
                generativeContext: context.substring(0, 500),
                hexagramState: this.hexagram.getInterpretation().id,
                timestamp: Date.now()
            };

            const filePath = join(pedagogyDir, `NPC_BORN_DIGITAL_${id}.json`);
            writeFileSync(filePath, JSON.stringify(profile, null, 2));
            logger.info({ filePath, name, id }, 'ðŸ§¬ Born-Digital NPC persisted to Sovereign substrate.');
        } catch (e) {
            logger.warn({ name, id, error: (e as Error).message }, 'Failed to persist Born-Digital NPC.');
        }
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const gutenbergHealth = await this.gutenberg.healthCheck();
        const details = `Storyboard Substrate: ${gutenbergHealth.online ? 'ONLINE' : 'DEGRADED'} (Gutenberg dependency: ${gutenbergHealth.online ? 'OK' : 'FAIL'})`;
        return {
            online: gutenbergHealth.online,
            details
        };
    }
}
