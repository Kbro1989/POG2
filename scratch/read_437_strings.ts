import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 437;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);
    const dummyDeob = {
        readOpcode: (state) => {
            const opcode = state.buffer.readUint16BE(state.scan);
            state.scan += 2;
            return { opcode, imm: 0 };
        }
    };

    const script = parse.clientscript.read(buf, loader, { clientScriptDeob: dummyDeob });
    console.log(`--- Script ${id} ---`);

    const strings = [];
    let start = -1;
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] >= 32 && buf[i] <= 126) {
            if (start === -1) start = i;
        } else {
            if (start !== -1 && i - start > 3) {
                strings.push(buf.slice(start, i).toString());
            }
            start = -1;
        }
    }
    console.log("Strings:", strings);
}

main();
