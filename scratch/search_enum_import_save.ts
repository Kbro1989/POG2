import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const index = await loader.getCacheIndex(cacheMajors.enums);
    const searchPattern = Buffer.from("Import Save");

    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.enums, entry.minor);
            if (buf.indexOf(searchPattern) !== -1) {
                console.log(`FOUND "Import Save" in Enum ${entry.minor}`);
                // Decode the enum
                const enumData = parse.enums.read(buf, loader);
                console.log("Enum Data:", JSON.stringify(enumData, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
            }
        } catch (e) { }
    }
}

main();
