import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const searchPattern = Buffer.from("favorite world", "utf-8");

    // Search Interfaces and Scripts
    const majors = [cacheMajors.interfaces, cacheMajors.clientscript];
    for (const major of majors) {
        console.log(`Searching Major ${major}...`);
        const index = await loader.getCacheIndex(major);
        for (const entry of index) {
            if (!entry) continue;
            try {
                const buf = await loader.getFileById(major, entry.minor);
                if (buf.includes(searchPattern)) {
                    console.log(`FOUND string in Major ${major} Minor ${entry.minor}`);
                }
            } catch (e) { }
        }
    }
}

main();
