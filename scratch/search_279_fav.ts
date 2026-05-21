import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const pattern = Buffer.from("favourite world", "utf-8");

    const archive = await loader.getArchiveById(cacheMajors.interfaces, 279);
    for (const file of archive) {
        if (file.buffer.includes(pattern)) {
            console.log(`FOUND in Interface 279 Component ${file.fileid}`);
        }
    }
}

main();
