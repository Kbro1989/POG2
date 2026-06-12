import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const archive = await loader.getArchiveById(cacheMajors.interfaces, 703);
    for (const file of archive) {
        const comp = parse.interfaces.read(file.buffer, loader);
        if (comp.basewidth > 100 && comp.baseheight > 40) {
            console.log(`Comp ${file.fileid}: Size(${comp.basewidth}, ${comp.baseheight}) Pos(${comp.baseposx}, ${comp.baseposy})`);
        }
    }
}

main();
