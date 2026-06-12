import { GameCacheLoader } from "../src/rsmv/cache/sqlite.js";
import { cacheMajors, cacheMapFiles } from "../src/rsmv/constants.js";
import { parse } from "../src/rsmv/opdecoder.js";
import * as fs from "fs";
import * as path from "path";

const CACHE_DIR = "C:\\ProgramData\\Jagex\\RuneScape";
const OUTPUT_ROOT = "D:\\POG2\\atlas\\spatial\\world_extract";
const WORLD_STRIDE = 128;

if (!fs.existsSync(OUTPUT_ROOT)) fs.mkdirSync(OUTPUT_ROOT, { recursive: true });

async function run() {
    const targetX = 50;
    const targetZ = 50;
    const minor = targetZ * WORLD_STRIDE + targetX;

    console.log(`🚀 Extracting MapSquare ${targetX}_${targetZ} (ID: ${minor})...`);

    const source = new GameCacheLoader(CACHE_DIR);
    const msIndex = await source.getCacheIndex(cacheMajors.mapsquares);
    const sq = msIndex.find(p => p && p.minor === minor);

    if (!sq) {
        console.error(`❌ MapSquare ${targetX}_${targetZ} not found in index.`);
        return;
    }

    const chunkArch = await source.getFileArchive(sq);
    const tileFlags = [];
    const nxtTilesSubIdx = sq.subindices.indexOf(cacheMapFiles.square_nxt);

    if (nxtTilesSubIdx !== -1 && chunkArch[nxtTilesSubIdx]) {
        console.log("Reading NXT tiles...");
        const tilesNxt = parse.mapsquareTilesNxt.read(chunkArch[nxtTilesSubIdx].buffer, source) as any;
        if (tilesNxt) {
            for (let plane = 0; plane < 4; plane++) {
                const levelArray = tilesNxt[`level${plane}`];
                if (!levelArray) continue;
                for (let i = 0; i < levelArray.length; i++) {
                    const tile = levelArray[i];
                    if (!tile) continue;
                    tileFlags.push({
                        x: Math.floor(i / 66),
                        z: i % 66,
                        plane: plane,
                        collision: tile.flags ?? 0,
                        height: tile.height ?? null,
                    });
                }
            }
        }
    }

    const result = {
        chunkX: targetX,
        chunkZ: targetZ,
        tiles: tileFlags,
        _meta: {
            source: CACHE_DIR,
            extractedAt: new Date().toISOString()
        }
    };

    const outFile = path.join(OUTPUT_ROOT, `ms_${targetX}_${targetZ}.json`);
    fs.writeFileSync(outFile, JSON.stringify(result, null, 2));
    console.log(`✅ Extracted to ${outFile}`);
}

run().catch(console.error);
