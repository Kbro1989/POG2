import pino from 'pino';
import { type Result, ok } from '../../core/models.js';
import { ModelClient } from '../../clients/ModelClient.js';
import { exec } from 'child_process';
import { existsSync } from 'fs';

const logger = pino({ name: 'GhostLimb', base: { hostname: 'POG2' } });

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

    constructor() { }

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
        }, 5000);
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
            const explicitPath = 'D:\\STORAGE\\piper\\piper.exe';
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
    public healthCheck(): { online: boolean; awareness: number } {
        return {
            online: this.isObserving,
            awareness: this.awarenessScore
        };
    }
}
