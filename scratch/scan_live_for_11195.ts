import * as fs from 'fs';
import { GameCacheLoader } from 'rsmv/cache/sqlite.js';
import { cacheMajors } from 'rsmv/constants.js';

async function scanAllFor11195() {
    const livePath = 'C:\\ProgramData\\Jagex\\RuneScape';
    const loader = new GameCacheLoader(livePath);

    console.log(`=== SCANNING ALL LIVE SCRIPTS FOR 11195 (0x2B5B) ===`);

    let allScriptIds: number[] = [];
    try {
        const index = await loader.getCacheIndex(cacheMajors.clientscript);
        if (Array.isArray(index)) {
            allScriptIds = index.map((entry, i) => i);
        } else if (typeof index === 'object') {
            allScriptIds = Object.keys(index).map(k => parseInt(k)).filter(id => !isNaN(id));
        }
    } catch (e) {
        console.log("Could not retrieve index, falling back to range scan...");
        for (let i = 1; i <= 30000; i++) allScriptIds.push(i);
    }

    const callers = [];
    const literal = Buffer.from([0x5B, 0x2B, 0x00, 0x00]);

    console.log(`Scanning ${allScriptIds.length} candidate scripts...`);

    // Extremely conservative processing: a small batch and explicit garbage collection hints
    const BATCH_SIZE = 100;
    for (let i = 0; i < allScriptIds.length; i += BATCH_SIZE) {
        const batch = allScriptIds.slice(i, i + BATCH_SIZE);

        for (const id of batch) {
            try {
                const buf = await loader.getFile(cacheMajors.clientscript, id);
                if (!buf) continue;

                if (buf.includes(literal)) {
                    callers.push({ id, method: 'literal' });
                } else {
                    for (let j = 0; j < buf.length - 5; j++) {
                        if (buf[j] === 0x00 && buf.readUInt32LE(j+1) === 11195) {
                            callers.push({ id, offset: j, method: 'push_int' });
                            break;
                        }
                    }
                }
            } catch (e) {
                // skip missing scripts
            }
        }
        process.stdout.write(`Processed ${Math.min(i + BATCH_SIZE, allScriptIds.length)}/${allScriptIds.length}... \r`);

        // To further reduce memory, we could potentially clear internal loader caches if they exist
        // but GameCacheLoader doesn't seem to have a clear() method.
    }

    console.log(`\nScan Complete.`);
    console.log(`Found ${callers.length} scripts referencing 11195:`);
    console.log(JSON.stringify(callers, null, 2));

    return callers;
}

scanAllFor11195().catch(console.error);
