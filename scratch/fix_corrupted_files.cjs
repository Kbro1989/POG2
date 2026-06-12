const fs = require('fs');
const path = require('path');

function walk(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (file.endsWith('.ts')) {
            const content = fs.readFileSync(fullPath, 'utf8').trim();
            if (content.startsWith('{') && content.includes('"code":')) {
                try {
                    const data = JSON.parse(content);
                    if (data.code) {
                        fs.writeFileSync(fullPath, data.code);
                        console.log(`Fixed corrupted file: ${fullPath}`);
                    }
                } catch (e) {
                    // Not valid JSON, skip
                }
            }
        }
    });
}

const targetDir = process.argv[2] || 'src';
console.log(`Scanning ${targetDir}/ for corrupted JSON-wrapped files...`);
walk(targetDir);
console.log('Done.');
