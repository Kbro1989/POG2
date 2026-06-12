import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const archive = await loader.getArchiveById(cacheMajors.interfaces, 703);
    console.log(`Interface 703 has ${archive.length} components.`);
    for (const file of archive) {
        if (file.fileid === 28556) {
            console.log(`Found Component 28556!`);
        }
    }
}

main();
