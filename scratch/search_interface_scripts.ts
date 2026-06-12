
import { GameCacheLoader } from "../src/rsmv/cache/sqlite";
import { cacheMajors } from "../src/rsmv/constants";
import { parse } from "../src/rsmv/opdecoder";
import * as fs from "fs";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const index = await loader.getCacheIndex(cacheMajors.interfaces);
    console.log(`Searching through ${index.length} interfaces...`);

    const targetScript1 = 4732;
    const targetScript2 = 15592;

    const script1Buf = Buffer.alloc(4);
    script1Buf.writeUInt32BE(targetScript1);

    const script2Buf = Buffer.alloc(4);
    script2Buf.writeUInt32BE(targetScript2);

    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.interfaces, entry.minor);
            if (buf.indexOf(script1Buf) !== -1 || buf.indexOf(script2Buf) !== -1) {
                console.log(`FOUND reference to script in Interface ${entry.minor}`);
            }
        } catch (e) { }
    }
}

main();
