import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 15627;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    // Search for 0x1D (gosub) followed by a 4-byte script ID
    const scripts = new Set<number>();
    for (let i = 0; i < buf.length - 5; i++) {
        if (buf[i] === 0x1D) {
            const val = buf.readUInt32BE(i + 1);
            if (val > 0 && val < 30000) {
                scripts.add(val);
            }
        }
    }
    console.log(`Script 15627 calls:`, [...scripts]);
}

main();
