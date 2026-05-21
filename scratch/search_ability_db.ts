import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const searchPattern = Buffer.from("Finger of Death", "utf-8");

    const index = await loader.getCacheIndex(19); // DBTables
    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(19, entry.minor);
            if (buf.includes(searchPattern)) {
                console.log(`FOUND "Finger of Death" in Major 19 Minor ${entry.minor}`);
            }
        } catch (e) { }
    }
}

main();
