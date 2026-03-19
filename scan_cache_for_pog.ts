import fs from 'fs';
import path from 'path';

const cacheDir = 'C:\\ProgramData\\Jagex\\RuneScape';
const searchTerm = Buffer.from('Pick Of Gods', 'utf8');

async function scanCache() {
    const files = fs.readdirSync(cacheDir);
    console.log(`Scanning ${files.length} cache files for "${searchTerm}"...`);

    for (const file of files) {
        if (!file.endsWith('.jcache')) continue;
        const filePath = path.join(cacheDir, file);
        const stats = fs.statSync(filePath);
        
        // Skip very large files if needed, but let's try reading in 10MB chunks
        const fd = fs.openSync(filePath, 'r');
        const buffer = Buffer.alloc(10 * 1024 * 1024);
        let bytesRead;
        let pos = 0;

        while ((bytesRead = fs.readSync(fd, buffer, 0, buffer.length, pos)) > 0) {
            if (buffer.indexOf(searchTerm) !== -1) {
                console.log(`MATCH FOUND in ${file} at position ${pos + buffer.indexOf(searchTerm)}`);
            }
            pos += bytesRead - searchTerm.length; // Overlap for boundary cases
            if (pos < 0) pos = 0;
        }
        fs.closeSync(fd);
    }
    console.log('Scan complete.');
}

scanCache().catch(console.error);
