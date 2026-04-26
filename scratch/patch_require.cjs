const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if(file.endsWith('.ts') || file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}
const files = walk('D:/POG2/src/rsmv');
let changedCount = 0;
for(const f of files) {
    let code = fs.readFileSync(f, 'utf8');
    // Check for require( that isn't already handled
    if (code.includes('require(') && !code.includes('createRequire')) {
        const shim = "import { createRequire } from 'module';\nconst require = createRequire(import.meta.url);\n";
        fs.writeFileSync(f, shim + code);
        changedCount++;
    }
}
console.log('Injected require shim into ' + changedCount + ' files in rsmv');
