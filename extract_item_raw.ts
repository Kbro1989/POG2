import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { GameCacheLoader  } = require("./rsmv/src/cache/sqlite.js");




(global as any).__non_webpack_require__ = require;

async function main() {
    const cachePath = 'C:\\ProgramData\\Jagex\\RuneScape';
    const cache = new GameCacheLoader(cachePath);
    (cache as any).buildnr = 940;

    const itemId = 4151; // Abyssal whip
    const major = 19;
    const archSize = 256;
    const archId = Math.floor(itemId / archSize);
    const fileId = itemId % archSize;

    console.log(`Extracting Item ${itemId} from Major ${major}, Archive ${archId}, File ${fileId}...`);

    try {
        const archive = await cache.getArchiveById(major, archId);
        const file = archive.find((f: { fileid: number; }) => f.fileid === fileId);
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
