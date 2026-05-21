import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const archive = await loader.getArchiveById(cacheMajors.interfaces, 703);
    for (const file of archive) {
        const comp = parse.interfaces.read(file.buffer, loader);
        if (comp.baseposx !== 0 || comp.baseposy !== 0) {
            console.log(`Comp ${file.fileid}: Pos(${comp.baseposx}, ${comp.baseposy}) Size(${comp.basewidth}, ${comp.baseheight})`);
        }
    }
}

main();
