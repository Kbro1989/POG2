import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 20329;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    // Search for string "Use this button..."
    const targetStr = Buffer.from("Use this button to log in to your favourite world.");
    const sOffset = buf.indexOf(targetStr);
    if (sOffset !== -1) {
        console.log(`String found at ${sOffset}`);
        // Look for 4-byte values nearby (component IDs)
        for (let i = sOffset - 10; i < sOffset + 60; i++) {
            if (i < 0) continue;
            const val = buf.readUInt32BE(i);
            if (val > 0x00010000 && val < 0x0FFF0000) {
                console.log(`Potential Component ID at ${i}: 0x${val.toString(16)} (${val})`);
            }
        }
    }
}

main();
