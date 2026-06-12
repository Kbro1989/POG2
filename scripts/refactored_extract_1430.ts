/**
 * Refactored Extractor: standardized_interface_1430.ts
 * Pulls from beta cache, outputs clean schema for React consumption.
 */
import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const BETA_CACHE_PATH = 'C:/ProgramData/Jagex/RuneScape-BETA';
const OUTPUT_PATH = 'D:/sovereign/cache_pedagogy/atlas/interfaces/interface_1430_standard.json';
const RSMV_PATH = 'D:/sovereign/cache_pedagogy/rsmv_inspector';

const { GameCacheLoader } = require(path.join(RSMV_PATH, 'dist', 'cache', 'sqlite.js'));
const { parse } = require(path.join(RSMV_PATH, 'dist', 'opdecoder.js'));

function makeState(cache: any, buf: Buffer) {
    return {
        isWrite: false,
        buffer: buf,
        stack: [],
        hiddenstack: [],
        scan: 0,
        endoffset: buf.byteLength,
        args: { ...cache.getDecodeArgs(), clientVersion: 1149 }
    };
}

async function main() {
    const cache = new GameCacheLoader(BETA_CACHE_PATH);
    cache.buildnr = 1149;

    const archive = await cache.getArchiveById(3, 1430);
    const components = archive.map((sub: any) => {
        try {
            const state = makeState(cache, sub.buffer);
            const comp = parse.interfaces.parser.read(state);
            return {
                componentId: sub.fileid,
                type: comp.type || "CONTAINER",
                position: { x: comp.x || 0, y: comp.y || 0 },
                dimensions: { w: comp.width || 0, h: comp.height || 0 },
                spriteId: comp.spritedata?.spriteid || comp.spriteid || null,
                text: comp.textdata?.text || comp.text || null,
                hidden: !!comp.hidden
            };
        } catch { return null; }
    }).filter(Boolean);

    const output = {
        interfaceId: 1430,
        totalComponents: components.length,
        components,
        metadata: {
            name: "Action Bar",
            layer: "CORE_GAMEPLAY",
            extractedAt: new Date().toISOString()
        }
    };

    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(output, null, 2));
    console.log(`[SAVED] Standardized interface 1430 to: ${OUTPUT_PATH}`);
}

main().catch(console.error);
