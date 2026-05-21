import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const index = await loader.getCacheIndex(cacheMajors.interfaces);
    const target = 15592;
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(target);

    for (const entry of index) {
        if (!entry) continue;
        try {
            const f = await loader.getFileById(cacheMajors.interfaces, entry.minor);
            if (f.indexOf(buf) !== -1) {
                console.log(`Script 15592 referenced in Interface ${entry.minor}`);
            }
        } catch (e) { }
    }
}

main();
