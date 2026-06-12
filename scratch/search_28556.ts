import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const target = 28556;
    const buf = Buffer.alloc(4);
    buf.writeUInt32BE(target);
    const bufLE = Buffer.alloc(4);
    bufLE.writeUInt32LE(target);

    const index = await loader.getCacheIndex(cacheMajors.interfaces);
    for (const entry of index) {
        if (!entry) continue;
        try {
            const f = await loader.getFileById(cacheMajors.interfaces, entry.minor);
            if (f.indexOf(buf) !== -1 || f.indexOf(bufLE) !== -1) {
                console.log(`FOUND 28556 in Interface ${entry.minor}`);
            }
        } catch (e) { }
    }
}

main();
