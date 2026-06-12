import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 4732;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    // Check for 0x02BF (703) and 0x073B (1851)
    const targets = [703, 1851];
    for (const target of targets) {
        const buf2 = Buffer.alloc(2);
        buf2.writeUInt16BE(target);
        if (buf.indexOf(buf2) !== -1) {
            console.log(`Script 4732 references Interface ${target} (as 2-byte value)`);
        }
    }
}

main();
