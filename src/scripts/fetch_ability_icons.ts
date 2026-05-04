import { WikiEnricher } from '../utils/WikiEnricher.js';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { resolveSovereignPath } from '../utils/SovereignPathResolver.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('IconFetcher');

async function run() {
    const registryPath = 'D:/sovereign/memory/pedagogy/sovereign_ability_registry.json';
    const registryText = readFileSync(registryPath, 'utf8');
    const registry = JSON.parse(registryText);

    if (!registry.abilities) {
        logger.error(`No abilities found in registry! Keys: ${Object.keys(registry).join(', ')}`);
        return;
    }

    logger.info(`Fetching icons for ${Object.keys(registry.abilities).length} abilities...`);

    let updated = 0;
    for (const [id, ability] of Object.entries(registry.abilities) as [string, any][]) {
        if (!ability.iconUrl) {
            try {
                // The wiki title for abilities is usually just the name, but sometimes it has " (ability)" appended.
                // WikiEnricher handles searching for the best match.
                const res = await WikiEnricher.enrich(id);
                if (res.ok && res.value.imageUrl) {
                    ability.iconUrl = res.value.imageUrl;
                    updated++;
                    logger.info(`[${updated}] Found icon for ${id}: ${ability.iconUrl}`);
                    
                    // Save every 10 updates to not lose progress
                    if (updated % 10 === 0) {
                        writeFileSync(registryPath, JSON.stringify(registry, null, 2));
                    }
                } else if (res.ok && !res.value.imageUrl) {
                     // Try with " (ability)" suffix
                     const res2 = await WikiEnricher.enrich(`${id} (ability)`);
                     if (res2.ok && res2.value.imageUrl) {
                         ability.iconUrl = res2.value.imageUrl;
                         updated++;
                         logger.info(`[${updated}] Found icon for ${id} (with suffix): ${ability.iconUrl}`);
                         if (updated % 10 === 0) writeFileSync(registryPath, JSON.stringify(registry, null, 2));
                     } else {
                         logger.warn(`No image found for ${id}`);
                     }
                }
            } catch (err) {
                logger.warn(`Failed to fetch icon for ${id}`);
            }
        }
    }

    writeFileSync(registryPath, JSON.stringify(registry, null, 2));
    logger.info(`Finished fetching icons. Updated ${updated} abilities.`);
}

run().catch(console.error);
