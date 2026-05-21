import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import * as fs from 'fs';

const rsmv_PATH = 'D:\\sovereign\\cache_pedagogy\\rsmv_inspector';
const CACHE_PATH = 'C:\\ProgramData\\Jagex\\RuneScape';

async function main() {
    const args = process.argv.slice(2);
    const id = parseInt(args[0] || '420');

    try {
        const sqlitePath = 'file:///' + resolve(rsmv_PATH, 'src/cache/sqlite.ts').replace(/\\/g, '/');
        const rt7Path = 'file:///' + resolve(rsmv_PATH, 'src/3d/rt7model.ts').replace(/\\/g, '/');

        const { GameCacheLoader } = await import(sqlitePath);
        const { parseOb3Model } = await import(rt7Path);

        const loader = new GameCacheLoader(CACHE_PATH);
        const buffer = await loader.getFileById(47, id); // Major 47 is models
        
        if (!buffer) {
            console.error(`Model ${id} not found in cache.`);
            loader.close?.();
            process.exit(1);
        }

        const modelData = parseOb3Model(buffer, loader);
        
        const positions: number[] = [];
        for (const mesh of (modelData.meshes || [])) {
            if (mesh.attributes?.pos) {
                const count = mesh.attributes.pos.count;
                const array = mesh.attributes.pos.array;
                for(let i=0; i<array.length; i++) {
                    positions.push(array[i]);
                }
            }
        }
        
        const outDir = resolve(process.cwd(), 'public/models');
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }

        const outFile = resolve(outDir, `kit_${id}.json`);
        fs.writeFileSync(outFile, JSON.stringify({ positions }));
        console.log(`Extracted kit_${id}.json with ${positions.length/3} vertices.`);

        loader.close?.();
    } catch (err) {
        console.error(err);
    }
}

main();
