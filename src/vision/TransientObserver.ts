import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { createLogger } from '../utils/logger.js';
import { WikiEnricher } from '../utils/WikiEnricher.js';
import { getrsmvCachePath, getrsmvSubstratePath } from '../utils/SovereignPathResolver.js';
import type { Result, PedagogyProfile } from '../core/models.js';

const logger = createLogger('TransientObserver');

/**
 * TransientObserver â€” Coordinates the "Observe -> Distill -> Purge" pedagogy loop.
 */
export class TransientObserver {
    private static instance: TransientObserver | undefined;
    private eye: any = null;
    private lastCaptureTime = 0;
    private lastCaptureResult: any = null;
    private static readonly CAPTURE_THROTTLE_MS = 5000; // Live vision loop cadence

    public static getInstance(): TransientObserver {
        if (!this.instance) {
            this.instance = new TransientObserver();
        }
        return this.instance;
    }

    private constructor() { }

    /**
     * Study a professional asset to learn its production norms.
     */
    public async study(modelId: string): Promise<Result<PedagogyProfile>> {
        logger.info({ modelId }, 'Starting production pedagogy study');

        try {
            // 1. Semantic Enrichment (Wiki)
            // Extract a name hint from the ID if possible (e.g., npc:0 -> Hans mapping)
            // In a real scenario, this would use a Cache-to-Lore mapping table.
            const nameHint = modelId === 'npc:0' ? 'Hans' : (modelId.startsWith('npc:') ? 'NPC' : 'unknown');
            const wikiResult = await WikiEnricher.enrich(nameHint);

            // 2. Headless Rendering & Analysis
            const cachePath = getrsmvCachePath();
            const pedagogyProfilePath = join(process.cwd(), 'pedagogy_profile.json');
            const wikiContextPath = join(process.cwd(), 'wiki_context.json');

            // Write wiki context to file to avoid shell escaping issues
            if (wikiResult.ok) {
                await fs.writeFile(wikiContextPath, JSON.stringify(wikiResult.value));
            }

            // Spawn headless CLI with --analyze and --wiki (as file path)
            const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
            const subprocess = spawn(npxCmd, [
                'tsx', join(getrsmvSubstratePath(), 'src', 'headless', 'cli.ts'),
                '--model', modelId,
                '--source', `cache:${cachePath}`,
                '--analyze',
                ...(wikiResult.ok ? ['--wiki', 'wiki_context.json'] : [])
            ], {
                shell: true,
                env: { ...process.env, POG_rsmv_CACHE_DIR: cachePath }
            });

            let output = '';
            subprocess.stdout?.on('data', d => output += d);
            subprocess.stderr?.on('data', d => output += d);

            await new Promise((resolve, reject) => {
                subprocess.on('exit', (code) => {
                    if (code === 0) resolve(true);
                    else {
                        logger.error({ code, output }, 'Headless analysis subprocess failed');
                        reject(new Error(`Headless analysis failed with code ${code}`));
                    }
                });
            });

            // 3. Ingest Distilled Wisdom
            const profileData = await fs.readFile(pedagogyProfilePath, 'utf8');
            const profile = JSON.parse(profileData) as PedagogyProfile;

            // 4. Final Semantic Fusion (Fusion Layer)
            if (wikiResult.ok) {
                const lore = wikiResult.value;
                (profile.semantics as any).loreExtract = lore.intent;
                (profile.semantics as any).wikiVariables = lore.variables;
                if (lore.race) (profile.semantics as any).race = lore.race;

                // Extract combat level from variables if present
                if (lore.variables?.combat) {
                    (profile.metrics as any).combatLevel = parseInt(lore.variables.combat);
                }
            }

            // 5. Cleanup (The Purge)
            await this.cleanup();

            logger.info({ modelId, polyCount: profile.metrics.polyCount, combatLevel: (profile.metrics as any).combatLevel }, 'Pedagogy study complete');
            return { ok: true, value: profile };

        } catch (err) {
            logger.error({ err, modelId }, 'Pedagogy study failed');
            return { ok: false, error: err as Error };
        }
    }

    /**
     * Observe: A real-time perceptual probe that combines pixel sampling with semantic context.
     * This is the "Live" version of Study.
     */
    public async observe(targetName: string, imagePath: string): Promise<Result<any>> {
        logger.info({ targetName }, 'Initiating real-time chromatic observation');

        // 1. Live Vision Loop — reuse singleton eye, throttle captures
        let activePath = imagePath;
        const now = Date.now();
        if (imagePath === 'latest_frame.png') {
            // Throttle: skip capture if within cadence window and we have a cached result
            if (this.lastCaptureResult && (now - this.lastCaptureTime) < TransientObserver.CAPTURE_THROTTLE_MS) {
                activePath = this.lastCaptureResult;
            } else {
                // Reuse singleton eye (never allocate a new one per tick)
                if (!this.eye) {
                    this.eye = new (require('../utils/SovereignEye.js')).SovereignEye('live-vision-loop');
                }
                const port = (require('../monitor/SwitchboardLimb.js')).SwitchboardLimb.getInstance().getActivePort() || 8788;
                const captureRes = await this.eye.capture({ type: 'url', target: `http://localhost:${port}/edge_radar.html` });
                if (captureRes.ok && captureRes.value.imagePath) {
                    activePath = captureRes.value.imagePath;
                    this.lastCaptureResult = activePath;
                    this.lastCaptureTime = now;
                    // Copy to bridge
                    const { copyFileSync } = require('fs');
                    copyFileSync(activePath, 'latest_frame.png');
                }
            }
        }

        // 2. Get Wiki Ground Truth
        const wikiRes = await WikiEnricher.enrich(targetName);
        const expectedPalette: string[] = [];

        if (wikiRes.ok && wikiRes.value.variables) {
            const vars = wikiRes.value.variables;
            if (vars.hex1) expectedPalette.push(vars.hex1);
            if (vars.hex2) expectedPalette.push(vars.hex2);
            if (vars.color) expectedPalette.push(vars.color);
        }

        return {
            ok: true,
            value: {
                name: targetName,
                imagePath: activePath,
                wikiLore: wikiRes.ok ? wikiRes.value.intent : 'Unknown',
                expectedPalette,
                timestamp: Date.now()
            }
        };
    }

    /**
     * Delete temporary render and analysis artifacts.
     */
    private async cleanup() {
        const files = ['model.png', 'model.glb', 'pedagogy_profile.json', 'wiki_context.json'];
        for (const file of files) {
            try {
                await fs.unlink(join(process.cwd(), file));
            } catch (e) {
                // Ignore missing files
            }
        }
    }
}

