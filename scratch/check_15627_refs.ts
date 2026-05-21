import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 15627;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    const targets = [4732, 15592];
    for (const target of targets) {
        const tBuf = Buffer.alloc(4);
        tBuf.writeUInt32BE(target);
        if (buf.indexOf(tBuf) !== -1) {
            console.log(`Script 15627 references script ${target}`);
        }
    }
}

main();
