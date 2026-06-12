import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const index = await loader.getCacheIndex(54); // DBRows
    const searchPattern = Buffer.from("Player Avatar Beta");

    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(54, entry.minor);
            if (buf.indexOf(searchPattern) !== -1) {
                console.log(`FOUND "Player Avatar Beta" in DBRow ${entry.minor}`);
            }
        } catch (e) { }
    }
}

main();
