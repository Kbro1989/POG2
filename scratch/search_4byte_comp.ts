import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const target = 28556;
    const tBuf = Buffer.alloc(4);
    tBuf.writeUInt32BE(target);

    const id = 15592;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);
    if (buf.indexOf(tBuf) !== -1) {
        console.log(`Script 15592 references component 28556 as 4-byte at ${buf.indexOf(tBuf)}`);
    } else {
        console.log(`Script 15592 DOES NOT reference component 28556 as 4-byte.`);
    }
}

main();
