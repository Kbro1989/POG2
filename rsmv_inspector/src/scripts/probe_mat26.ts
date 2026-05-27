import { GameCacheLoader } from "../cache/sqlite";
import { cacheMajors } from "../constants";

async function probe() {
    const c = new GameCacheLoader('C:/ProgramData/Jagex/RuneScape-BETA');
    console.log("Fetching materials archive (Index 26, Archive 0)...");
    const matarch = await c.getArchiveById(cacheMajors.materials, 0);
    console.log(`Loaded ${matarch.length} material definitions.`);
    
    const idsToFind = [2082, 2109, 2368, 2397];
    for (const id of idsToFind) {
        const mat = matarch.find(f => f.fileid === id);
        if (mat) {
            console.log(`FOUND ${id}! Length: ${mat.buffer.length}`);
        } else {
            console.log(`${id} NOT FOUND in subfiles.`);
        }
    }
}
probe().catch(console.error);
