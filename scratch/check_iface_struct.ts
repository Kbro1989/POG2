import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const buf = await loader.getFileById(cacheMajors.interfaces, 703);
    const iface = parse.interfaces.read(buf, loader);

    console.log("Interface keys:", Object.keys(iface));
    // Usually it is a Map or an Array of components.
}

main();
