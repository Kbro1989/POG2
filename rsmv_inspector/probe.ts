import { GameCacheLoader } from "./src/cache/sqlite.js";

async function run() {
    const c = new GameCacheLoader('C:/ProgramData/Jagex/RuneScape-BETA');
    const b = await c.getFile(26, 2082);
    if (!b) {
        console.log("mat2082 is null in index 26");
    } else {
        console.log("mat2082 len:", b.length, "first4:", Array.from(b.slice(0, 4)));
    }
}
run().catch(console.error);
