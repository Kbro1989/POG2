import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 4732;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    const target = 28556;
    const tBuf = Buffer.alloc(4);
    tBuf.writeUInt32BE(target);
    if (buf.indexOf(tBuf) !== -1) {
        console.log(`Script 4732 references component ${target}`);
    } else {
        console.log(`Script 4732 DOES NOT reference component ${target}`);
    }
}

main();
