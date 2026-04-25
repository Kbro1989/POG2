import { GameCacheLoader } from "../rsmv/cache/sqlite.js";
import { parse } from "../rsmv/opdecoder.js";
import { cacheMajors, cacheConfigPages } from "../rsmv/constants.js";
import * as fs from "fs";

async function research() {
    const source = new GameCacheLoader("C:\\ProgramData\\Jagex\\RuneScape");

    // 1. Extract Params (Config 11)
    try {
        const indices = await source.getCacheIndex(cacheMajors.config);
        const page = indices[cacheConfigPages.params];
        if (page) {
            const arch = await source.getFileArchive(page);
            const params = arch.map(f => {
                try { return { id: f.fileid, ...parse.params.read(f.buffer, source) }; } catch(e) { return null; }
            }).filter(p => p !== null);
            fs.writeFileSync("D:\\sovereign\\atlas\\system\\params_definitions.json", JSON.stringify(params, null, 2));
            console.log(`✅ Params Extracted: ${params.length}`);
        }
    } catch(e) { console.error("Error extracting params", e); }

    // 2. Sample DBRows for Quest Data
    try {
        // Just checking if dbrows has quest info
        // Not dumping all, just checking table sizes
        console.log("Checking DBRows for quests...");
    } catch(e) {}

    source.close();
}
research().catch(console.error);
