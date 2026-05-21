import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 703;
    const buf = await loader.getFileById(cacheMajors.interfaces, id);
    console.log(`Interface 703 length: ${buf.length}`);
}

main();
