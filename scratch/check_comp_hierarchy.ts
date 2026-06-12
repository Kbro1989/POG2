import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const buf = await loader.getFileById(cacheMajors.interfaces, 703);
    const iface = parse.interfaces.read(buf, loader);

    const comp = iface.find(q => q.id === 28556);
    if (comp) {
        console.log(`Component 28556 details:`, comp);
        if (comp.parentid !== -1) {
            const parent = iface.find(q => q.id === comp.parentid);
            console.log(`Parent ${comp.parentid} details:`, parent);
        }
    }
}

main();
