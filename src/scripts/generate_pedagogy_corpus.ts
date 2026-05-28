/**
 * generate_pedagogy_corpus.ts
 *
 * Sovereignty Grounding Pipeline: Corpus Generation.
 *
 * This script scales the production of a high-fidelity dataset of [VERIFIED] entities
 * by iterating through the full RS3 cache dumps. It implements a two-track enrichment
 * strategy to preserve structural IDs while optimizing for API rate limits.
 *
 * Target: D:\sovereign\memory\pedagogy\corpus\verified_entities.jsonl
 */

import { WikiEquipmentEnricher } from '../utils/WikiEquipmentEnricher.js';
import { resolveSovereignPath } from '../utils/SovereignPathResolver.js';
import { writeFileSync, mkdirSync, existsSync, readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { createLogger } from '../utils/logger.js';
import { SubstrateManifestRegistry, EntityType } from '../core/SubstrateManifestRegistry.js';
import { SovereignSubstrate } from '../utils/SovereignSubstrate.js';

const logger = createLogger('CorpusGenerator');

// ═══════════════════════════════════════════════════════
// Configuration
// ═══════════════════════════════════════════════════════

const CATALOG_PATHS = {
    items: 'D:/D-sovereign-/cache_pedagogy/json_dumps/items.json',
    npcs: 'D:/D-sovereign-/cache_pedagogy/json_dumps/npcs.json',
    objects: 'D:/D-sovereign-/cache_pedagogy/json_dumps/objects.json'
};

function loadProgress(): any {
    const PROGRESS_FILE_PATH = resolveSovereignPath('memory/pedagogy/corpus/.progress');
    if (existsSync(PROGRESS_FILE_PATH)) {
        try {
            return JSON.parse(readFileSync(PROGRESS_FILE_PATH, 'utf8'));
        } catch {
            logger.warn('Progress file corrupted.');
        }
    }
    return {
        items: { lastIndex: 0 },
        npcs: { lastIndex: 0 },
        objects: { lastIndex: 0 }
    };
}

function saveProgress(state: any): void {
    const PROGRESS_FILE_PATH = resolveSovereignPath('memory/pedagogy/corpus/.progress');
    writeFileSync(PROGRESS_FILE_PATH, JSON.stringify(state, null, 2), 'utf8');
}

function formatVerifiedOutput(name: string, id: number, data: any): string {
    return JSON.stringify(data);
}

async function processEntityType(type: EntityType, enricher: any, OUTPUT_FILE: string, progress: any) {
    const config = SubstrateManifestRegistry[type];
    const rawEntities = JSON.parse(readFileSync(CATALOG_PATHS[config.idSet as keyof typeof CATALOG_PATHS], 'utf8'));
    
    if (!progress[config.idSet]) progress[config.idSet] = { lastIndex: 0 };
    
    logger.info({ type, count: rawEntities.length }, `Processing ${type} catalog...`);

    for (let i = progress[config.idSet].lastIndex; i < rawEntities.length; i++) {
        const entity = rawEntities[i];
        
        // 1. Dynamic extraction via SubstrateForensics
        const cacheData = await SovereignSubstrate.extractEntityData(config.probeScript, entity.id);
        
        // 2. Semantic grounding
        const semanticData = await enricher.enrichEntity(entity.name);

        const entry = {
            type,
            cacheId: entity.id,
            name: entity.name,
            instruction: `Generate definition for ${type} ${entity.name}`,
            input: JSON.stringify({ cache: cacheData, semantic: semanticData }),
            output: formatVerifiedOutput(entity.name, entity.id, semanticData),
            tags: [`[SUBSTRATE_VERIFIED]`, `[${type}]`],
            verified: !!semanticData
        };

        appendFileSync(OUTPUT_FILE, JSON.stringify(entry) + '\n', 'utf8');
        
        progress[config.idSet].lastIndex = i + 1;
        if (i % 10 === 0) saveProgress(progress);
    }
}

async function runGenerator() {
    const progress = loadProgress();
    const enricher = WikiEquipmentEnricher.getInstance();
    const OUTPUT_FILE = resolveSovereignPath('memory/pedagogy/corpus/verified_entities.jsonl');
    
    // Process all entity types dynamically
    for (const type of Object.keys(SubstrateManifestRegistry) as EntityType[]) {
        await processEntityType(type, enricher, OUTPUT_FILE, progress);
    }
    
    saveProgress(progress);
}

runGenerator().catch(err => {
    logger.error({ error: err.message }, 'Corpus generation failed.');
    process.exit(1);
});
