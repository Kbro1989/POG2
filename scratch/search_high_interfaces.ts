import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const index = await loader.getCacheIndex(cacheMajors.interfaces);
    const highIfaces = index.filter(e => e && e.minor > 1800);
    console.log(`Found ${highIfaces.length} interfaces > 1800.`);
    for (const e of highIfaces) {
        console.log(`Interface ${e.minor}`);
    }
}

main();
