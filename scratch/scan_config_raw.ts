import * as path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/rsmv_inspector/src/cache/sqlite.ts');

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    console.log("Deep Scanning Major 2 (Config) for 'Necromancy'...");
    const index2 = await cache.getIndexFile(2);
    
    for (const entry of index2) {
        if (!entry) continue;
        try {
            const archive = await cache.getArchiveById(2, entry.minor);
            for (const sub of archive) {
                const text = sub.buffer.toString('utf8');
                if (text.includes('Necromancy')) {
                    console.log(`Found 'Necromancy' in Archive 2:${entry.minor} Subfile ${sub.fileid}`);
                    const strings = sub.buffer.toString('utf8').match(/[A-Z][a-z]{3,20}/g);
                    if (strings) {
                        console.log(`  Strings: ${[...new Set(strings)].join(', ')}`);
                    }
                }
            }
        } catch (e) {}
    }
}

main().catch(console.error);
