import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";
import fs from "fs";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 703;
    const buf = await loader.getFileById(cacheMajors.interfaces, id);
    const iface = parse.interfaces.read(buf, loader);

    fs.writeFileSync("d:\\POG2\\scratch\\interface_703_dump.json", JSON.stringify(iface, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
    console.log(`Interface 703 dumped to scratch/interface_703_dump.json`);
}

main();
