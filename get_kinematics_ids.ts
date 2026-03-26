import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader  } = require("./rsmv/src/cache/sqlite.js");
const { cacheMajors  } = require("./rsmv/src/constants.js");



async function main() {
    const loader = new GameCacheLoader('C:/ProgramData/Jagex/RuneScape');
    try {
        const index = await loader.getCacheIndex(cacheMajors.sequences);
        if (Array.isArray(index)) {
            console.log(`Found ${index.length} Sequences in Archive 25.`);
            const validIds = index.map(i => i.minor);
            console.log(`Sample IDs: ${validIds.slice(0, 20).join(', ')}...`);
        } else {
            console.log('Archive 25 index is not an array.');
        }
    } catch (e) {
        console.error('Failed to read Archive 25 index:', e);
    } finally {
        loader.close();
    }
}

main();
