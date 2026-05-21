
import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors, cacheConfigPages } from "../src/rsmv/constants.js";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";

function unpackCoord(packed: number) {
    const plane = (packed >> 28) & 0x3;
    const x = (packed >> 14) & 0x3FFF;
    const z = packed & 0x3FFF;
    return { x, z, plane };
}

async function run() {
    const source = new GameCacheLoader(CACHE_DIR);
    const configIndex = await source.getCacheIndex(cacheMajors.config);
    const dbrowsPage = configIndex.find((p: any) => p && p.minor === cacheConfigPages.dbrows);

    if (!dbrowsPage) return;

    const arch = await source.getFileArchive(dbrowsPage);
    console.log(`Scanning ${arch.length} DBRows for Wendlewick coordinates...`);

    const minX = 2800, maxX = 3100, minZ = 2100, maxZ = 2500;

    let found = 0;
    for (const file of arch) {
        const buf = file.buffer;
        // Scan for 4-byte uints (Big Endian)
        for (let i = 0; i <= buf.length - 4; i++) {
            const val = buf.readUInt32BE(i);
            const { x, z, plane } = unpackCoord(val);
            if (x >= minX && x <= maxX && z >= minZ && z <= maxZ && plane === 0) {
                console.log(`Found potential coord (${x}, ${z}) at Row ${file.fileid}, Offset ${i}`);
                found++;
                if (found > 20) break;
            }
        }
        if (found > 20) break;
    }
}

run();
