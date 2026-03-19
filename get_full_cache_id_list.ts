import { GameCacheLoader } from './tmp_rsmv_inspect/src/cache/sqlite.js';
import { parse } from './tmp_rsmv_inspect/src/opdecoder.js';
import * as fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
(global as any).__non_webpack_require__ = require;

async function main() {
    const cachePath = 'C:\\ProgramData\\Jagex\\RuneScape';
    const cache = new GameCacheLoader(cachePath);
    (cache as any).buildnr = 940;

    const tasks = [
        { major: 18, name: 'npcs', parser: parse.npc, archSize: 128 },
        { major: 19, name: 'items', parser: parse.item, archSize: 256 },
        { major: 16, name: 'objects', parser: parse.object, archSize: 256 }
    ];

    for (const task of tasks) {
        console.log(`--- EXPORTING ${task.name.toUpperCase()} (MAJOR ${task.major}) ---`);
        const results: { id: number, name: string }[] = [];
        
        try {
            const indices = await cache.getCacheIndex(task.major);
            console.log(`Found ${indices.length} archives in Major ${task.major}.`);

            for (const index of indices) {
                if (!index) continue;
                try {
                    const archive = await cache.getArchiveById(task.major, index.minor);
                    if (archive.length === 0) {
                        // console.log(`Archive ${index.minor} is empty.`);
                    }
                    for (const file of archive) {
                        const id = index.minor * task.archSize + file.fileid;
                        try {
                            const parsed = task.parser.read(file.buffer, cache);
                            const name = (parsed as any).name || `${task.name.toUpperCase()} ${id}`;
                            results.push({ id, name });
                            
                            if (results.length <= 5) {
                                console.log(`SUCCESS: Parsed ${task.name} ${id} -> ${name}`);
                            }
                        } catch (e) {
                            if (results.length <= 5) {
                                console.error(`FAILED: Parse error for ${task.name} ${id}:`, (e as any).message);
                            }
                        }
                    }
                    if (index.minor % 20 === 0 && results.length > 0) {
                        console.log(`Processed archive ${index.minor}... (Current Total: ${results.length})`);
                    }
                } catch (e) {
                    // Skip read errors
                }
            }
        } catch (e) {
            console.error(`Failed to read Major ${task.major}`);
        }

        fs.writeFileSync(`${task.name}.json`, JSON.stringify(results, null, 2));
        console.log(`Saved ${results.length} entries to ${task.name}.json`);
    }

    cache.close();
    console.log('DONE.');
}

main().catch(console.error);
