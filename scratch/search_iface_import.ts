import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const searchPattern = Buffer.from("Import Save", "utf-8");

    const index = await loader.getCacheIndex(cacheMajors.interfaces);
    for (const e of index) {
        if (!e) continue;
        try {
            const archive = await loader.getArchiveById(cacheMajors.interfaces, e.minor);
            for (const file of archive) {
                if (file.buffer.includes(searchPattern)) {
                    console.log(`FOUND "Import Save" in Interface ${e.minor} Component ${file.fileid}`);
                }
            }
        } catch (e) { }
    }
}

main();
