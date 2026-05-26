import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { type Result, ok, type ProsodyVector, CognitivePolarity } from '../../core/models.js';
import type { SovereignConfig } from '../../config/SovereignConfig.js';

import { HexagramManager } from '../../routing/HexagramManager.js';
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('SoundtrackLimb');

export interface AudioCue {
  timeMs: number;
  intensity: number;
  type: 'ROAR_PEAK' | 'ROAR_BUILD';
}

export interface SoundtrackParams {
    prompt: string;
    duration: number;
    keyframes?: AudioCue[];
    channels?: number;
    outputPath?: string;
}

export interface SoundtrackResult {
    path: string;
    duration: number;
    prompt: string;
    substrate: 'ffmpeg-procedural';
}

/**
 * SoundtrackLimb - Emotional Composition Substrate
 * Translates narrative prosody (Chaos, Whimsy, DarkTone) into
 * cinematic musical scores.
 *
 * PRIMARY: ffmpeg procedural synthesis (deterministic, zero-latency)
 */
export class SoundtrackLimb {

    constructor(
        config: SovereignConfig,
        private readonly hexagram: HexagramManager = HexagramManager.getInstance()
    ) { }

    /**
     * generateScore - Composes a background track based on emotional state.
     * Uses ffmpeg procedural synthesis.
     */
    public async generateScore(
        prosody: ProsodyVector,
        duration: number,
        outputPath: string
    ): Promise<Result<SoundtrackResult>> {
        const cappedDuration = Math.min(duration, 30);
        return this.generateViaFfmpeg(prosody, cappedDuration, outputPath);
    }

    /**
     * generate - Unified multi-modal synthesis entry point.
     * Supports kinematic keyframes for synchronized effects (like KBD roars).
     */
    public async generate(params: SoundtrackParams): Promise<Result<SoundtrackResult>> {
        const { duration, keyframes = [], outputPath = join(process.cwd(), 'audit_output', 'kbd_roar.wav') } = params;
        
        logger.info({ duration, keyframeCount: keyframes.length }, 'Initiating Kinematic Audio Synthesis');

        // Logic to translate keyframes into volume modulation for ffmpeg
        // We'll create a volume filter based on the timings
        let volFilter = 'volume=1.0';
        if (keyframes.length > 0) {
            const points = keyframes.map(k => `volume='if(between(t,${(k.timeMs/1000).toFixed(3)},${((k.timeMs+100)/1000).toFixed(3)}),${(0.5 + k.intensity).toFixed(2)},1.0)'`).join(',');
            volFilter = points; // This is a bit naive for many points, but works for peaks
        }

        const cappedDuration = Math.max(0.1, duration);
        const channels = params.channels === 5.1 ? 6 : 1;

        try {
            // Reusing basic procedural synth but adding the keyframe volume modulation
            const baseGraph = `aevalsrc='0.1*sin(2*PI*440*t)':s=44100:d=${cappedDuration}`;
            const cmd = `ffmpeg -y -f lavfi -i "${baseGraph}" -af "${volFilter}" -ac ${channels} "${outputPath}"`;

            execSync(cmd, { timeout: 30_000, stdio: 'pipe', windowsHide: true });
            
            return ok({
                path: outputPath,
                duration: cappedDuration,
                prompt: params.prompt,
                substrate: 'ffmpeg-procedural'
            });
        } catch (err) {
            logger.error({ err }, 'Kinematic synthesis failed.');
            return { ok: false, error: err as Error };
        }
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    // Procedural Synthesis via ffmpeg
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    private generateViaFfmpeg(
        prosody: ProsodyVector,
        duration: number,
        outputPath: string
    ): Result<SoundtrackResult> {
        const startTime = Date.now();
        const params = this.mapProsodyToSynthParams(prosody);
        const promptDescription = `Procedural: ternary=${params.ternary}, yao=${params.yaoState}, hex=${params.hexagram}, lpf=${params.lpfCutoff}Hz`;

        try {
            const filterGraph = this.buildFilterGraph(params, duration);

            // Reverting to direct CLI command but with better escaping for Windows
            // We use simple single quotes for the aevalsrc expression and double quotes for the filter chain
            const cmd = `ffmpeg -y -f lavfi -i "${filterGraph}" -ar 44100 -ac 1 -t ${duration} "${outputPath}"`;

            execSync(cmd, { timeout: 30_000, stdio: 'pipe', windowsHide: true });

            if (!existsSync(outputPath)) {
                return { ok: false, error: new Error('ffmpeg produced no output file.') };
            }

            const compositionTimeMs = Date.now() - startTime;
            logger.info({ compositionTimeMs, outputPath, substrate: 'ffmpeg' }, 'Procedural composition complete.');

            return ok({
                path: outputPath,
                duration,
                prompt: promptDescription,
                substrate: 'ffmpeg-procedural' as const
            });
        } catch (err) {
            logger.error({ err }, 'ffmpeg synthesis failed.');
            return { ok: false, error: err as Error };
        }
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    // Prosody Ã¢â€ â€™ Music Prompt (for HF MusicGen)
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    /**
     * mapProsodyToMusicPrompt - Weighted emotional blending for AI music generation.
     * Prevents tonal contradictions (e.g., simultaneous bright + dark).
     */
    private mapProsodyToMusicPrompt(prosody: ProsodyVector): string {
        const elements: string[] = [];

        // 1. Core Atmosphere (mutually exclusive weighting)
        const lightValue = prosody.whimsy * (1 - prosody.darkTone);
        const darkValue = prosody.darkTone * (1 - prosody.whimsy);

        if (lightValue > 0.5) {
            elements.push('uplifting major key', 'sparkling glockenspiel', 'bright woodwinds');
        } else if (darkValue > 0.5) {
            elements.push('ominous minor key', 'deep cinematic cello', 'low brass drones');
        } else {
            elements.push('neutral cinematic ambient', 'soft piano');
        }

        // 2. Rhythmic Intensity (Chaos)
        if (prosody.chaos > 0.7) {
            elements.push('fast frantic percussion', 'dissonant staccato synths');
        } else if (prosody.chaos > 0.4) {
            elements.push('steady rhythmic pulse', 'ticking clockwork elements');
        }

        // 3. Structural Integrity (Coherence)
        if (prosody.coherence < 0.4) {
            elements.push('abstract ethereal textures', 'drifting ambient wash');
        } else {
            elements.push('clear melodic theme', 'orchestral structure');
        }

        return `Cinematic background music, ${elements.join(', ')}, high quality, professional soundtrack`;
    }

    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â
    // Prosody Ã¢â€ â€™ Synthesis Parameters (for ffmpeg fallback)
    // Ã¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢ÂÃ¢â€¢Â

    private mapProsodyToSynthParams(prosody: ProsodyVector): SynthParams {
        const darkWeight = prosody.darkTone * (1 - prosody.whimsy);
        const lightWeight = prosody.whimsy * (1 - prosody.darkTone);

        // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 1. Derive I-Ching States + Real-time Biasing Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
        const contract = this.hexagram.getContract();
        const ternary = contract.polarity;
        const currentYao = this.hexagram.getYaoState();

        // Mix local prosody chaos with global Yao density
        let yaoIdx = 1;
        if (prosody.chaos > 0.8) yaoIdx = 0;
        else if (prosody.chaos > 0.5) yaoIdx = 2;

        const yaoState = currentYao || yaoIdx; // Use global override if set

        // Hexagram String (6-bit logic from prosody metrics)
        const hexBits = [
            prosody.chaos > 0.5 ? 1 : 0,
            prosody.whimsy > 0.5 ? 1 : 0,
            prosody.darkTone < 0.5 ? 1 : 0,
            prosody.coherence > 0.5 ? 1 : 0,
            darkWeight < lightWeight ? 1 : 0,
            prosody.chaos > 0.8 || prosody.whimsy > 0.8 ? 1 : 0
        ];
        const hexagram = hexBits.join('');

        // Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬ 2. Derive Audio Parameters Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
        // Base Freq: Yin=Low (minor/dark), Yang=High (major/bright)
        const baseFreq = ternary === CognitivePolarity.YIN ? 55 : ternary === CognitivePolarity.YANG ? 110 : 73.42; // A1, A2, D2

        // BPM / Sequence Rate based on Yao
        const bps = yaoState === 0 ? 8 : yaoState === 2 ? 4 : yaoState === 3 ? 1 : 2; // Beats per second

        // FX & Atmosphere parameters
        const lpfCutoff = 400 + lightWeight * 4000 + prosody.chaos * 2000;
        const delayMs = bps === 8 ? 250 : 500;

        return {
            ternary, yaoState, hexagram,
            baseFreq, bps, lpfCutoff, delayMs,
            chaos: prosody.chaos,
            whimsy: prosody.whimsy,
            coherence: prosody.coherence
        };
    }

    private buildFilterGraph(params: SynthParams, duration: number): string {
        const { baseFreq, bps, hexagram, ternary, chaos, lpfCutoff, delayMs } = params;

        // 1. Algorithmic Sequencer (The Hexagram Melody)
        // Convert the 6-bit hexagram into a mathematical step sequence.
        // E.g., '101100' -> arr[mod(trunc(t*bps), 6)] -> yields base multipliers
        const stepMultipliers = hexagram.split('').map((bit: string) =>
            bit === '1' ? (ternary === CognitivePolarity.YIN ? 1.5 : 2.0) : (ternary === CognitivePolarity.YIN ? 1.2 : 1.0)
        );

        // 1. Voice Definitions
        // Sub Bass (Continuous Drone) - Low amplitude to avoid clipping
        const bassExpr = `0.3*sin(2*PI*(${baseFreq / 2})*t)`;

        // Arp / Lead (Sequenced by Hexagram)
        // We use trunc(t*BPS) % 6 to index the step. 
        // aevalsrc doesn't have arrays, so we use nested if() or multiple eq() gates.
        const seqExpr = stepMultipliers.map((m: number, i: number) => `eq(mod(floor(t*${bps}),6),${i})*${m}`).join('+');
        const arpExpr = `0.4*sin(2*PI*(${baseFreq})*(${seqExpr})*t)*(1-mod(t*${bps},1))`; // Plucky envelope

        // Noise / Texture (Chaos driven)
        const noiseExpr = `${(chaos * 0.1).toFixed(3)}*random(0)`;

        // Pad (Whimsy/Coherence driven)
        const padExpr = `0.1*(sin(2*PI*${baseFreq}*t)+sin(2*PI*${baseFreq * 1.5}*t))`;

        // 2. Mix and Envelopes
        const rawMix = `${bassExpr}+${arpExpr}+${noiseExpr}+${padExpr}`;
        const fadeIn = 1.0;
        const fadeOut = 2.0;
        const envelopedEnv = `(${rawMix})*min(1,t/${fadeIn.toFixed(1)})*min(1,(${duration}-t)/${fadeOut.toFixed(1)})`;

        // 3. DSP Effects Chain
        const dry = 0.5;
        const wet = 0.9;
        const dspChain = `lowpass=f=${Math.round(lpfCutoff)},chorus=${dry}:${wet}:50:0.4:0.25:2,aecho=0.8:0.9:${delayMs}:0.3,acompressor=threshold=-12dB:ratio=4:attack=5:release=50`;

        // Return as a single LAVFI source string for the -i argument
        return `aevalsrc='${envelopedEnv}':s=44100:d=${duration},${dspChain}`;
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        let hasFfmpeg = false;
        try {
            execSync('ffmpeg -version', { stdio: 'pipe', timeout: 5000, windowsHide: true });
            hasFfmpeg = true;
        } catch { /* noop */ }

        const details = `Soundtrack: ${hasFfmpeg ? 'ONLINE' : 'DEGRADED'} (${hasFfmpeg ? 'ffmpeg procedural synthesis READY' : 'ffmpeg MISSING, procedural synthesis OFFLINE'})`;

        return { online: hasFfmpeg, details };
    }
}

interface SynthParams {
    ternary: CognitivePolarity;
    yaoState: number;
    hexagram: string;
    baseFreq: number;
    bps: number;
    lpfCutoff: number;
    delayMs: number;
    chaos: number;
    whimsy: number;
    coherence: number;
}
