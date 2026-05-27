// Extract material subfile from archive 0 in index 26
import { GameCacheLoader } from "./src/cache/sqlite.js";
import { cacheMajors } from "./src/constants.js";

async function run() {
    const c = new GameCacheLoader('C:/ProgramData/Jagex/RuneScape-BETA');
    
    console.log("Fetching materials archive (Index 26, Archive 0)...");
    try {
        const matarch = await c.getArchiveById(cacheMajors.materials, 0);
        console.log(`Loaded ${matarch.length} material definitions.`);
        
        const mat2082 = matarch.find(f => f.fileid === 2082);
        if (mat2082) {
            console.log("FOUND 2082!");
            console.log("Length:", mat2082.buffer.length);
            console.log("First 4 bytes:", Array.from(mat2082.buffer.slice(0, 4)));
        } else {
            console.log("2082 NOT FOUND in subfiles.");
        }

        const mat2109 = matarch.find(f => f.fileid === 2109);
        if (mat2109) {
            console.log("FOUND 2109!");
            console.log("Length:", mat2109.buffer.length);
            console.log("First 4 bytes:", Array.from(mat2109.buffer.slice(0, 4)));
        }
    } catch (e) {
        console.error(e);
    }
}
run().catch(console.error);
