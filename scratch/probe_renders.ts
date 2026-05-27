import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader } = require('D:/sovereign/cache_pedagogy/rsmv_inspector/dist/cache/sqlite.js');
const { parse } = require('D:/sovereign/cache_pedagogy/rsmv_inspector/dist/opdecoder.js');

async function probe() {
    const cache = new GameCacheLoader('C:/ProgramData/Jagex/RuneScape-BETA');
    const buf = await cache.getFile(47, 12428);
    const model = parse.models.read(buf, cache, { clientVersion: 1149 });

    console.log('=== meshdata keys ===');
    console.log(Object.keys(model.meshdata));

    console.log('\n=== Top-level model keys ===');
    console.log(Object.keys(model));
    console.log('format:', model.format, 'version:', model.version);

    console.log('\n=== meshdata.indices? ===');
    console.log('Has indices:', !!model.meshdata.indices);
    if (model.meshdata.indices) {
        console.log('indices length:', model.meshdata.indices.length);
        console.log('indices first 30:', Array.from(model.meshdata.indices).slice(0, 30));
    }

    console.log('\n=== meshdata.renders ===');
    console.log('renderCount:', model.meshdata.renders?.length);

    for (let i = 0; i < Math.min(model.meshdata.renders?.length || 0, 3); i++) {
        const r = model.meshdata.renders[i];
        console.log(`\n--- render[${i}] ---`);
        console.log('keys:', Object.keys(r));
        console.log('type of buf:', typeof r.buf, 'isArray:', Array.isArray(r.buf));
        if (r.buf) {
            const arr = Array.isArray(r.buf) ? r.buf : Array.from(r.buf);
            console.log('buf length:', arr.length);
            console.log('first 30:', JSON.stringify(arr.slice(0, 30)));
            console.log('last 10:', JSON.stringify(arr.slice(-10)));
            // Check if divisible by 3 (triangles)
            console.log('divisible by 3:', arr.length % 3 === 0);
            // Check value range
            const max = Math.max(...arr);
            const min = Math.min(...arr);
            console.log('value range:', min, '-', max);
            console.log('vertexCount:', model.meshdata.vertexCount);
            console.log('all values < vertexCount:', max < model.meshdata.vertexCount);
        }
        // Check for other properties
        for (const k of Object.keys(r)) {
            if (k !== 'buf') {
                console.log(`${k}:`, JSON.stringify(r[k]).slice(0, 200));
            }
        }
    }

    console.log('\n=== meshdata numeric fields ===');
    console.log('vertexCount:', model.meshdata.vertexCount);
    console.log('faceCount:', model.meshdata.faceCount);
    console.log('positionBuffer length:', model.meshdata.positionBuffer?.length);
    console.log('normalBuffer length:', model.meshdata.normalBuffer?.length);
    console.log('uvBuffer length:', model.meshdata.uvBuffer?.length);
}
probe().catch(console.error);
