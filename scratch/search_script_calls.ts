
import { GameCacheLoader } from "../src/rsmv/cache/sqlite";
import { cacheMajors } from "../src/rsmv/constants";
import * as fs from "fs";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const index = await loader.getCacheIndex(cacheMajors.clientscript);

    const target1 = 4732;
    const target2 = 15592;

    const t1b = Buffer.alloc(3);
    t1b.writeUIntBE(target1, 0, 3);

    const t2b = Buffer.alloc(3);
    t2b.writeUIntBE(target2, 0, 3);

    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, entry.minor);
            if (buf.indexOf(t1b) !== -1 || buf.indexOf(t2b) !== -1) {
                console.log(`Script ${entry.minor} might call target scripts`);
            }
        } catch (e) { }
    }
}

main();
