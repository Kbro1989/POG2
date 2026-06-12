import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const targetOp = Buffer.from([0x08, 0x74]);
    const index = await loader.getCacheIndex(cacheMajors.clientscript);

    let count = 0;
    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, entry.minor);
            if (buf.indexOf(targetOp) !== -1) {
                count++;
                if (count < 5) {
                    const offset = buf.indexOf(targetOp);
                    console.log(`Script ${entry.minor} has 0x0874 at ${offset}. Next 4 bytes: ${buf.slice(offset + 2, offset + 6).toString('hex')}`);
                }
            }
        } catch (e) { }
    }
    console.log(`Total scripts with 0x0874: ${count}`);
}

main();
