import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";
import * as fs from "fs";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const scripts = [4732, 15592];

    for (const id of scripts) {
        console.log(`Reading ClientScript ${id} raw...`);
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, id);
            // We need to provide a dummy deob object because scriptopt needs it
            const dummyDeob = {
                readOpcode: (state) => {
                    const opcode = state.buffer.readUint16BE(state.scan);
                    state.scan += 2;
                    // We don't know the imm type, so we guess byte or int based on classic rules
                    // But for raw readout, we just want to see the opcodes.
                    return { opcode, imm: 0 };
                }
            };

            const script = parse.clientscript.read(buf, loader, { clientScriptDeob: dummyDeob });
            console.log(`--- Script ${id} Metadata ---`);
            console.log(JSON.stringify({
                intargcount: script.intargcount,
                stringargcount: script.stringargcount,
                longargcount: script.longargcount,
                localintcount: script.localintcount,
                localstringcount: script.localstringcount,
                locallongcount: script.locallongcount,
                instructioncount: script.instructioncount
            }, null, 2));

            // Note: opcodedata will be junk because dummyDeob.readOpcode doesn't know lengths
            // So we'll also print the raw buffer hex around strings
            console.log("Raw buffer hex (first 512 bytes):");
            console.log(buf.slice(0, 512).toString("hex"));

            // Find strings in the buffer
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
            console.log("Strings found in script:");
            console.log(strings.filter(s => s.length > 5));

        } catch (e) {
            console.error(`Error reading script ${id}:`, e);
        }
    }
}

main();
