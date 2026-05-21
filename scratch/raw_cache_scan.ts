import * as fs from 'fs';
import * as path from 'path';

const CACHE_DIR = 'C:/ProgramData/Jagex/RuneScape-BETA';

function scanFile(filePath: string, patterns: string[]) {
    const stats = fs.statSync(filePath);
    if (stats.size > 500 * 1024 * 1024) {
        console.log(`Skipping large file ${filePath} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        return;
    }
    
    const buffer = fs.readFileSync(filePath);
    for (const pattern of patterns) {
        const index = buffer.indexOf(Buffer.from(pattern, 'utf8'));
        if (index !== -1) {
            console.log(`Match for "${pattern}" in ${filePath} at offset ${index}`);
            // Extract context
            const start = Math.max(0, index - 50);
            const end = Math.min(buffer.length, index + 100);
            const context = buffer.slice(start, end).toString('utf8').replace(/[^\x20-\x7E]/g, '.');
            console.log(`Context: ...${context}...`);
        }
    }
}

const files = fs.readdirSync(CACHE_DIR);
const targetPatterns = ['Necromancy', 'Sailing', 'Astrology', 'Astronomy', 'Druidism', 'Taming', 'Bard'];

for (const file of files) {
    if (file.endsWith('.jcache')) {
        scanFile(path.join(CACHE_DIR, file), targetPatterns);
    }
}
