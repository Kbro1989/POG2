import { GameCacheLoader } from "../rsmv/dist/cache/sqlite.js";
import { cacheMajors } from "../rsmv/dist/constants.js";

async function analyzeScript(id: number, targetVarbits: number[]) {
    const cachePath = "C:\\ProgramData\\Jagex\\RuneScape-BETA";
    const loader = new GameCacheLoader(cachePath);
    const buf = await loader.getFileById(cacheMajors.clientscript, id);

    if (!buf) {
        console.log(`Script ${id} not found.`);
        return;
    }

    console.log(`--- Analysis for Script ${id} ---`);

    // 1. String Extraction
    const strings = [];
    let start = -1;
    for (let i = 0; i < buf.length; i++) {
        if (buf[i] >= 32 && buf[i] <= 126) {
            if (start === -1) start = i;
        } else {
            if (start !== -1 && i - start > 3) {
                strings.push(buf.slice(start, i).toString());
            }
            start = -1;
        }
    }
    console.log(`Strings:`, strings);

    // 2. Varbit Scanning
    const varbitMatches = [];
    for (let offset = 0; offset < buf.length - 1; offset++) {
        if (offset + 2 <= buf.length) {
            const val16 = buf.readUInt16BE(offset);
            if (targetVarbits.includes(val16)) {
                varbitMatches.push({ offset, value: val16 });
            }
        }
        if (offset + 4 <= buf.length) {
            const val32 = buf.readInt32BE(offset);
            if (targetVarbits.includes(val32)) {
                varbitMatches.push({ offset, value: val32 });
            }
        }
    }
    console.log(`Varbit Matches:`, varbitMatches);

    // 3. Script references (search for 11195 in bytecode)
    const scriptMatches = [];
    for (let offset = 0; offset < buf.length - 1; offset++) {
        if (offset + 2 <= buf.length) {
            if (buf.readUInt16BE(offset) === 11195) {
                scriptMatches.push({ offset, value: 11195 });
            }
        }
    }
    console.log(`References to Script 11195:`, scriptMatches);
}

async function main() {
    const targetVarbits = [28749, 19712];
    await analyzeScript(13914, targetVarbits);
}

main().catch(console.error);
