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
    const searchBufferCaseInsensitive = Buffer.from(searchStr.toLowerCase(), 'utf8');

    // Focus on majors likely to contain names
    const majors = [16, 17, 18, 19, 21, 22, 24, 25, 40, 41];

    console.log(`Searching for "${searchStr}" in Majors: ${majors.join(', ')}...`);

    for (const major of majors) {
        try {
            const indices = await cache.getCacheIndex(major);
            console.log(`Checking Major ${major} (${indices.length} entries)...`);

            for (const index of indices) {
                if (!index) continue;
                try {
                    const data = await cache.getFile(major, index.minor);
                    if (data.includes(searchBuffer) || data.includes(searchBufferCaseInsensitive)) {
                        console.log(`MATCH FOUND in Major ${major}, Minor ${index.minor}`);
                        // Dump surrounding bytes
                        const offset = data.indexOf(searchBuffer);
                        console.log('Context:', data.slice(Math.max(0, offset - 20), Math.min(data.length, offset + 40)).toString('hex'));
                        console.log('Context (ASCII):', data.slice(Math.max(0, offset - 20), Math.min(data.length, offset + 40)).toString('utf8'));
                    }
                } catch (e) {
                    // Skip
                }
            }
        } catch (e) {
            console.error(`Failed to read Major ${major}`);
        }
    }

    console.log('Search complete.');
    cache.close();
}

main().catch(console.error);
