import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    console.log("Scanning DBRows (2:41) for 'Necromancy' and friends...");
    const archive41 = await cache.getArchiveById(2, 41);
    
    for (const sub of archive41) {
        const text = sub.buffer.toString('utf8');
        if (text.includes('Necromancy')) {
            console.log(`Found 'Necromancy' in DBRow ${sub.fileid}`);
            // Find all strings in this buffer
            const strings = sub.buffer.toString('utf8').match(/[A-Z][a-z]{3,20}/g);
            if (strings) {
                console.log(`  Strings: ${[...new Set(strings)].join(', ')}`);
            }
        }
    }
}

main().catch(console.error);
