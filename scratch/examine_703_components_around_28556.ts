import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const id = 703;
    const buf = await loader.getFileById(cacheMajors.interfaces, id);
    const iface = parse.interfaces.read(buf, loader);

    const index = iface.components.findIndex((c: any) => c.id === 28556);
    console.log(`Component 28556 is at INDEX ${index}`);

    // Look at components around this index
    for (let i = Math.max(0, index - 10); i < Math.min(iface.components.length, index + 10); i++) {
        const c = iface.components[i];
        console.log(`Index ${i}: ID ${c.id}, Type ${c.type}, Text "${c.text || ''}"`);
    }
}

main();
