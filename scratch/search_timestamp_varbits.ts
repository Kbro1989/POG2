import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheConfigPages, cacheMajors } from "../src/rsmv/constants.js";
import { FileParser } from "../src/rsmv/opdecoder.js";

const varbitInfoParser = new FileParser({
    "0x01": { "name": "varid", "read": "utribyte" },
    "0x02": { "name": "bits", "read": ["tuple", "ubyte", "ubyte"] }
});

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const varbitArchive = await loader.getArchiveById(cacheMajors.config, cacheConfigPages.varbits);
    for (const file of varbitArchive) {
        const data = varbitInfoParser.read(file.buffer, loader);
        if (data.bits && data.bits[1] - data.bits[0] >= 30) {
            console.log(`Potential Timestamp Varbit ${file.fileid}: Varp ${data.varid} Bits ${data.bits[0]}-${data.bits[1]}`);
        }
    }
}

main();
