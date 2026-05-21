import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";

async function main() {
    const loader = new GameCacheLoader("C:\\ProgramData\\Jagex\\RuneScape-BETA\\");
    console.log("Build number:", loader.getBuildNr());
}

main();
