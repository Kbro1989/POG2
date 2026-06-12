import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const op = 3336;
    const oBuf = Buffer.alloc(2);
    oBuf.writeUInt16BE(op);

    const index = await loader.getCacheIndex(cacheMajors.clientscript);
    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, entry.minor);
            if (buf.indexOf(oBuf) !== -1) {
                console.log(`Script ${entry.minor} uses MOVECOORD (3336)`);
            }
        } catch (e) { }
    }
}

main();
