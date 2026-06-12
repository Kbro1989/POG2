import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const archive = await loader.getArchiveById(cacheMajors.interfaces, 111);
    console.log(`Interface 111 has ${archive.length} components.`);
    const comp = archive.find(q => q.fileid === 140); // 0x8C
    if (comp) {
        console.log(`Found Component 140 in Interface 111!`);
    }
}

main();
