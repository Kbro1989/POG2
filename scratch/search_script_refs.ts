import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const index = await loader.getCacheIndex(cacheMajors.clientscript);
    console.log(`Searching through ${index.length} scripts...`);

    const target1 = 4732;
    const target2 = 15592;

    const buf1 = Buffer.alloc(2);
    buf1.writeUInt16BE(target1);
    const buf1_32 = Buffer.alloc(4);
    buf1_32.writeUInt32BE(target1);

    const buf2 = Buffer.alloc(2);
    buf2.writeUInt16BE(target2);
    const buf2_32 = Buffer.alloc(4);
    buf2_32.writeUInt32BE(target2);

    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, entry.minor);
            if (buf.indexOf(buf1) !== -1 || buf.indexOf(buf1_32) !== -1) {
                console.log(`Script ${entry.minor} references 4732`);
            }
            if (buf.indexOf(buf2) !== -1 || buf.indexOf(buf2_32) !== -1) {
                console.log(`Script ${entry.minor} references 15592`);
            }
        } catch (e) { }
    }
}

main();
