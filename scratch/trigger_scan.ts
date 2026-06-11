import * as fs from 'fs';
import { join } from 'path';
import { GameCacheLoader } from 'rsmv/cache/sqlite.js';
import { cacheMajors } from 'rsmv/constants.js';

async function scanForTrigger() {
    const livePath = 'C:\\ProgramData\\Jagex\\RuneScape';
    const loader = new GameCacheLoader(livePath);

    // Priority scripts we're interested in
    const scripts = [7888, 7893, 7897, 7898, 7901, 7937, 10642, 10896, 11195];

    console.log(`=== SCANNING LIVE CACHE FOR TRIGGER PATTERNS ===`);
    console.log(`Target: Script 11195 (0x2B5B), Opcode 40 (0x28)`);
    console.log(`Pattern: 5B 2B 00 00 28\n`);

    for (const id of scripts) {
        try {
            const buf = await loader.getFile(cacheMajors.clientscript, id);
            if (!buf) continue;

            let found = false;
            for (let i = 0; i < buf.length - 4; i++) {
                // Check for [11195] [Opcode 40]
                if (buf[i] === 0x5B && buf[i+1] === 0x2B && buf[i+2] === 0x00 && buf[i+3] === 0x00 && buf[i+4] === 0x28) {
                    console.log(`🚩 FOUND TRIGGER in Script ${id} at offset ${i}: 5B 2B 00 00 28`);
                    found = true;
                }
            }
            if (!found) {
                // Also look for any CALL 40 and see what it calls
                for (let i = 0; i < buf.length; i++) {
                    if (buf[i] === 0x28) {
                        if (i >= 4) {
                            const callee = buf.readInt32LE(i - 4);
                            if (callee !== 0) {
                                // We only log if it's a script we care about or looks like a high-id script
                                if (callee === 11195) {
                                    console.log(`🚩 FOUND TRIGGER in Script ${id} at offset ${i-4}: Callee ${callee}`);
                                }
                            }
                        }
                    }
                }
            }
        } catch (e) {
            console.error(`Error scanning script ${id}:`, e);
        }
    }
}

scanForTrigger().catch(console.error);
