import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const buf = await loader.getFileById(cacheMajors.interfaces, 703, 2);
    const comp = parse.interfaces.read(buf, loader);

    console.log(`Comp 703:2 scripts:`, comp.scripts);
}

main();
