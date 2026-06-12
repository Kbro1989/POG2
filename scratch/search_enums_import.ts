import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const pattern = Buffer.from("Import", "utf-8");

    const major = 17; // Enums
    const index = await loader.getCacheIndex(major);
    for (const e of index) {
        if (!e) continue;
        try {
            const buf = await loader.getFileById(major, e.minor);
            if (buf.includes(pattern)) {
                console.log(`Enum ${e.minor} contains "Import"`);
            }
        } catch (e) { }
    }
}

main();
