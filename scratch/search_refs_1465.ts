import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const target = 1465 << 16;
    const tBuf = Buffer.alloc(4);
    tBuf.writeUInt32BE(target);

    const index = await loader.getCacheIndex(cacheMajors.clientscript);
    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, entry.minor);
            if (buf.indexOf(tBuf) !== -1) {
                console.log(`Script ${entry.minor} references Interface 1465`);
            }
        } catch (e) { }
    }
}

main();
