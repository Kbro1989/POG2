import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const index = await loader.getCacheIndex(52);
    const searchPattern = Buffer.from("Player Avatar Beta");

    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(52, entry.minor);
            if (buf.indexOf(searchPattern) !== -1) {
                console.log(`FOUND "Player Avatar Beta" in Major 52 ID ${entry.minor}`);
            }
        } catch (e) { }
    }
}

main();
