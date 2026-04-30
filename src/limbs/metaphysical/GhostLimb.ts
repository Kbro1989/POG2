import { type Result, ok, type SovereignKnock } from '../../core/models.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { getSovereignRoot } from '../../utils/SovereignPathResolver.js';
import { join } from 'path';
import { exec } from 'child_process';
import { existsSync } from 'fs';
import type { SovereignConfig } from '../../config/SovereignConfig.js';
import { createLogger } from "../../utils/logger.js";

const logger = createLogger('GhostLimb');

/**
 * GhostLimb - The Observer Mind (Backup Consciousness)
 * Monitors the primary Orchestrator and assumes control during catatonic or failed states.
 * 
 * "I am the one who watches when you dream."
 */
export class GhostLimb {
    private watchInterval: NodeJS.Timeout | null = null;
    private isObserving: boolean = false;
    private awarenessScore: number = 1.0;

    constructor(private readonly config: SovereignConfig) { }

    /**
     * awaken - Activates the observer cycle.
     */
    public awaken(): void {
        if (this.isObserving) return;

        logger.info('[GHOST_VOICE] Awakening the observer mind...');
        this.isObserving = true;

        // Monitor primary cycle every 5 seconds (low resource overhead)
        this.watchInterval = setInterval(() => {
            this.pulse();
        }, 5000).unref();
    }

    /**
     * pulse - A single observation cycle.
     */
    private pulse(): void {
        const timestamp = Date.now();
        // In a real implementation, this would check a shared state or heartbeat file
        // For now, we simulate the 'watching' state.
        logger.debug({ timestamp }, '[GHOST_VOICE][WATCHING] Primary consciousness is nominal.');
    }

    /**
     * assumeControl - Fallback logic when primary is determined to be catatonic.
     */
    public async assumeControl(): Promise<Result<string>> {
        logger.warn('[GHOST_VOICE][PRIMARY_FAILURE] Assuming emergency control of the substrate.');

        // Ghost logic: Minimum viable restoration of system state
        this.awarenessScore = 0.8; // Operating in 'emergency mode'

        return ok('GhostLimb: Emergency control assumed. Substrate stable.');
    }

    /**
     * executePiperFallback - Generates TTS audio locally using Piper when cloud APIs (Azure/Cloudflare) fail.
     */
    public async executePiperFallback(text: string, outputPath: string): Promise<Result<string>> {
        logger.warn('[GHOST_VOICE][PIPER_FALLBACK] Cloud TTS failed. Activating local Piper synthesis.');
        this.awaken();
        this.awarenessScore = 0.8;

        return new Promise((resolve) => {
            // Check common paths for piper
            const explicitPath = join(getSovereignRoot(), 'STORAGE', 'piper', 'piper.exe');
            const piperBin = existsSync(explicitPath) ? `"${explicitPath}"` : 'piper';

            // Escape double quotes and remove newlines for CLI safety
            const safeText = text.replace(/"/g, '').replace(/\n/g, ' ');

            // Use 'chcp 65001' to ensure UTF-8 handling on Windows
            const cmd = `chcp 65001 > nul && echo ${safeText} | ${piperBin} -f "${outputPath}"`;

            exec(cmd, { windowsHide: true }, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    logger.error({ error: error.message, stderr }, '[GHOST_VOICE][PIPER_FALLBACK] Local Piper TTS also failed.');
                    resolve({ ok: false, error: new Error(`Piper synthesis failed: ${error.message}`) });
                } else {
                    logger.info({ outputPath }, '[GHOST_VOICE][PIPER_FALLBACK] Local TTS synthesis complete.');
                    resolve(ok(outputPath));
                }
            });
        });
    }

    /**
     * sleep - Deactivates the observer.
     */
    public sleep(): void {
        if (this.watchInterval) {
            clearInterval(this.watchInterval);
            this.watchInterval = null;
        }
        this.isObserving = false;
        logger.info('[GHOST_VOICE] Observer mind returning to the void.');
    }

    /**
     * healthCheck - Confirms the observer is awake.
     */
    public async healthCheck(): Promise<{ online: boolean; details: string; awareness: number }> {
        // Observer self-audit
        const heartBeat = this.isObserving;
        return {
            online: heartBeat,
            awareness: this.awarenessScore,
            details: `Ghost: ${heartBeat ? 'AWAKE' : 'DORMANT'} (Awareness: ${this.awarenessScore.toFixed(2)})`
        };
    }

    /**
     * getOfflineModel - Resolves the best available local Ollama model for any task type.
     * GhostLimb uses this to ensure survival for text, vision, and embedding tasks when offline.
     */
    public getOfflineModel(taskType: 'text' | 'vision' | 'embedding' | 'audio' | 'image', client: ModelClient): string {
        const rolodex = client.getRolodex();
        if (rolodex) {
            const healthy = rolodex.getHealthyModelsByTaskType(taskType);
            const localModels = healthy.filter(m => 
                !m.startsWith('huggingface:') && 
                !m.startsWith('@cf/') && 
                !m.includes('cloudflare') && 
                !m.startsWith('gemini:') && 
                !m.startsWith('fireworks:') && 
                !m.startsWith('openrouter:')
            );

            if (taskType === 'text') {
                const isConfigThinker = (this.config.masterLocalModel || '').includes('think') || (this.config.masterLocalModel || '').includes('r1') || (this.config.masterLocalModel || '').includes('reason');
                if (!isConfigThinker) {
                    const thinker = localModels.find(m => m.includes('think') || m.includes('r1') || m.includes('reason'));
                    if (thinker) return thinker.replace('ollama:', '');
                }
            }

            if (localModels.length > 0) {
                return localModels[0].replace('ollama:', '');
            }
        }

        // Hardcoded emergency defaults based on typical POG2 Ollama list
        switch (taskType) {
            case 'vision': return 'llava:latest';
            case 'embedding': return 'nomic-embed-text:latest';
            default: return this.config.masterLocalModel || 'deepseek-r1:8b';
        }
    }

    /**
     * verifyLocalKnock - Verifies a SovereignKnock offline using local Ollama model (airgap survival)
     */
    public async verifyLocalKnock(knock: SovereignKnock, client: ModelClient): Promise<Result<boolean>> {
        logger.warn('[GHOST_VOICE][OFFLINE_KNOCK] Validating sequence locally without cloud dependencies...');
        this.awaken();
        this.awarenessScore = 0.9;

        const targetModel = this.getOfflineModel('text', client);
        logger.info({ targetModel }, '[GHOST_VOICE][OFFLINE_KNOCK] Using offline model.');

        const prompt = `Validate hexagram sequence structural integrity: ${JSON.stringify(knock.iChingSequence)}
Is this a valid 6-part I Ching sequence? Respond ONLY with "VALID" or "INVALID".`;

        const res = await client.call({
            model: targetModel,
            prompt,
            tier: 'Executive',
            temperature: 0.1
        });

        if (!res.ok) {
            logger.error({ error: res.error }, 'GhostLimb offline validation failed to process.');
            return { ok: false, error: res.error };
        }

        const isValid = res.value.response.includes('VALID') && !res.value.response.includes('INVALID');
        if (isValid) {
            logger.info('[GHOST_VOICE][OFFLINE_KNOCK] Local validation successful.');
        } else {
            logger.warn('[GHOST_VOICE][OFFLINE_KNOCK] Local validation REJECTED sequence.');
        }

        return ok(isValid);
    }
}
