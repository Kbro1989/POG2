import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const searchPattern = Buffer.from("Import", "utf-8");

    const majors = [2, 12, 17]; // Config, Scripts, Enums
    for (const major of majors) {
        const index = await loader.getCacheIndex(major);
        for (const entry of index) {
            if (!entry) continue;
            try {
                const buf = await loader.getFileById(major, entry.minor);
                if (buf.includes(searchPattern)) {
                    console.log(`FOUND "Import" in Major ${major} Minor ${entry.minor}`);
                    if (major === 12) {
                        // Read strings to see context
                        const strings = [];
                        let start = -1;
                        for (let i = 0; i < buf.length; i++) {
                            if (buf[i] >= 32 && buf[i] <= 126) {
                                if (start === -1) start = i;
                            } else {
                                if (start !== -1 && i - start > 3) {
                                    strings.push(buf.slice(start, i).toString());
                                }
                                start = -1;
                            }
                        }
                        console.log(`Strings in Script ${entry.minor}:`, strings);
                    }
                }
            } catch (e) { }
        }
    }
}

main();
