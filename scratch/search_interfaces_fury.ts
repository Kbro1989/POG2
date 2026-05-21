import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const searchPattern = Buffer.from("Greater Fury", "utf-8");

    const index = await loader.getCacheIndex(cacheMajors.interfaces);
    for (const entry of index) {
        if (!entry) continue;
        try {
            const archive = await loader.getArchiveById(cacheMajors.interfaces, entry.minor);
            for (const file of archive) {
                if (file.buffer.includes(searchPattern)) {
                    console.log(`FOUND "Greater Fury" in Interface ${entry.minor} File ${file.fileid}`);
                }
            }
        } catch (e) { }
    }
}

main();
