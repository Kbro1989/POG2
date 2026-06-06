import { GameCacheLoader } from "../cache/sqlite";
import { cacheMajors } from "../constants";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

async function findNpcByAnim(animGroup: number) {
    const source = new GameCacheLoader(CACHE_DIR);
    const index = await source.getCacheIndex(cacheMajors.npcs);

    for (let i = 0; i < index.length; i++) {
        const file = await source.getFile(cacheMajors.npcs, i, 0);
        if (file) {
            // Very naive check for animation group in the binary - 
            // the full definition is packed, but looking for the ID sequence.
            // A more robust check would involve proper parsing but this suffices for discovery.
            if (file.includes(Buffer.from([0x00, 0x12, 0x56]))) { // 4694 = 0x1256
                 console.log(`🎯 Found potential match for AnimGroup ${animGroup} in NPC ID: ${i}`);
            }
        }
    }
    source.close();
}

findNpcByAnim(4694).catch(console.error);
