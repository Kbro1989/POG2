import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

/**
 * RegionalEnricher
 * 
 * Maps entities (NPCs, Objects) to Map Zones (Regions).
 * Integrates spatial grounding into the simulation substrate.
 */
async function run() {
    const outputDir = join(process.cwd(), "rsmv_inspector", "generated", "enriched");
    const mapZonesPath = join(process.cwd(), "rsmv_inspector", "opcodes", "mapzones.json");
    
    const mapZones = JSON.parse(readFileSync(mapZonesPath, 'utf8'));
    
    // We need to associate entities (which have coords) with these zones
    // This script will iterate through enriched entities and check their coordinates 
    // against the defined zones.
    
    const entityTypes = ['npc', 'object']; // Items are generally ground-based, NPCs/Objects have static regions
    
    for (const type of entityTypes) {
        const filePath = join(outputDir, `${type}_enriched.json`);
        const entities = JSON.parse(readFileSync(filePath, 'utf8'));

        for (const [id, entity] of Object.entries(entities) as [string, any]) {
            if (entity.x !== undefined && entity.y !== undefined) {
                // Find matching region
                const region = mapZones.find((zone: any) => {
                    return zone.bounds.some((bound: any) => 
                        entity.x >= bound.dst.xstart && entity.x <= bound.dst.xend &&
                        entity.y >= bound.dst.zstart && entity.y <= bound.dst.zend
                    );
                });
                
                if (region) {
                    entity.pog2_region = region.name;
                }
            }
        }
        
        writeFileSync(filePath, JSON.stringify(entities, null, 2));
        console.log(`Regional enrichment for ${type} complete.`);
    }
}

run().catch(console.error);
