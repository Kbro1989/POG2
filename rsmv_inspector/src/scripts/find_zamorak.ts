import { GameCacheLoader } from "../cache/sqlite";
import { cacheMajors } from "../constants";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function findNpcByName(targetName: string) {
    const source = new GameCacheLoader(CACHE_DIR);
    const index = await source.getCacheIndex(cacheMajors.npcs);

    for (let i = 0; i < index.length; i++) {
        const file = await source.getFile(cacheMajors.npcs, i, 0);
        if (file && file.toString("utf8").toLowerCase().includes(targetName.toLowerCase())) {
            console.log(`🎯 Found "${targetName}" in NPC ID: ${i}`);
        }
    }
    source.close();
}

findNpcByName("Zamorak, Lord of Chaos").catch(console.error);
