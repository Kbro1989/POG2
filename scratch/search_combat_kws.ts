import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const keywords = ["Ability", "Adrenaline", "Cooldown", "Special Attack", "stance"];

    const index = await loader.getCacheIndex(cacheMajors.clientscript);
    for (const entry of index) {
        if (!entry) continue;
        if (entry.minor < 10000 || entry.minor > 15000) continue; // Expanded range to be safe
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, entry.minor);
            for (const kw of keywords) {
                if (buf.includes(Buffer.from(kw, "utf-8"))) {
                    console.log(`FOUND keyword "${kw}" in Script ${entry.minor}`);
                }
            }
        } catch (e) { }
    }
}

main();
