import { GameCacheLoader } from './tmp_rsmv_inspect/src/cache/sqlite.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
(global as any).__non_webpack_require__ = require;

async function main() {
    const cachePath = 'C:\\ProgramData\\Jagex\\RuneScape';
    const cache = new GameCacheLoader(cachePath);
    (cache as any).buildnr = 940;

    const npcId = 0; // Hans
    const major = 18;
    const archSize = 128; // NPC arch size is 128
    const archId = Math.floor(npcId / archSize);
    const fileId = npcId % archSize;

    console.log(`Extracting NPC ${npcId} from Major ${major}, Archive ${archId}, File ${fileId}...`);

    try {
        const archive = await cache.getArchiveById(major, archId);
        const file = archive.find(f => f.fileid === fileId);
        if (file) {
            console.log('Raw Bytes (Hex):', file.buffer.toString('hex'));
        } else {
            console.error('File not found in archive');
        }
    } catch (e) {
        console.error('Failed to read archive:', e);
    }

    cache.close();
}

main().catch(console.error);
