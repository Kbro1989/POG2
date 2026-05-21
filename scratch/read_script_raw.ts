
import { GameCacheLoader } from "../src/rsmv/cache/sqlite";
import { cacheMajors } from "../src/rsmv/constants";
import * as fs from "fs";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 4732;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    console.log(`Raw buffer of script ${id} (ASCII):`);
    console.log(buf.toString('ascii').replace(/[^\x20-\x7E]/g, '.'));
}

main();
