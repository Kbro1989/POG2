import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 7974;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);
    const script = parse.clientscript.read(buf, loader);

    console.log(`Script ${id} OpCodes:`);
    for (let i = 0; i < script.opcodes.length; i++) {
        const op = script.opcodes[i];
        console.log(`${i}: ${op.opcode} (${op.imm} / ${op.imm_str})`);
    }
}

main();
