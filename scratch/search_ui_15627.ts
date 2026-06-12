import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 15627;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    const opcodes = [0x0458, 0x0840, 0x0578, 0x0960]; // CC_SETTEXT, IF_SETTEXT, CC_SETONCLICK, IF_SETONCLICK
    for (const op of opcodes) {
        const oBuf = Buffer.alloc(2);
        oBuf.writeUInt16BE(op);
        let offset = buf.indexOf(oBuf);
        while (offset !== -1) {
            console.log(`Found opcode 0x${op.toString(16)} at ${offset}. Data: ${buf.slice(offset + 2, offset + 6).toString('hex')}`);
            offset = buf.indexOf(oBuf, offset + 1);
        }
    }
}

main();
