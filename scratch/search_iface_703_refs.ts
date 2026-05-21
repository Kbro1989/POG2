import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const iface = 703;
    const prefix = iface << 16;

    const index = await loader.getCacheIndex(cacheMajors.clientscript);
    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, entry.minor);
            for (let i = 0; i < buf.length - 4; i++) {
                const val = buf.readUInt32BE(i);
                if ((val & 0xFFFF0000) === prefix) {
                    console.log(`Script ${entry.minor} references component 0x${val.toString(16)} (Interface 703 Comp ${val & 0xFFFF})`);
                }
            }
        } catch (e) { }
    }
}

main();
