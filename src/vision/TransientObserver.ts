import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { join } from 'path';
import { createLogger } from '../utils/logger.js';
import { WikiEnricher } from '../utils/WikiEnricher.js';
import { getRSMVCachePath, getRSMVSubstratePath } from '../utils/SovereignPathResolver.js';
import type { Result, PedagogyProfile } from '../core/models.js';

const logger = createLogger('TransientObserver');

/**
 * TransientObserver — Coordinates the "Observe -> Distill -> Purge" pedagogy loop.
 */
export class TransientObserver {

    /**
     * Study a professional asset to learn its production norms.
     */
    public async study(modelId: string): Promise<Result<PedagogyProfile>> {
        logger.info({ modelId }, 'Starting production pedagogy study');

        try {
            // 1. Semantic Enrichment (Wiki)
            // Extract a name hint from the ID if possible (e.g., npc:0 -> Hans mapping)
            const nameHint = modelId === 'npc:0' ? 'Hans' : 'unknown';
            const wikiResult = await WikiEnricher.enrich(nameHint);
            if (!wikiResult.ok) return { ok: false, error: wikiResult.error };

            // 2. Headless Rendering & Analysis
            const cachePath = getRSMVCachePath();
            const pedagogyProfilePath = join(process.cwd(), 'pedagogy_profile.json');
            const wikiContextPath = join(process.cwd(), 'wiki_context.json');

            // Write wiki context to file to avoid shell escaping issues
            await fs.writeFile(wikiContextPath, JSON.stringify(wikiResult.value));

            // Spawn headless CLI with --analyze and --wiki (as file path)
            const npxCmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
            const subprocess = spawn(npxCmd, [
                'tsx', join(getRSMVSubstratePath(), 'src', 'headless', 'cli.ts'),
                '--model', modelId,
                '--source', `cache:${cachePath}`,
                '--analyze',
                '--wiki', 'wiki_context.json'
            ], {
                shell: true,
                env: { ...process.env, POG_RSMV_CACHE_DIR: cachePath }
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

            // 4. Cleanup (The Purge)
            await this.cleanup();

            logger.info({ modelId, polyCount: profile.metrics.polyCount }, 'Pedagogy study complete');
            return { ok: true, value: profile };

        } catch (err) {
            logger.error({ err, modelId }, 'Pedagogy study failed');
            return { ok: false, error: err as Error };
        }
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
