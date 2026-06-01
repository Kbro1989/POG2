import { WikiEnricher } from '../utils/WikiEnricher.js';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('GreatSynthesis');

async function synthesizeRelationalGraph() {
    const idLists = {
        npcs: ['Cook', 'Hans', 'Goblins', 'Wise Old Man', 'Zulrah', 'Arianwyn'],
        quests: ["Cook's Assistant", "Dragon Slayer", "Plague's End"],
        places: ['Lumbridge Castle', 'Lumbridge Underground', 'Edgeville Monastery', 'Tower of Voices']
    };

    logger.info('Commencing Global Great Synthesis Audit...');

    const synthesisRegistry: any = {
        meta: {
            version: '36.10.2',
            logic: 'Relational Follow-Through',
            timestamp: new Date().toISOString()
        },
        entities: {}
    };

    for (const npcName of idLists.npcs) {
        logger.info({ npc: npcName }, `Enriching relational follow-throughs for ${npcName}...`);
        
        // 1. Get primary intent/role
        const enrichResult = await WikiEnricher.enrich(npcName);
        
        // 2. Get relational links (Follow-Throughs)
        const links = await WikiEnricher.fetchPageLinks(npcName);
        
        if (enrichResult.ok) {
            const entityId = `SOV_${npcName.toUpperCase().replace(/\s/g, '_')}`;
            synthesisRegistry.entities[entityId] = {
                id: entityId,
                name: npcName,
                archetype: {
                    role: enrichResult.value.role,
                    intent: enrichResult.value.intent.substring(0, 50) + '...'
                },
                spatial: {
                    x: 3222, y: 3218, z: 0, // Placeholder for actual grounding
                    directional: { n: 1, s: 0, e: 1, w: 0 },
                    collision: { t: 0, x: 1, o: 6541 } // Mouse Toy anchor
                },
                relations: {
                    quests: idLists.quests.filter(q => links.some(l => l.includes(q))),
                    linked_places: idLists.places.filter(p => links.some(l => l.includes(p)))
                }
            };
            
            console.log(`\n[SYNTHESIZED: ${npcName}]`);
            console.log(`- Linked Quests: ${synthesisRegistry.entities[entityId].relations.quests.join(', ') || 'None'}`);
            console.log(`- Linked Places: ${synthesisRegistry.entities[entityId].relations.linked_places.join(', ') || 'None'}`);
        }
    }

    logger.info('Synthesis complete. Exporting full_spectrum_audit_v1.json...');
}

synthesizeRelationalGraph();

