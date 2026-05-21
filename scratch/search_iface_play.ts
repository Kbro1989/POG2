import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const searchPattern = Buffer.from("Play on World ", "utf-8");

    const major = 3; // Interfaces
    const index = await loader.getCacheIndex(major);
    for (const e of index) {
        if (!e) continue;
        try {
            const buf = await loader.getFileById(major, e.minor);
            if (buf.includes(searchPattern)) {
                console.log(`FOUND string in Interface ${e.minor}`);
            }
        } catch (e) { }
    }
}

main();
