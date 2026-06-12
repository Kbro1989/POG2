import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 15627;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    const target = Buffer.from("Play Now");
    const offset = buf.indexOf(target);
    if (offset !== -1) {
        console.log(`"Play Now" found at ${offset}`);
        // Look for component ID nearby (usually 4 bytes before)
        for (let i = offset - 20; i < offset; i++) {
            if (i < 0) continue;
            const val = buf.readUInt32BE(i);
            if (val > 0x00010000 && val < 0x0FFF0000) {
                console.log(`Potential Component ID at ${i}: 0x${val.toString(16)} (${val})`);
            }
        }
    }
}

main();
