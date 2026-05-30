import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { BestiaryApi } from "../../../src/utils/BestiaryApi.js";
import { EntityNormalizer } from "../../../src/utils/EntityNormalizer.js";

/**
 * IDCentricEnricher
 * 
 * Performs API-authoritative enrichment:
 * 1. Resolve ID to Cache Metadata.
 * 2. Fetch authoritative stats from RS3 API (Bestiary/GE).
 * 3. Enrich entity record.
 */
async function run() {
    const entityTypes = ['npc', 'item', 'object'];
    const outputDir = join(process.cwd(), "rsmv_inspector", "generated", "enriched");

    for (const type of entityTypes) {
        const filePath = join(outputDir, `${type}_enriched.json`);
        if (!existsSync(filePath)) continue;

        console.log(`Enriching ${type} via API-Authoritative lookup...`);
        const entities = JSON.parse(readFileSync(filePath, 'utf8'));

        for (const [id, entity] of Object.entries(entities) as [string, any]) {
            // Idempotency: Skip if already enriched
            if (entity.pog2_api_metadata) continue;

            const entityId = parseInt(id);
            
            // 1. Authoritative API lookup (No Scraping)
            let rawApiData: any = null;
            if (type === 'npc') {
                rawApiData = await BestiaryApi.getBeastData(entityId);
            }

            if (rawApiData) {
                // 2. Normalize and merge API metadata
                entity.pog2_api_metadata = EntityNormalizer.normalizeNpc(rawApiData);
                entity.pog2_provenance = "RS3_LIVE_API";
                
                // Keep the original name if API name differs slightly
                if (!entity.name) entity.name = entity.pog2_api_metadata.name;
                
                // Wiki URL
                entity.wiki_url = `https://runescape.wiki/w/${encodeURIComponent(entity.name.replace(/ /g, '_'))}`;
            }
        }

        writeFileSync(filePath, JSON.stringify(entities, null, 2));
        console.log(`${type} API enrichment complete.`);
    }
}

run().catch(console.error);
