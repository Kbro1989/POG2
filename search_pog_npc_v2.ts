import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { EngineCache  } = require("./tmp_rsmv_inspect/src/3d/modeltothree.js");
const { GameCacheLoader  } = require("./tmp_rsmv_inspect/src/cache/sqlite.js");
const { cacheMajors  } = require("./tmp_rsmv_inspect/src/constants.js");
const { parse  } = require("./tmp_rsmv_inspect/src/opdecoder.js");


if (typeof (globalThis as any).__non_webpack_require__ === 'undefined') {
    (globalThis as any).__non_webpack_require__ = require;
}






async function searchNpcs() {
    const source = new GameCacheLoader('C:\\ProgramData\\Jagex\\RuneScape');
    const engine = await EngineCache.create(source);
    
    console.log('Searching NPC index for "Pick Of Gods"...');
    
    const index = await engine.getCacheIndex(cacheMajors.npcs);
    let found = false;
    for (const entry of index) {
        if (!entry) continue;
        try {
            const file = await engine.getFileById(cacheMajors.npcs, entry.minor);
            const npc = parse.npc.read(file, engine.rawsource);
            if (npc.name && npc.name.toLowerCase().includes('pick of gods')) {
                console.log(`FOUND NPC: ID=${entry.minor}, Name=${npc.name}`);
                found = true;
                break;
            }
        } catch (e) {
            // Skip failed reads
        }
    }
    if (!found) {
        console.log('No NPC found with that name. Checking for "Pick_Of_Gods"...');
        // Search for partial matches or common variants if needed
    }
    console.log('Search complete.');
}

searchNpcs().catch(console.error);
