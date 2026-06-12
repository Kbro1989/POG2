import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 4732;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    console.log(`Script 4732 (Length: ${buf.length})`);

    // Search for opcodes we suspect
    const opcodes = {
        pushint: Buffer.from([0x08, 0x74]),
        pushvarbit: Buffer.from([0x04, 0xe3]),
        pushlocalint: Buffer.from([0x00, 0x03]),
        return: Buffer.from([0x00, 0x15]), // Guessing return based on common patterns
        cc_settext: Buffer.from([0x04, 0x51]) // Guessing settext
    };

    for (const [name, pattern] of Object.entries(opcodes)) {
        let offset = buf.indexOf(pattern);
        while (offset !== -1) {
            console.log(`Found ${name} at ${offset}. Data: ${buf.slice(offset + 2, offset + 6).toString('hex')}`);
            offset = buf.indexOf(pattern, offset + 1);
        }
    }
}

main();
