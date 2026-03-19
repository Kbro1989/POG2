import { GameCacheLoader } from './tmp_rsmv_inspect/src/cache/sqlite.js';
import { cacheMajors } from './tmp_rsmv_inspect/src/constants.js';

async function main() {
    const loader = new GameCacheLoader('C:/ProgramData/Jagex/RuneScape');
    try {
        const index = await loader.getCacheIndex(cacheMajors.spotanims);
        if (Array.isArray(index)) {
            console.log(`Found ${index.length} SpotAnims in Archive 21.`);
            const validIds = index.map(i => i.minor);
            console.log(`Sample IDs: ${validIds.slice(0, 20).join(', ')}...`);
        } else {
            console.log('Archive 21 index is not an array.');
        }
    } catch (e) {
        console.error('Failed to read Archive 21 index:', e);
    } finally {
        loader.close();
    }
}

main();
