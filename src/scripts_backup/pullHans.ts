import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { rsmvController } from '../vision/rsmvController.js';
import { createLogger } from '../utils/logger.js';
import { existsSync } from 'fs';
import path, { join } from 'path';
import { getSovereignRoot } from '../utils/SovereignPathResolver.js';

const logger = createLogger('PullHans');

/**
 * Script to verify NPC pull from Jagex cache.
 * Targets 'Hans' (NPC ID 0) as a verification case.
 * 
 * NOTE: User provided CSS context for mapping:
 * .promptbox{font-family:"Microsoft New Tai Lue"...}
 */
async function run() {
    logger.info('Commencing NPC Pull Verification: Hans (NPC ID 0)');

    // Cleanup previous attempts to ensure fresh verification
    const outputs = ['model.png', 'model.glb'];
    for (const f of outputs) {
        const p = path.resolve(f);
        if (existsSync(p)) {
            import('fs').then(fs => fs.unlinkSync(p));
            logger.info({ file: f }, 'Cleaned previous output');
        }
    }

    const rsmvDir = join(getSovereignRoot(), 'cache_pedagogy', 'rsmv_inspector');
    const controller = rsmvController.getInstance();
    const modelId = 'npc:0'; // Hans

    try {
        const result = await controller.viewModel(modelId);

        if (result.ok) {
            logger.info('rsmv pull triggered successfully. Waiting for output...');

            // Subprocess is spawn'd with inherit, so it should be fast. 
            // We wait up to 10s for the file to appear.
            let found = false;
            for (let i = 0; i < 20; i++) {
                await new Promise(resolve => setTimeout(resolve, 500));
                if (existsSync(path.resolve('model.png')) && existsSync(path.resolve('model.glb'))) {
                    found = true;
                    break;
                }
            }

            const pngPath = path.resolve('model.png');
            const glbPath = path.resolve('model.glb');

            if (found) {
                logger.info({ pngPath, glbPath }, 'SUCCESS: Hans NPC pulled from cache.');
            } else {
                logger.warn('Verification failed: Files did not appear within timeout.');
            }
        } else {
            logger.error({ err: result.error }, 'NPC pull failed.');
        }
    } catch (err) {
        logger.error({ err }, 'PullHans script encountered an error');
    }
}

run().catch(console.error);

