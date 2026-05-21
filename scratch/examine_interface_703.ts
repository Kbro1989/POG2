import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 703;
    const buf = await loader.getFileById(cacheMajors.interfaces, id);

    // Scan for script IDs 4732 and 15592
    const target1 = 4732;
    const buf1 = Buffer.alloc(4);
    buf1.writeUInt32BE(target1);

    const target2 = 15592;
    const buf2 = Buffer.alloc(4);
    buf2.writeUInt32BE(target2);

    if (buf.indexOf(buf1) !== -1) console.log(`Script 4732 referenced in Interface ${id}`);
    if (buf.indexOf(buf2) !== -1) console.log(`Script 15592 referenced in Interface ${id}`);

    // Also scan for the component ID 28556 (0x6F8C)
    const compId = 28556;
    const compBuf = Buffer.alloc(4);
    compBuf.writeUInt32BE(compId);
    if (buf.indexOf(compBuf) !== -1) console.log(`Component 28556 referenced in Interface ${id}`);

    // Print raw strings in interface to see if anything matches
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
    console.log("Strings in Interface 703:", strings);
}

main();
