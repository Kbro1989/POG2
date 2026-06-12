import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    console.log("Searching Major 12 (ClientScripts) for 'Necromancy'...");
    const index12 = await cache.getIndexFile(12);
    
    for (const entry of index12) {
        if (!entry) continue;
        try {
            const buf = await cache.getFile(12, entry.minor);
            const text = buf.toString('utf8');
            if (text.includes('Necromancy')) {
                console.log(`Found 'Necromancy' in ClientScript ${entry.minor}`);
                // Extract strings from the script
                const strings = buf.toString('utf8').match(/[A-Z][a-z]{3,20}/g);
                if (strings) {
                    console.log(`  Strings: ${[...new Set(strings)].join(', ')}`);
                }
            }
        } catch (e) {}
    }
}

main().catch(console.error);
