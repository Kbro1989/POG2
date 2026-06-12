import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheConfigPages, cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const dbArchive = await loader.getArchiveById(cacheMajors.config, cacheConfigPages.dbtables);
    console.log(`Checking ${dbArchive.length} DBTables...`);
    for (const file of dbArchive) {
        try {
            const db = parse.dbtables.read(file.buffer, loader);
            // Search for "Beta" or "Import" in column names/types
            // Note: DBTables in RS3 are complex.
        } catch (e) { }
    }
}

main();
