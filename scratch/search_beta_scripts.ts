
import { GameCacheLoader } from "../src/rsmv/cache/sqlite";
import { cacheMajors } from "../src/rsmv/constants";
import { parse } from "../src/rsmv/opdecoder";
import * as fs from "fs";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    console.log(`Loading cache from ${cachePath}...`);

    const loader = new GameCacheLoader(cachePath);
    const index = await loader.getCacheIndex(cacheMajors.clientscript);

    console.log(`Found ${index.length} clientscripts.`);

    for (const entry of index) {
        if (!entry) continue;
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, entry.minor);
            // We don't have a full decompiler here, but we can search for strings in the raw bytecode or the header.
            // ClientScripts can have string constants.
            if (buf.toString('ascii').toLowerCase().includes("import save")) {
                console.log(`FOUND "import save" in ClientScript ${entry.minor}`);
            }
            if (buf.toString('ascii').toLowerCase().includes("import_save")) {
                console.log(`FOUND "import_save" in ClientScript ${entry.minor}`);
            }
        } catch (e) {
            // console.error(`Error reading script ${entry.minor}:`, e);
        }
    }
    console.log("Done.");
}

main();
