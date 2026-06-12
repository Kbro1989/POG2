import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const op = 42; // pushvar
    const varid = 173;

    const oBuf = Buffer.alloc(4);
    oBuf.writeUInt16BE(op, 0);
    oBuf.writeUInt16BE(varid, 2);

    const index = await loader.getCacheIndex(cacheMajors.clientscript);
    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, entry.minor);
            if (buf.indexOf(oBuf) !== -1) {
                console.log(`Script ${entry.minor} uses Varp 173 (Run)`);
            }
        } catch (e) { }
    }
}

main();
