import { GameCacheLoader } from './tmp_rsmv_inspect/src/cache/sqlite.js';
import * as fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
(global as any).__non_webpack_require__ = require;

async function main() {
    const cachePath = 'C:\\ProgramData\\Jagex\\RuneScape';
    const cache = new GameCacheLoader(cachePath);

    const searchStr = 'Pick Of Gods';
    const searchBuffer = Buffer.from(searchStr, 'utf8');

    console.log(`Searching for "${searchStr}" in Major 2...`);

    try {
        const indices = await cache.getCacheIndex(2);
        console.log(`Checking Major 2 (${indices.length} archives)...`);

        for (const index of indices) {
            if (!index) continue;
            try {
                const archive = await cache.getArchiveById(2, index.minor);
                for (const file of archive) {
                    if (file.buffer.includes(searchBuffer)) {
                        console.log(`MATCH FOUND in Major 2, Archive ${index.minor}, File ${file.fileid}`);
                        const offset = file.buffer.indexOf(searchBuffer);
                        console.log('Context (ASCII):', file.buffer.slice(Math.max(0, offset - 20), Math.min(file.buffer.length, offset + 40)).toString('utf8'));
                    }
                }
            } catch (e) {
                // Skip
            }
        }
    } catch (e) {
        console.error(`Failed to read Major 2`);
    }

    console.log('Search complete.');
    cache.close();
}

main().catch(console.error);
