import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheConfigPages, cacheMajors } from "../src/rsmv/constants.js";
import { FileParser } from "../src/rsmv/opdecoder.js";

const varbitInfoParser = new FileParser({
    "0x01": { "name": "varid", "read": "utribyte" },
    "0x02": { "name": "bits", "read": ["tuple", "ubyte", "ubyte"] },
    "0x03": { "name": "unk03", "read": "ubyte" },
    "0x04": { "name": "unk04", "read": "ubyte" }
});

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const varbitArchive = await loader.getArchiveById(cacheMajors.config, cacheConfigPages.varbits);
    for (const file of varbitArchive) {
        if (file.fileid === 0 || file.fileid < 10) {
            console.log(`Varbit ${file.fileid}:`, varbitInfoParser.read(file.buffer, loader));
        }
    }
}

main();
