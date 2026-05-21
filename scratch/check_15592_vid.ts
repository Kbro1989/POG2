import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 15592;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    const target = 15360; // 0x3C00
    const tBuf = Buffer.alloc(2);
    tBuf.writeUInt16BE(target);
    if (buf.indexOf(tBuf) !== -1) {
        console.log(`Script 15592 references Varbit ${target} at ${buf.indexOf(tBuf)}`);
    } else {
        console.log(`Script 15592 DOES NOT reference Varbit ${target}`);
    }
}

main();
