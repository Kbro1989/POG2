import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 3066;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);
    const script = parse.clientscriptdata.read(buf, loader);

    console.log("Script 3066 Metadata:");
    console.log(`Int Args: ${script.intargcount}`);
    console.log(`String Args: ${script.stringargcount}`);
    console.log(`Local Ints: ${script.localintcount}`);
}

main();
