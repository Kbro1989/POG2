import { EngineCache } from './tmp_rsmv_inspect/src/3d/modeltothree.js';
import { GameCacheLoader } from './tmp_rsmv_inspect/src/cache/sqlite.js';
import { cacheMajors } from './tmp_rsmv_inspect/src/constants.js';
import { parse } from './tmp_rsmv_inspect/src/opdecoder.js';

async function searchNpcs() {
    const source = new GameCacheLoader('C:\\ProgramData\\Jagex\\RuneScape');
    const engine = await EngineCache.create(source);
    
    console.log('Searching NPC index for "Pick Of Gods"...');
    
    const index = await engine.getCacheIndex(cacheMajors.npcs);
    for (const entry of index) {
        if (!entry) continue;
        try {
            const file = await engine.getFileById(cacheMajors.npcs, entry.minor);
            const npc = parse.npc.read(file, engine.rawsource);
            if (npc.name && npc.name.toLowerCase().includes('pick of gods')) {
                console.log(`FOUND NPC: ID=${entry.minor}, Name=${npc.name}`);
            }
        } catch (e) {
            // Skip failed reads
        }
    }
    console.log('Search complete.');
}

searchNpcs().catch(console.error);
