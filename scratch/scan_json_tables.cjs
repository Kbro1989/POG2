const fs = require('fs');
const path = require('path');

const searchDirs = [
    'd:/POG2',
    'D:/sovereign'
];

function scanDir(dir) {
    let results = [];
    let list;
    try {
        list = fs.readdirSync(dir);
    } catch (e) {
        return results;
    }
    for (const file of list) {
        const fullPath = path.join(dir, file);
        let stat;
        try {
            stat = fs.statSync(fullPath);
        } catch (e) {
            continue;
        }
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.wrangler' && file !== '.agents') {
                results = results.concat(scanDir(fullPath));
            }
        } else if (file.endsWith('.json')) {
            // Check file size. Only look at files > 100 bytes to filter out trivial one-liners
            if (stat.size > 100) {
                try {
                    // Read first 2000 chars to inspect structure
                    const fd = fs.openSync(fullPath, 'r');
                    const buffer = Buffer.alloc(2000);
                    const bytesRead = fs.readSync(fd, buffer, 0, 2000, 0);
                    fs.closeSync(fd);
                    const head = buffer.toString('utf8', 0, bytesRead);

                    // Check if it looks like a DB table or rows mapping
                    const isTable = head.includes('"tableId"') || head.includes('"dbTable"') || head.includes('"dbRowId"') || head.includes('"table"') || head.includes('"columns"');
                    if (isTable) {
                        results.push({
                            path: fullPath,
                            size: stat.size,
                            snippet: head.substring(0, 300).replace(/\s+/g, ' ')
                        });
                    }
                } catch (e) {}
            }
        }
    }
    return results;
}

const allMatches = [];
for (const dir of searchDirs) {
    console.log(`Scanning ${dir}...`);
    allMatches.push(...scanDir(dir));
}

console.log('\n--- SCAN RESULTS ---');
console.log(JSON.stringify(allMatches, null, 2));
