
import { GameCacheLoader } from "../src/rsmv/cache/sqlite";
import { cacheMajors } from "../src/rsmv/constants";
import * as fs from "fs";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const index = await loader.getCacheIndex(cacheMajors.interfaces);

    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.interfaces, entry.minor);
            if (buf.toString('ascii').toLowerCase().includes("import save")) {
                console.log(`FOUND "import save" in Interface ${entry.minor}`);
            }
        } catch (e) { }
    }
}

main();
