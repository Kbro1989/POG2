import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    try {
        const buf = await loader.getFileById(cacheMajors.clientscript, 499);
        console.log(`Script 499 length: ${buf.length}`);
    } catch (e) {
        console.log("Script 499 NOT FOUND.");
    }
}

main();
