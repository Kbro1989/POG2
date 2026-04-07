import { CacheForensicsLimb } from '../limbs/spatial/CacheForensicsLimb.js';
import { WorldGroundingLimb } from '../limbs/world_grounding/WorldGroundingLimb.js';
import { createLogger } from '../utils/logger.js';
import { readdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const logger = createLogger('GroundingSweep');

/**
 * grounding_sweep.ts
 * 
 * Automates the grounding of all pedagogical "vibes" into cache-authoritative truth.
 */
async function main() {
    logger.info('ðŸ§¹ Starting Full-Substrate Grounding Sweep...');

    const forensics = CacheForensicsLimb.getInstance();
    const grounding = WorldGroundingLimb.getInstance();
    const pedagogyDir = 'D:/sovereign/memory/pedagogy';

    if (!existsSync(pedagogyDir)) {
        logger.error(`Pedagogy directory not found: ${pedagogyDir}`);
        process.exit(1);
    }

    const manifestsDir = join(pedagogyDir, 'manifests');
    const scanDirs = [pedagogyDir, manifestsDir];

    let processed = 0;
    let groundedCount = 0;
    let deltaCount = 0;

    for (const dir of scanDirs) {
        if (!existsSync(dir)) continue;
        const files = readdirSync(dir);
        logger.info({ dir, totalFiles: files.length }, 'Scanning pedagogy substrate...');
        
        for (const file of files) {
            if (!file.endsWith('.json')) continue;

            let entityId: string | null = null;
            let id: number | null = null;
            let type: 'npc' | 'item' | 'object' | null = null;

            if (file.startsWith('NPC_')) {
                id = parseInt(file.replace('NPC_', '').replace('.json', ''));
                type = 'npc';
                entityId = `npc_${id}`;
            } else if (file.startsWith('ITEM_ITEM_')) {
                id = parseInt(file.replace('ITEM_ITEM_', '').replace('.json', ''));
                type = 'item';
                entityId = `item_${id}`;
            } else if (file.startsWith('OBJ_')) {
                id = parseInt(file.replace('OBJ_', '').replace('.json', ''));
                type = 'object';
                entityId = `object_${id}`;
            } else if (file.startsWith('OBJECT_')) {
                id = parseInt(file.replace('OBJECT_', '').replace('.json', ''));
                type = 'object';
                entityId = `object_${id}`;
            }

            if (entityId && !isNaN(id as any) && type) {
                processed++;
                try {
                    let result;
                    if (type === 'npc') result = await forensics.getNpcDetails(id as number);
                    else if (type === 'item') result = await forensics.getItemDetails(id as number);
                    else result = await forensics.getObjectDetails(id as number);

                    if (result.ok) {
                        const data = result.value;
                        const deltas = [];

                        // Heuristic Delta Detection: Compare Pedagogy vs Forensics names
                        const pedagogy = (data as any).pedagogy;
                        const forensicsData = (data as any).forensics;

                        if (pedagogy && forensicsData && pedagogy.summary !== forensicsData.name) {
                            deltas.push({
                                path: '$.name',
                                original: pedagogy.summary || pedagogy.name,
                                grounded: forensicsData.name,
                                reason: 'Cache-authoritative naming override'
                            });
                        }

                        // Record the grounding
                        await grounding.record(entityId, {
                            pedigree: join(dir, file),
                            authorityLevel: 'ABSOLUTE',
                            grounded: {
                                timestamp: Date.now(),
                                confidence: 1.0,
                                authoritativeSource: 'CACHE',
                                data: forensicsData
                            },
                            deltas
                        });

                        groundedCount++;
                        deltaCount += deltas.length;
                    }
                } catch (err: any) {
                    logger.error({ entityId, err: err.message }, 'Failed to ground entity');
                }
            }
        }
    }

    logger.info({
        processed,
        groundedCount,
        deltaCount,
        manifestSize: Object.keys(grounding.getManifest().entities).length
    }, 'ðŸ Grounding Sweep Complete.');
}

main().catch(err => {
    logger.error({ err }, 'Sweep failed');
    process.exit(1);
});
