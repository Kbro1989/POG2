import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 15612;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);
    const strings = [];
    let start = -1;
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] >= 32 && buf[i] <= 126) {
            if (start === -1) start = i;
        } else {
            if (start !== -1 && i - start > 3) {
                strings.push(buf.slice(start, i).toString());
            }
            start = -1;
        }
    }
    console.log(`Strings in ${id}:`, strings);
}

main();
