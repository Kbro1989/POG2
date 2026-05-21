import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    const indicesToSearch = [2, 17, 39, 41]; // config, enums, structs (if not in config), dbrows
    
    for (const indexId of indicesToSearch) {
        console.log(`Searching index ${indexId}...`);
        try {
            const indexFile = await cache.getIndexFile(indexId);
            for (const entry of indexFile) {
                if (!entry) continue;
                try {
                    const buf = await cache.getFile(indexId, entry.minor);
                    const text = buf.toString('utf8');
                    // Find if it has Necromancy and something else, OR if it has a list of skills
                    if (text.includes('Necromancy') || text.includes('necromancy')) {
                        if (text.includes('Woodcutting') || text.includes('Mining') || text.includes('Attack') || text.includes('Divination')) {
                            console.log(`Found match in Index ${indexId}, Archive ${entry.minor}!`);
                            // Print the strings from it
                            let strings = text.match(/[A-Z][a-z]{2,20}/g);
                            if (strings) {
                                // Deduplicate
                                strings = [...new Set(strings)];
                                console.log(strings.join(', '));
                            }
                        }
                    }
                } catch(e) {}
            }
        } catch(e) {}
    }
}

main().catch(console.error);
