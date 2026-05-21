import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors } from "../src/rsmv/constants.js";
import { ClientscriptObfuscation } from "../src/rsmv/clientscript/callibrator.js";

async function main() {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    const callibrator = new ClientscriptObfuscation();
    // No init() needed? I'll check.

    const scriptId = 4732;
    // The calibrateScript method is not in the list.
    // I'll use runAutoCallibrate if I have a source.
    // Since I don't have a source, I'll try to find a simpler way.
    if (solution) {
        console.log("Callibration successful!");
        console.log("Opcodes:", JSON.stringify(solution.opmap, null, 2));
    } else {
        console.log("Callibration failed.");
    }
}

main();
