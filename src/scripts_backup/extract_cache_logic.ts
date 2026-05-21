import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require("../../tmp_rsmv_inspect/src/cache/sqlite.js");
import * as fs from 'fs';
import { join } from 'path';

/**
 * extract_cache_logic.ts
 * 
 * Deep Categorized Authoritative Scanner for Phase 259.
 * Separates findings into items, function calls (scripts), npcs, world objects, 
 * locations, and specific varbit/config classes.
 */
async function main() {
    const cachePath = 'C:\\ProgramData\\Jagex\\RuneScape';
    const cache = new GameCacheLoader(cachePath);
    const keywords = [
        'admin', 'console', 'command', 'gaited', 'dummy', 'script', 'prompt',
        'trigger', 'event', 'callback', 'onTick', 'onAction', 'interact', 'invoke',
        'roll', 'rolls'
    ];
    const searchBuffers = keywords.map(k => Buffer.from(k, 'utf8'));

    console.log(`ðŸš€ Starting Deep Categorized Authoritative Cache Scan of ${cachePath}...`);

    // Major 2 Sub-Archive Mapping (Categorization within Config Major)
    const configMap: Record<number, string> = {
        1: 'enum',
        3: 'world_object',
        5: 'npc',
        6: 'item',
        10: 'npc',
        12: 'world_object',
        14: 'item',
        26: 'struct',
        69: 'varbit_class'
    };

    const findings: Record<string, any[]> = {
        item: [],
        npc: [],
        world_object: [],
        location: [],
        function_call: [],
        varbit_class: [],
        struct: [],
        enum: [],
        spotanim_gfx: [],
        other: []
    };

    const scanMajors = [2, 5, 12, 17, 18, 19, 21];
    let totalMatchCount = 0;

    for (const major of scanMajors) {
        try {
            const indices = await cache.getCacheIndex(major);
            console.log(`ðŸ” Scanning Major ${major} (${indices.length} archives)...`);

            for (const index of indices) {
                if (!index) continue;
                try {
                    const file = await cache.getFile(major, index.minor);
                    if (!file) continue;

                    // Determine Category
                    let category = 'other';
                    if (major === 19 || major === 11) category = 'item';
                    else if (major === 18) category = 'npc';
                    else if (major === 17 || major === 16) category = 'world_object';
                    else if (major === 5) category = 'location';
                    else if (major === 12) category = 'function_call';
                    else if (major === 21) category = 'spotanim_gfx';
                    else if (major === 2) {
                        category = configMap[index.minor] || 'varbit_class';
                    }

                    for (let i = 0; i < keywords.length; i++) {
                        if (file.includes(searchBuffers[i])) {
                            const offset = file.indexOf(searchBuffers[i]);
                            const context = file.slice(Math.max(0, offset - 40), Math.min(file.length, offset + 80)).toString('utf8').replace(/[\r\n\t]/g, ' ');

                            findings[category].push({
                                major,
                                archive: index.minor,
                                keyword: keywords[i],
                                context
                            });
                            totalMatchCount++;
                        }
                    }
                } catch (e) {
                    // Skip
                }
            }
        } catch (e) {
            console.error(`âš ï¸ Failed to read Major ${major}`);
        }
    }

    const outputPath = 'D:/sovereign/atlas/system/cache_logic_mapping.json';
    const outputDir = 'D:/sovereign/atlas/system';
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    fs.writeFileSync(outputPath, JSON.stringify(findings, null, 2));
    console.log(`\nðŸ Deep Categorized Scan complete. ${totalMatchCount} total nodes crystallized to ${outputPath}.`);
    cache.close();
}

main().catch(console.error);
