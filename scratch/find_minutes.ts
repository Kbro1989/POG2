import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 4732;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    const target = Buffer.from("minute(s)");
    const offset = buf.indexOf(target);
    if (offset !== -1) {
        console.log(`Found "minute(s)" at ${offset}`);
        console.log(`Preceding bytes: ${buf.slice(offset - 10, offset).toString('hex')}`);
    }
}

main();
