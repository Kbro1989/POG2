import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const searchPattern = Buffer.from("Updates");

    // Search common majors
    const majors = [cacheMajors.interfaces, cacheMajors.enums, cacheMajors.clientscript];
    for (const major of majors) {
        console.log(`Searching Major ${major}...`);
        const index = await loader.getCacheIndex(major);
        for (const entry of index) {
            if (!entry) continue;
            try {
                const buf = await loader.getFileById(major, entry.minor);
                if (buf.indexOf(searchPattern) !== -1) {
                    console.log(`FOUND "Updates" in Major ${major} Minor ${entry.minor}`);
                }
            } catch (e) { }
        }
    }
}

main();
