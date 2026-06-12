import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/sovereign/cache_pedagogy/rsmv_inspector/dist/cache/sqlite.js');
const { parse } = require('D:/sovereign/cache_pedagogy/rsmv_inspector/dist/opdecoder.js');

async function test() {
    const cache = new GameCacheLoader('C:/ProgramData/Jagex/RuneScape-BETA');
    const buf = await cache.getFile(47, 31149);
    const model = parse.models.read(buf, cache, { clientVersion: 1149 });
    
    console.log('meshdata keys:', Object.keys(model.meshdata));
    for (const [k, v] of Object.entries(model.meshdata)) {
        if (v && (v as any).length !== undefined) {
            console.log(`  ${k}: array length ${(v as any).length}`);
        } else {
            console.log(`  ${k}: ${typeof v}`);
        }
    }
}
test().catch(console.error);
