import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const op = 3336; // MOVECOORD
    const oBuf = Buffer.alloc(2);
    oBuf.writeUInt16BE(op);

    const targets = [44, 45];
    for (const id of targets) {
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, id);
            if (buf.indexOf(oBuf) !== -1) {
                console.log(`Script ${id} uses MOVECOORD (3336)`);
                // Dump hex around the call
                const offset = buf.indexOf(oBuf);
                console.log(`Hex around ${offset}: ${buf.slice(offset - 10, offset + 10).toString('hex')}`);
            } else {
                console.log(`Script ${id} DOES NOT use MOVECOORD (3336)`);
            }
        } catch (e) {
            console.log(`Script ${id} NOT FOUND.`);
        }
    }
}

main();
