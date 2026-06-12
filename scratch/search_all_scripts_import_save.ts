import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const index = await loader.getCacheIndex(cacheMajors.clientscript);
    const searchPattern = Buffer.from("Import Save");

    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, entry.minor);
            if (buf.indexOf(searchPattern) !== -1) {
                console.log(`FOUND "Import Save" in Script ${entry.minor}`);
            }
        } catch (e) { }
    }
}

main();
