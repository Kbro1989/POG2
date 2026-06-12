import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const target = 45261;
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(target);
    const buf32 = Buffer.alloc(4);
    buf32.writeUInt32BE(target);

    const index = await loader.getCacheIndex(cacheMajors.clientscript);
    for (const entry of index) {
        if (!entry) continue;
        try {
            const f = await loader.getFileById(cacheMajors.clientscript, entry.minor);
            if (f.indexOf(buf) !== -1 || f.indexOf(buf32) !== -1) {
                console.log(`Script ${entry.minor} references 45261`);
            }
        } catch (e) { }
    }
}

main();
