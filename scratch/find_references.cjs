const fs = require('fs');
const path = require('path');

function searchDir(dir, query) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                searchDir(fullPath, query);
            }
        } else if (file.endsWith('.ts') || file.endsWith('.js')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes(query)) {
                console.log(`Found "${query}" in ${fullPath}`);
            }
        }
    }
}

console.log("Searching for setSovereignRoot...");
searchDir('d:\\POG2\\src', 'setSovereignRoot');
console.log("Searching for setProjectRoot...");
searchDir('d:\\POG2\\src', 'setProjectRoot');
console.log("Searching for getAtlasSpatialPath...");
searchDir('d:\\POG2\\src', 'getAtlasSpatialPath');
