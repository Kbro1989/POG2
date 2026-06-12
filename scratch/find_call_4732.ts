import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 15592;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    const target = 4732;
    const tBuf = Buffer.alloc(4);
    tBuf.writeUInt32BE(target);
    const offset = buf.indexOf(tBuf);
    if (offset !== -1) {
        console.log(`Script 15592 calls 4732 at ${offset}`);
        console.log(`Context: ${buf.slice(offset - 10, offset + 14).toString('hex')}`);
    }
}

main();
