import { JagexCacheReader } from '../utils/JagexCacheReader.js';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const cachePath = 'C:\\ProgramData\\Jagex\\RuneScape\\js5-66.jcache';
    if (!fs.existsSync(cachePath)) {
        console.error(`Cache not found at ${cachePath}`);
        return;
    }

    console.log(`--- JAGEX CUTSCENE FORENSICS ---`);
    const reader = new JagexCacheReader(cachePath);

    try {
        // Major 66 (Cutscenes) often has entries under group 0 or 1.
        // Let's probe group 0, file 0-10
        for (let i = 0; i < 10; i++) {
            const entry = reader.readEntry(0, i);
            if (entry && entry.decompressed) {
                console.log(`Found Cutscene Group 0, File ${i}: ${entry.decompressed.length} bytes (Compression: ${(entry as any).compression})`);
                // Sample first 16 bytes
                console.log(`  Sample: ${entry.decompressed.slice(0, 16).toString('hex')}`);
            }
        }

        // Probe group 1
        for (let i = 0; i < 10; i++) {
            const entry = reader.readEntry(1, i);
            if (entry && entry.decompressed) {
                console.log(`Found Cutscene Group ${(entry as any).compression}): ${entry.decompressed.length} bytes (Compression: ${(entry as any).compression})`);
                console.log(`  Sample: ${entry.decompressed.slice(0, 16).toString('hex')}`);
            }
        }
    } catch (err) {
        console.error(`Forensics failed: ${err}`);
    } finally {
        reader.close();
    }
}

main().catch(console.error);

