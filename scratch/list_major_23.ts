import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const major = 23; // WorldMap/Lobby
    const index = await loader.getCacheIndex(major);
    console.log(`Major ${major} has ${index.length} files.`);
    for (const e of index) {
        if (!e) continue;
        const buf = await loader.getFileById(major, e.minor);
        console.log(`File ${e.minor} length: ${buf.length}`);
    }
}

main();
