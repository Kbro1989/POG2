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

    const id = 4732;
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    const varbitArchive = await loader.getArchiveById(cacheMajors.config, cacheConfigPages.varbits);
    const potentialIds = [];
    for (const file of varbitArchive) {
        try {
            const data = varbitInfoParser.read(file.buffer, loader);
            if (data.bits && data.bits[1] - data.bits[0] >= 30) {
                potentialIds.push(file.fileid);
            }
        } catch (e) { }
    }

    console.log(`Searching for ${potentialIds.length} potential varbit IDs in script 4732...`);
    for (const vid of potentialIds) {
        const vBuf = Buffer.alloc(4);
        vBuf.writeUInt32BE(vid);
        if (buf.indexOf(vBuf) !== -1) {
            console.log(`FOUND Varbit ${vid} in script 4732!`);
        }
    }
}

main();
