import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 15592;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    const currentOp = 0;
    const dummyDeob = {
        readOpcode: (state) => {
            const start = state.scan;
            const opcode = state.buffer.readUint16BE(state.scan);
            state.scan += 2;

            // Try to guess imm size based on next bytes
            // In RS3, most ops are [opcode(2)][imm(1, 4, or string)]
            // Since we don't know the mapping, we can't be sure.
            // But we can print the bytes and look for patterns.

            return { opcode, imm: 0 };
        }
    };

    console.log(`--- Script ${id} Hex Dump ---`);
    for (let i = 0; i < buf.length; i += 16) {
        console.log(`${i.toString(16).padStart(4, "0")}: ${buf.slice(i, i + 16).toString("hex").match(/.{2}/g)?.join(" ")}`);
    }
}

main();
