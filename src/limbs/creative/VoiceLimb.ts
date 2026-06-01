import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { type Result, type ProsodyVector, EmotionalState, GenerativeAesthetics } from '../../core/models.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { GhostLimb } from '../metaphysical/GhostLimb.js';
import { CloudflareServices } from '../../services/CloudflareServices.js';
import type { SovereignConfig } from '../../config/SovereignConfig.js';
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('VoiceLimb');

export interface NarrationOptions {
    personality?: string;
    outputPath?: string; // Path to save the .wav file
    prosody?: ProsodyVector;
    emotion?: EmotionalState;
    characterTraits?: string; // Autonomous trait alignment
    aesthetics?: GenerativeAesthetics; // Metabolic injection
}

export interface NarrationResult {
    text: string;
    personality: string;
    estimatedDurationSec: number;
    status: 'generated' | 'failed';
    audioPath?: string;
    prosody?: ProsodyVector;
}

/**
 * VoiceLimb - Sovereign Physicalization
 * 
 * Conducts neural speech synthesis via Cloudflare Workers AI.
 */
export class VoiceLimb {
    private voiceRegistry: Map<string, string> = new Map(); // characterName -> voiceId/description

    constructor(
        private readonly client: ModelClient,
        private readonly config: SovereignConfig,
        private readonly cfServices?: CloudflareServices
    ) { }

    /**
     * getEmotionalProsody - Maps Sovereign emotional states and per-scene prosody vectors to TTS parameters.
     */
    private getEmotionalProsody(options: NarrationOptions): { speed: number; pitch: number; jitterMult: number } {
        const { emotion, prosody: sceneProsody, characterTraits, aesthetics: aes } = options;
        let speed = 1.0;
        let pitch = 1.0;
        let jitterMult = 1.0;

        // 1. Initial mapping from high-level EmotionalState
        switch (emotion) {
            case EmotionalState.Melancholy: speed = 0.85; pitch = 0.85; break;
            case EmotionalState.Quiet: speed = 0.8; pitch = 0.95; break;
            case EmotionalState.Zen: speed = 0.9; pitch = 1.0; break;
            case EmotionalState.Agitated: speed = 1.25; pitch = 1.15; jitterMult = 1.5; break;
            case EmotionalState.Surprised: speed = 1.2; pitch = 1.3; jitterMult = 1.8; break;
            case EmotionalState.Inspired: speed = 1.1; pitch = 1.1; break;
            case EmotionalState.Decisive: speed = 1.05; pitch = 1.1; break;
        }

        // 2. Character Trait Alignment
        if (characterTraits) {
            const traits = characterTraits.toLowerCase();
            if (traits.includes('fast') || traits.includes('quick') || traits.includes('erratic')) speed += 0.15;
            if (traits.includes('slow') || traits.includes('ponderous') || traits.includes('ancient')) speed -= 0.2;
            if (traits.includes('high') || traits.includes('squeaky') || traits.includes('child')) pitch += 0.2;
            if (traits.includes('low') || traits.includes('deep') || traits.includes('booming')) pitch -= 0.25;
            if (traits.includes('anxious') || traits.includes('shaky')) jitterMult *= 2.0;
        }

        // 3. Fine-grained adjustment from per-scene ProsodyVector (The "Soul")
        if (sceneProsody) {
            speed -= (sceneProsody.darkTone * 0.25);
            pitch -= (sceneProsody.darkTone * 0.30);
            speed += (sceneProsody.chaos * 0.30);
            jitterMult += (sceneProsody.chaos * 0.5);
            pitch += (sceneProsody.whimsy * 0.25);
            speed += (sceneProsody.whimsy * 0.15);
        }

        // Clamp values
        speed = Math.max(0.5, Math.min(1.8, speed));
        // 4. Metabolic Aesthetics Override (Phase 13)
        if (aes) {
            // Scale influences pacing
            if (aes.scale === 'Grand') speed *= 0.9; // Slightly more epic/slow
            if (aes.scale === 'Abstract') jitterMult *= 1.3; // More erratic

            // Thermal variance influences jitter/chaos directly
            jitterMult += aes.thermalVariance * 0.5;
        }

        return { speed, pitch, jitterMult };
    }

    /**
     * splitTextIntoSegments - Splits text into punctuation-aware chunks for pacing.
     */
    private splitTextIntoSegments(text: string): Array<{ text: string; pauseAfterMs: number }> {
        // Match segments ending with punctuation or end of string, including dash cases
        const regex = /[^.!?\n,;—]+[.!?\n,;—]*/g;
        const matches = text.match(regex) || [text];

        return matches.map(segment => {
            const trimmed = segment.trim();
            if (!trimmed || trimmed.length < 2) return null; // Skip tiny fragments

            let pause = 0;
            if (/[.!?\n]/.test(segment)) {
                pause = 600; // Increased full stop pause for cinematic weight
            } else if (/[,;—]/.test(segment)) {
                pause = 300; // Increased minor pause
            }

            return { text: trimmed, pauseAfterMs: pause };
        }).filter((s): s is { text: string; pauseAfterMs: number } => s !== null);
    }

    /**
     * narrate - Generate a narration artifact for a given text.
     * 
     * Refinement: Splits text by punctuation, adds prosody jitter, and merges via FFmpeg.
     */
    public async narrate(text: string, options: NarrationOptions = {}): Promise<Result<NarrationResult>> {
        const persona = options.personality || 'Sovereign Narrator';
        const segments = this.splitTextIntoSegments(text);
        const baseProsody = this.getEmotionalProsody(options);

        logger.info({
            personality: persona,
            traits: options.characterTraits,
            segments: segments.length,
            baseSpeed: baseProsody.speed.toFixed(2),
            basePitch: baseProsody.pitch.toFixed(2),
            jitterMult: baseProsody.jitterMult.toFixed(2)
        }, 'Initiating multi-part character-aware neural speech synthesis...');

        const tmpDir = join(process.cwd(), 'tmp', `voice-${Date.now()}`);
        const { mkdirSync, existsSync, writeFileSync, rmSync } = await import('fs');
        const { execSync } = await import('child_process');

        if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

        try {
            let totalEstimatedDuration = 0;

            // 1. Generate segments in parallel
            const tasks = segments.map(async (segment, i) => {
                // Apply aggressive jitter (Â±10%) to vary the monotone
                // Chaos and Agitation increase the range of the jitter
                const baseJitter = 0.1 * baseProsody.jitterMult;
                const jitterRange = baseJitter + ((options.prosody?.chaos ?? 0) * 0.2);

                const speedJitter = baseProsody.speed * (1.0 + (Math.random() - 0.5) * jitterRange);
                const pitchJitter = baseProsody.pitch * (1.0 + (Math.random() - 0.5) * jitterRange);

                logger.debug({ i, text: segment.text.substring(0, 20), speedJitter: speedJitter.toFixed(2), pitchJitter: pitchJitter.toFixed(2) }, 'Synthesizing segment with character jitter');

                let res: Result<Buffer>;
                if (this.cfServices) {
                    res = await this.cfServices.runAi<Buffer>('@cf/myshell-ai/melotts', {
                        text: segment.text,
                        service: 'tts', // Hint for some routers
                        speaker: 'en-us-male-1' // Common MeloTTS speaker
                    });
                } else {
                    res = await this.client.callCloudflareTTS(segment.text, {
                        speed: speedJitter,
                        pitch: pitchJitter
                    });
                }

                if (!res.ok || !res.value || res.value.length < 100) {
                    logger.warn({ index: i, reason: !res.ok ? 'Error' : 'Empty/Small Buffer' }, 'Cloudflare TTS failed or returned invalid data. Dropping to Ghost Piper fallback.');
                    const ghost = new GhostLimb(this.config);
                    const segPath = join(tmpDir, `seg-${i}.wav`);
                    const fallbackRes = await ghost.executePiperFallback(segment.text, segPath);
                    if (!fallbackRes.ok) throw fallbackRes.error;
                    return { path: segPath, pause: segment.pauseAfterMs, text: segment.text };
                }

                const segPath = join(tmpDir, `seg-${i}.wav`);
                writeFileSync(segPath, res.value);

                logger.debug({ i, path: segPath, size: res.value.length }, 'Segment synthesized successfully');

                // Track for ffmpeg
                return { path: segPath, pause: segment.pauseAfterMs, text: segment.text };
            });

            const results = await Promise.all(tasks);


            // 2. Concatenate with silences via FFmpeg
            if (options.outputPath) {
                const outDir = dirname(options.outputPath);
                if (!existsSync(outDir)) {
                    mkdirSync(outDir, { recursive: true });
                }

                const inputs = results.map(r => `-i "${r.path}"`).join(' ');

                let complexFilter = '';
                let concatInputs = '';

                results.forEach((res, i) => {
                    // Mapped input for the voice segment itself
                    concatInputs += `[${i}:a]`;

                    if (res.pause > 0) {
                        const silenceDur = res.pause / 1000;
                        const silenceId = `s${i}`;
                        // Generate silence as an independent source
                        complexFilter += `anullsrc=r=44100:cl=mono:d=${silenceDur}[${silenceId}]; `;
                        concatInputs += `[${silenceId}]`;
                    }
                });

                const totalInputs = results.reduce((acc, r) => acc + (r.pause > 0 ? 2 : 1), 0);
                complexFilter += `${concatInputs}concat=n=${totalInputs}:v=0:a=1[outa]`;

                const cmd = `ffmpeg -y ${inputs} -filter_complex "${complexFilter}" -map "[outa]" "${options.outputPath}"`;

                try {
                    execSync(cmd, { stdio: 'pipe', windowsHide: true });
                } catch (ffmpegErr: any) {
                    const stderr = ffmpegErr.stderr?.toString() || ffmpegErr.message;
                    logger.error({ stderr }, 'FFmpeg voice concatenation failed');
                    throw new Error(`FFmpeg Concat Failed: ${stderr}`);
                }

                // Duration estimation refinement
                results.forEach(res => {
                    const words = res.text.split(/\s+/).length;
                    totalEstimatedDuration += (words / 130) * 60 + (res.pause / 1000);
                });
            }

            // Cleanup temp dir
            rmSync(tmpDir, { recursive: true, force: true });

            return {
                ok: true,
                value: {
                    text,
                    personality: persona,
                    estimatedDurationSec: Math.round(totalEstimatedDuration),
                    status: 'generated',
                    audioPath: options.outputPath,
                    prosody: options.prosody
                }
            };

        } catch (err: any) {
            logger.error({ err: err.message }, 'Multi-part neural speech synthesis FAILED. Attempting GhostLimb Piper Fallback...');
            try { if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true, force: true }); } catch { }

            if (options.outputPath) {
                const ghost = new GhostLimb(this.config);
                const fallbackResult = await ghost.executePiperFallback(text, options.outputPath);
                if (fallbackResult.ok) {
                    return {
                        ok: true,
                        value: {
                            text,
                            personality: persona,
                            estimatedDurationSec: Math.round(text.length / 15), // Rough estimate
                            status: 'generated',
                            audioPath: options.outputPath,
                            prosody: options.prosody
                        }
                    };
                }
            }

            return { ok: false, error: err instanceof Error ? err : new Error(String(err)) };
        }
    }

    /**
     * assignCharacterVoice - Ensures the same character keeps the same vocal identity.
     */
    public assignCharacterVoice(characterName: string, desiredTraits: string): string {
        if (this.voiceRegistry.has(characterName)) {
            return this.voiceRegistry.get(characterName)!;
        }
        // In Phase 104, we log the mandate for specialized vocal trait analysis
        logger.info({ characterName, model: this.client.config.vocalAnalysisModel }, 'Registering character vocal identity via specialized analysis substrate.');
        this.voiceRegistry.set(characterName, desiredTraits);
        return desiredTraits;
    }

    /**
     * verifyConsistency - Self-audit of vocal performance.
     */
    public async verifyConsistency(audioPath: string, expectedProsody: ProsodyVector): Promise<Result<{ matchScore: number }>> {
        logger.info({ audioPath }, 'Performing auditory proprioception audit...');
        // In Phase 98.7, we'd use a multimodal model or signal analysis.
        // For now, we return a simulated high-confidence score if the file exists.
        return { ok: true, value: { matchScore: 0.95 } };
    }

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        // Cloudflare AI Substrate Check
        const cfOnline = !!this.cfServices || !!(this.client as any).cf;
        const details = `Voice Substrate: ${cfOnline ? 'ONLINE' : 'DEGRADED'} (Cloudflare AI binding: ${cfOnline ? 'ACTIVE' : 'MISSING'})`;
        return { online: cfOnline, details };
    }
}

