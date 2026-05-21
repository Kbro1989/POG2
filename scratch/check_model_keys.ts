import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/sovereign/cache_pedagogy/rsmv_inspector/dist/cache/sqlite.js');
const { parse } = require('D:/sovereign/cache_pedagogy/rsmv_inspector/dist/opdecoder.js');

async function test() {
    const cache = new GameCacheLoader('C:/ProgramData/Jagex/RuneScape-BETA');
    const buf = await cache.getFile(47, 31149);
    const model = parse.models.read(buf, cache, { clientVersion: 1149 });
    
    if (model.meshes) {
        console.log('Meshes array length:', model.meshes.length);
        console.log('Mesh 0 keys:', Object.keys(model.meshes[0]));
        for (const [k, v] of Object.entries(model.meshes[0])) {
            if (typeof v !== 'object') {
                console.log(`  ${k}: ${v}`);
            } else if (Array.isArray(v)) {
                console.log(`  ${k}: Array(${v.length})`);
            } else if (v && (v as any).length !== undefined) {
                console.log(`  ${k}: TypedArray(${(v as any).length})`);
            } else {
                console.log(`  ${k}: Object`);
            }
        }
    }
}
test().catch(console.error);
