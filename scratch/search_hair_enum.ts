import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const searchPattern = Buffer.from("Wind Braids", "utf-8");

    const index = await loader.getCacheIndex(17);
    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(17, entry.minor);
            if (buf.includes(searchPattern)) {
                console.log(`FOUND "Wind Braids" in Major 17 Minor ${entry.minor}`);
            }
        } catch (e) { }
    }
}

main();
