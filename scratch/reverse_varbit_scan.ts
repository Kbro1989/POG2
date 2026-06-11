import { GameCacheLoader } from "../rsmv/dist/cache/sqlite.js";
import { cacheMajors } from "../rsmv/dist/constants.js";

async function main() {
    const targetVarbit = 19712;
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);

    console.log(`=== Reverse Varbit Scan for ID: ${targetVarbit} ===`);

    // We need to scan a reasonable range of scripts.
    // Client scripts usually range from 0 to ~20000.
    const SCAN_RANGE = 20000;
    const matches = [];

    for (let scriptId = 0; scriptId < SCAN_RANGE; scriptId++) {
        try {
            const buf = await loader.getFileById(cacheMajors.clientscript, scriptId);
            if (!buf || buf.length < 2) continue;

            let found = false;
            for (let offset = 0; offset < buf.length - 1; offset++) {
                // 16-bit BE
                if (offset + 2 <= buf.length) {
                    if (buf.readUInt16BE(offset) === targetVarbit) {
                        found = true;
                    }
                }
                // 32-bit BE
                if (offset + 4 <= buf.length) {
                    if (buf.readInt32BE(offset) === targetVarbit) {
                        found = true;
                    }
                }
                if (found) break;
            }

            if (found) {
                matches.push(scriptId);
                process.stdout.write(`\rFound in script: ${scriptId} ... `);
            }
        } catch (e) {
            // Script not in cache
        }
    }

    console.log(`\n\nScan complete. All scripts referencing varbit ${targetVarbit}:`);
    console.log(matches.sort((a, b) => a - b).join(', '));
}

main().catch(console.error);
