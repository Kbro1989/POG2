import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    try {
        const buf = await loader.getFileById(cacheMajors.interfaces, 1465, 1);
        const comp = parse.interfaces.read(buf, loader);
        console.log(`Minimap Comp 1465:1 scripts:`, comp.scripts);
    } catch (e) {
        console.log("Minimap Comp 1465:1 NOT FOUND.");
    }
}

main();
