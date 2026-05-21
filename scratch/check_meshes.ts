import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/sovereign/cache_pedagogy/rsmv_inspector/dist/cache/sqlite.js');
const { parse } = require('D:/sovereign/cache_pedagogy/rsmv_inspector/dist/opdecoder.js');

async function test() {
    const cache = new GameCacheLoader('C:/ProgramData/Jagex/RuneScape-BETA');
    const buf = await cache.getFile(47, 31149);
    const model = parse.models.read(buf, cache, { clientVersion: 1149 });
    
    console.log('meshes type:', Array.isArray(model.meshes) ? 'Array' : typeof model.meshes);
    console.log('meshes keys:', Object.keys(model.meshes || {}));
    
    for (const key of Object.keys(model.meshes || {})) {
        const mesh = model.meshes[key];
        if (!mesh) continue;
        console.log(`mesh ${key} keys:`, Object.keys(mesh));
        for (const [k, v] of Object.entries(mesh)) {
             if (v && (v as any).length !== undefined) console.log(`  ${k}: array(${(v as any).length})`);
             else console.log(`  ${k}: ${typeof v}`);
        }
    }
}
test().catch(console.error);
