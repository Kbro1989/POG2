import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape";
    const loader = new GameCacheLoader(cachePath);

    try {
        const buf = await loader.getFileById(cacheMajors.interfaces, 703);
        console.log(`LIVE Interface 703 length: ${buf.length}`);
    } catch (e) {
        console.log("LIVE Interface 703 NOT FOUND.");
    }
}

main();
