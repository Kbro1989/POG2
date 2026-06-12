import * as fs from 'fs';
import { join } from 'path';

async function rawSearch() {
    const filePath = 'POG2/scratch/live_extracts/script_7937.bin';
    if (!fs.existsSync(filePath)) {
        console.error("File not found:", filePath);
        return;
    }

    const buf = fs.readFileSync(filePath);
    console.log(`Analyzing ${filePath} (${buf.length} bytes)...`);

    const targets = [
        { id: 19712, hex: '4d00' },
        { id: 11195, hex: '2bbb' }
    ];

    for (const target of targets) {
        let found = false;
        for (let i = 0; i < buf.length - 1; i++) {
            if (buf[i] === parseInt(target.hex.slice(0, 2), 16) &&
                buf[i+1] === parseInt(target.hex.slice(2, 4), 16)) {
                console.log(`🚩 FOUND target ${target.id} (0x${target.hex}) at offset ${i}`);
                found = true;
            }
        }
        if (!found) console.log(`❌ target ${target.id} (0x${target.hex}) NOT found.`);
    }
}

rawSearch().catch(console.error);
