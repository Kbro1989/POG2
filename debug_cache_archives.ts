
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader  } = require("./rsmv/src/cache/sqlite.js");
import { createLogger } from './src/utils/logger.js';

const logger = createLogger('CacheAnalysis');

async function main() {
    const loader = new GameCacheLoader('C:/Users/Destiny/Desktop/rsmv_clone/cache');

    // Key Archives for "The Next Level"
    const targets = {
        'Config/Enums': 2,
        'ClientScripts': 12,
        'Sequences (Animations)': 25,
        'SpotAnims (Particles)': 21,
        'Textures': 54,
        'Materials': 55,
        'SkeletalAnimations': 57
    };

    logger.info('Analyzing Untapped Cognitive Layers in RS3 Cache');

    for (const [name, archId] of Object.entries(targets)) {
        try {
            const index = await loader.getCacheIndex(Number(archId));
            const files = Array.isArray(index) ? index.length : 0;
            logger.info({ name, archId, files }, 'Layer Found');
        } catch (e) {
            logger.warn({ name, archId }, 'Layer not accessible or empty');
        }
    }

    loader.close();
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
