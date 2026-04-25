import { HUDForensicsLimb } from '../limbs/spatial/HUDForensicsLimb.js';
import * as fs from 'fs';
import { createRequire } from 'module';
import * as path from 'path';

const require = createRequire(import.meta.url);
// Initialize SQLite connection explicitly to the D:\sovereign substrate
const { GameCacheLoader } = require("../../tmp_rsmv_inspect/src/cache/sqlite.js");
const { parse } = require("../../tmp_rsmv_inspect/src/opdecoder.js");

async function extractRecentRibbonHUD() {
    console.log("Locating recent RS3 Interface data for the Ribbon...");
    const cache = new GameCacheLoader('D:\\sovereign');
    cache.buildnr = 940; // Force recent RS3 build logic
    
    const limb = new HUDForensicsLimb();
    
    // The Ribbon is Interface 1430 to 1433 in modern RS3 typically.
    // Let's specifically parse these.
    const targetInterfaces = [1430, 1431, 1432, 1433, 1448];
    const extractedData = [];

    for (const id of targetInterfaces) {
        try {
            const rawBuffer = await cache.getFile(3, id);
            if (!rawBuffer) continue;
            
            const state = {
                isWrite: false,
                buffer: rawBuffer,
                stack: [],
                hiddenstack: [],
                scan: 0,
                endoffset: rawBuffer.byteLength,
                args: { ...cache.getDecodeArgs(), clientVersion: 940 }
            };
            
            let compId = 0;
            while (state.scan < state.endoffset) {
                try {
                    const comp = parse.interfaces.parser.read(state);
                    if (comp.text || comp.spriteid !== undefined || comp.spritedata) {
                        const sprite = comp.spritedata?.spriteid || comp.spriteid;
                        if (sprite !== undefined && sprite !== -1) {
                            extractedData.push({
                                interface: id,
                                component: compId,
                                text: comp.textdata?.text || comp.text,
                                spriteId: sprite
                            });
                        }
                    }
                    compId++;
                } catch(e) { break; }
            }
        } catch {}
    }
    
    if (extractedData.length > 0) {
        console.log("HUD Forensics extracted the following Ribbon/Interface Sprite Nodes:");
        console.table(extractedData.filter(d => d.text && d.text.trim().length > 0));
        fs.writeFileSync("ribbon_forensics.json", JSON.stringify(extractedData, null, 2));
    } else {
        console.log("Scan complete, no direct hits found in 143x series, running secondary heuristic...");
    }
}

extractRecentRibbonHUD().then(() => process.exit(0));
