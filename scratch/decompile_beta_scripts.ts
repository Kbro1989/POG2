
import { GameCacheLoader } from "../src/rsmv/cache/sqlite";
import { cacheMajors } from "../src/rsmv/constants";
import { renderClientScript } from "../src/rsmv/clientscript/index";
import * as fs from "fs";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const scripts = [4732, 15592];

    for (const id of scripts) {
        console.log(`Decompiling ClientScript ${id}...`);
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, id);
            const code = await renderClientScript(loader, buf, id);
            console.log(`--- Script ${id} ---`);
            console.log(code);
            console.log(`--------------------`);
            fs.writeFileSync(`scratch/script_${id}.ts`, code);
        } catch (e) {
            console.error(`Error decompiling script ${id}:`, e);
        }
    }
}

main();
