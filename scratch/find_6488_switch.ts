import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 6488;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    // Search for 0x33 (switch)
    const target = 0x33;
    let offset = buf.indexOf(target);
    while (offset !== -1) {
        console.log(`Found switch at ${offset}`);
        offset = buf.indexOf(target, offset + 1);
    }
}

main();
