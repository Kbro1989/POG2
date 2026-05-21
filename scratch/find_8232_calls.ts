import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 8232;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    // Search for 0x1D (gosub) followed by a 4-byte script ID
    // Note: I found earlier that 0x1D might be different, but I'll search for 4-byte values.
    const scripts = new Set<number>();
    for (let i = 0; i < buf.length - 4; i++) {
        const val = buf.readUInt32BE(i);
        if (val > 2000 && val < 10000) {
            scripts.add(val);
        }
    }
    console.log(`Script 8232 references (potential calls):`, [...scripts]);
}

main();
