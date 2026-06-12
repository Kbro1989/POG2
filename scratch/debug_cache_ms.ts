
import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { getrsmvCachePath } from "../src/utils/SovereignPathResolver.js";
import * as fs from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function run() {
    const cachePath = getrsmvCachePath();
    console.log(`Cache Path: ${cachePath}`);
    if (!fs.existsSync(cachePath)) {
        console.error("Cache path does not exist.");
        return;
    }

    const source = new GameCacheLoader(cachePath);
    try {
        const index = await source.getCacheIndex(cacheMajors.mapsquares);
        const valid = index.filter(Boolean);
        console.log(`Total Mapsquare Archives: ${valid.length}`);

        // Search for mapsquare (49, 50) specifically
        // Try other common formats
        const formats = [
            { name: "x + z * 128", val: 49 + (50 * 128) },
            { name: "(x << 8) | z", val: (49 << 8) | 50 },
            { name: "(z << 8) | x", val: (50 << 8) | 49 },
            { name: "x + z * 256", val: 49 + (50 * 256) }
        ];

        for (const format of formats) {
            const found = valid.find(e => e.minor === format.val);
            if (found) {
                console.log(`FOUND format ${format.name}: ID ${format.val}`);
            } else {
                console.log(`NOT found format ${format.name}: ID ${format.val}`);
            }
        }

        // Print some samples
        console.log("Samples (first 20):", valid.slice(0, 20).map(e => e.minor));

    } catch (e) {
        console.error("Error reading index:", e);
    }
}

run();
