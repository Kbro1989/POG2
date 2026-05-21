import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const index = await loader.getCacheIndex(cacheMajors.interfaces);
    for (const e of index) {
        if (!e) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.interfaces, e.minor);
            if (buf.length > 5000) {
                console.log(`Interface ${e.minor} length: ${buf.length}`);
            }
        } catch (e) { }
    }
}

main();
