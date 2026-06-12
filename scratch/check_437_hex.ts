import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 437;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);
    const target = 548;
    const search = Buffer.alloc(2);
    search.writeUInt16BE(target);

    const idx = buf.indexOf(search);
    console.log(`Script 437 hex around 548 at ${idx}:`);
    console.log(buf.slice(Math.max(0, idx - 10), Math.min(buf.length, idx + 10)).toString("hex"));
}

main();
