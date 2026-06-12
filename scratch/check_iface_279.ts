import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    try {
        const archive = await loader.getArchiveById(cacheMajors.interfaces, 279);
        console.log(`Interface 279 has ${archive.length} components.`);
    } catch (e) {
        console.log("Interface 279 NOT FOUND in Beta.");
    }
}

main();
