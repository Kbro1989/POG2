import * as path from 'path';
import * as fs from 'fs';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const inspectorPath = 'D:/D-sovereign-/cache_pedagogy/rsmv_inspector/dist';
const { parse } = require(path.join(inspectorPath, 'opdecoder.js'));
const { GameCacheLoader } = require(path.join(inspectorPath, 'cache', 'sqlite.js'));
const { ClientscriptObfuscation } = require(path.join(inspectorPath, 'clientscript', 'callibrator.js'));

async function analyzeScript7937() {
    const livePath = 'C:\\ProgramData\\Jagex\\RuneScape';
    const loader = new GameCacheLoader(livePath);

    console.log("=== ANALYZING SCRIPT 7937 (LIVE) ===");

    try {
        // 1. Initialize and run calibration
        console.log("Running calibration...");
        const deob = await ClientscriptObfuscation.create(loader, true);
        try {
            await deob.runAutoCallibrate(loader);
            console.log("Auto-calibrate successful.");
        } catch (e) {
            console.log("Auto-calibrate failed or partial:", e.message);
            deob.setNonObbedMappings();
        }

        const scriptBuffer = await loader.getFile(12, 7937);
        if (!scriptBuffer) {
            console.error("Could not find script 7937 in live cache.");
            return;
        }

        // Use the calibrated deob for parsing
        const scriptData = parse.clientscript.read(scriptBuffer, loader, { clientScriptDeob: deob });

        if (!scriptData || !scriptData.opcodedata) {
            console.log('ScriptData result:', scriptData);
            console.error('ScriptData is invalid or missing opcodedata');
            return;
        }

        console.log(`Script 7937 parsed. Opcode count: ${scriptData.opcodedata.length}`);

        let found19712 = false;
        let found11195 = false;

        for (let i = 0; i < scriptData.opcodedata.length; i++) {
            const op = scriptData.opcodedata[i];

            // Check for varbit 19712
            if (op.imm === 19712) {
                console.log(`🚩 FOUND Varbit 19712 at index ${i} (Opcode: ${op.opcode})`);
                found19712 = true;
            }

            // Check for script 11195 (likely a CALL)
            if (op.imm === 11195) {
                console.log(`🚩 FOUND Script Call 11195 at index ${i} (Opcode: ${op.opcode})`);
                found11195 = true;
            }
        }

        if (!found19712) console.log("❌ Varbit 19712 NOT found in script 7937.");
        if (!found11195) console.log("❌ Script 11195 NOT found in script 7937.");

    } catch (e) {
        console.error("Analysis failed:", e);
    }
}

analyzeScript7937().catch(console.error);
