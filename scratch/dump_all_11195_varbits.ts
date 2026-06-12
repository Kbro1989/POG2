import { GameCacheLoader } from "../rsmv/dist/cache/sqlite.js";
import { cacheMajors } from "../rsmv/dist/constants.js";

async function main() {
    const scriptId = 11195;
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const buf = await loader.getFileById(cacheMajors.clientscript, scriptId);

    if (!buf) return;

    const potentialVarbits = new Set<number>();

    for (let offset = 0; offset < buf.length - 1; offset++) {
        if (offset + 2 <= buf.length) {
            const val16 = buf.readUInt16BE(offset);
            if (val16 > 100 && val16 < 65535) {
                potentialVarbits.add(val16);
            }
        }
    }

    console.log(`Potential Varbits in Script ${scriptId}:`);
    console.log([...potentialVarbits].sort((a, b) => a - b).join(', '));
}

main().catch(console.error);
