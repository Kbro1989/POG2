import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 15592;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);
    const script = parse.clientscriptdata.read(buf, loader);

    console.log("Script 15592 Metadata:");
    console.log(`Int Args: ${script.intargcount}`);
    console.log(`String Args: ${script.stringargcount}`);
    console.log(`Long Args: ${script.longargcount}`);
    console.log(`Local Ints: ${script.localintcount}`);
    console.log(`Local Strings: ${script.localstringcount}`);
    console.log(`Local Longs: ${script.locallongcount}`);
}

main();
