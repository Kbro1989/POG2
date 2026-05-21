import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const target = 548;
    const buf = Buffer.alloc(2);
    buf.writeUInt16BE(target);

    const index = await loader.getCacheIndex(cacheMajors.clientscript);
    let count = 0;
    for (const entry of index) {
        if (!entry) continue;
        try {
            const f = await loader.getFileById(cacheMajors.clientscript, entry.minor);
            if (f.indexOf(buf) !== -1) {
                count++;
                if (count < 10) console.log(`Script ${entry.minor} references 548`);
            }
        } catch (e) { }
    }
    console.log(`Total scripts referencing 548: ${count}`);
}

main();
