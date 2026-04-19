import fs from 'fs';
import { GameCacheLoader } from './tmp_rsmv_inspect/src/cache/sqlite.js';
import { parse } from './tmp_rsmv_inspect/src/opdecoder.js';

async function extractRecentRibbonHUD() {
    console.log("Locating recent RS3 Interface data for the Ribbon...");
    const cache = new GameCacheLoader('C:\\ProgramData\\Jagex\\RuneScape');
    cache.buildnr = 940; // Force recent RS3 build logic
    
    // The Ribbon is Interface 1430 to 1433 in modern RS3 and 1448
    const targetInterfaces = [1430, 1431, 1432, 1433, 1448];
    const extractedData = [];
    const ribbonKeys = ['hero', 'powers', 'adventures', 'community', 'customisations', 'options', 'metrics', 'upgrades'];

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
                    const textContent = comp.textdata?.text || comp.text || "";
                    if (textContent || comp.spriteid !== undefined || comp.spritedata) {
                        const sprite = comp.spritedata?.spriteid || comp.spriteid;
                        if (sprite !== undefined && sprite !== -1) {
                            extractedData.push({
                                interface: id,
                                component: compId,
                                text: textContent,
                                spriteId: sprite
                            });
                        }
                    }
                    compId++;
                } catch(e) { break; }
            }
        } catch (err) {
            console.error(`Failed to parse interface ${id}:`, err.message);
        }
    }
    
    console.log("Filtering hits for the Ribbon definitions...");
    const hits = extractedData.filter(d => 
        d.text && ribbonKeys.some(k => d.text.toLowerCase().includes(k))
    );

    if (hits.length > 0) {
        console.log("HUD Forensics extracted the following Ribbon/Interface Sprite Nodes:");
        console.table(hits);
        fs.writeFileSync("ribbon_forensics.json", JSON.stringify(hits, null, 2));
    } else {
        console.log("No text hits found on the immediate IDs. Dumping all identified sprites on those interfaces:");
        console.table(extractedData.slice(0, 30));
    }
    
    cache.close();
}

extractRecentRibbonHUD().then(() => process.exit(0)).catch(e => console.error(e));
