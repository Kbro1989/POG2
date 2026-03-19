import * as fs from 'fs';
import * as path from 'path';

const cacheDir = 'C:\\ProgramData\\Jagex\\RuneScape';
const target = 'Pick Of Gods';

const targets = [
    Buffer.from(target, 'utf8'),
    Buffer.from(target, 'utf16le')
];

function searchFile(filePath: string) {
    console.log(`Searching ${path.basename(filePath)}...`);
    const buffer = fs.readFileSync(filePath);
    
    for (const t of targets) {
        let index = buffer.indexOf(t);
        while (index !== -1) {
            console.log(`FOUND "${target}" (${t.length === target.length ? 'UTF-8' : 'UTF-16LE'}) in ${path.basename(filePath)} at offset ${index}`);
            index = buffer.indexOf(t, index + 1);
        }
    }
}

const files = fs.readdirSync(cacheDir).filter(f => f.endsWith('.jcache'));
for (const f of files) {
    searchFile(path.join(cacheDir, f));
}

console.log('Search complete.');
