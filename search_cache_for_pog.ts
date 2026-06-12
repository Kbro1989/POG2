import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const RSMV_DIST = 'D:/sovereign/cache_pedagogy/rsmv_inspector/dist';
const { EngineCache  } = require(`${RSMV_DIST}/3d/modeltothree.js`);
const { GameCacheLoader  } = require(`${RSMV_DIST}/cache/sqlite.js`);
const { cacheMajors  } = require(`${RSMV_DIST}/constants.js`);
const { parse  } = require(`${RSMV_DIST}/opdecoder.js`);

if (typeof (globalThis as any).__non_webpack_require__ === "undefined") {
    (globalThis as any).__non_webpack_require__ = require;
}






async function searchCache() {
    const source = new GameCacheLoader('C:\\ProgramData\\Jagex\\RuneScape');
    const engine = await EngineCache.create(source);
    
    const searches = [
        { major: cacheMajors.npcs, parser: parse.npc, label: 'NPC' },
        { major: cacheMajors.items, parser: parse.item, label: 'ITEM' },
        { major: cacheMajors.objects, parser: parse.object, label: 'OBJECT' }
    ];

    for (const s of searches) {
        console.log(`\n--- Searching ${s.label} index for "Pick Of Gods" ---`);
        try {
            const index = await engine.getCacheIndex(s.major);
            for (const entry of index) {
                if (!entry) continue;
                try {
                    const file = await engine.getFileById(s.major, entry.minor);
                    const config = s.parser.read(file, engine.rawsource);
                    if (config.name) {
                        console.log(`${s.label} ${entry.minor}: ${config.name}`);
                        if (config.name.toLowerCase().includes('pick of gods')) {
                            console.log(`FOUND ${s.label}: ID=${entry.minor}, Name="${config.name}"`);
                        }
                    }
                } catch (e) {
                    // Skip failed reads
                }
            }
        } catch (e) {
            console.error(`Failed to search ${s.label}:`, e);
        }
    }
    console.log('\nSearch complete.');
}

searchCache().catch(console.error);
