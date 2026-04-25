import { GameCacheLoader } from "../rsmv/cache/sqlite.js";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function run() {
    const source = new GameCacheLoader(CACHE_DIR);
    const archInfo = await source.getArchiveById(2, 41); // Major 2, Minor 41 (DBRows)
    
    if (archInfo.length > 0) {
        const first = archInfo[0];
        console.log(`📄 File ID: ${first.fileid}`);
        console.log(`📂 Buffer: ${first.buffer.slice(0, 50).toString('hex')}`);
    }
}

run().catch(console.error);
