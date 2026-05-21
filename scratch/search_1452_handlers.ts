import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const archive = await loader.getArchiveById(cacheMajors.interfaces, 1452);
    for (const file of archive) {
        const comp = parse.interfaces.read(file.buffer, loader);
        if (comp.scripts.unk8 && comp.scripts.unk8.length > 0) {
            console.log(`Comp 1452:${file.fileid} has unk8:`, comp.scripts.unk8);
        }
    }
}

main();
