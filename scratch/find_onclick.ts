import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 15592;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    // Search for 28556 (0x6F8C) followed by a script call
    const target = 28556;
    const tBuf = Buffer.alloc(2);
    tBuf.writeUInt16BE(target);

    let offset = buf.indexOf(tBuf);
    while (offset !== -1) {
        console.log(`Found component ${target} at ${offset}. Context: ${buf.slice(offset, offset + 20).toString('hex')}`);
        offset = buf.indexOf(tBuf, offset + 1);
    }
}

main();
