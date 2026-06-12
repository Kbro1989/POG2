import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 703;
    const buf = await loader.getFileById(cacheMajors.interfaces, id);
    const iface = parse.interfaces.read(buf, loader);

    console.log(`Interface ${id} has ${iface.components.length} components.`);

    const comp = iface.components.find((c: any) => c.id === 28556);
    if (comp) {
        console.log("Found Component 28556:", JSON.stringify(comp, null, 2));
    } else {
        console.log("Component 28556 not found in parsed structure.");
        // Try searching by index
        const compByIndex = iface.components[28556];
        if (compByIndex) {
            console.log("Found component at INDEX 28556:", JSON.stringify(compByIndex, null, 2));
        }
    }
}

main();
