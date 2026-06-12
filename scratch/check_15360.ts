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
    const file = varbitArchive.find(q => q.fileid === 15360);
    if (file) {
        console.log(`Varbit 15360:`, varbitInfoParser.read(file.buffer, loader));
    }
}

main();
