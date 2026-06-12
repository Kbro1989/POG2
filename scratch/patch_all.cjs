const fs = require('fs');
const path = require('path');
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) results.push(file);
        }
    });
    return results;
}
const files = walk('D:/POG2/src/rsmv');
let changedCount = 0;
for (const f of files) {
    let code = fs.readFileSync(f, 'utf8');
    let newCode = code.replace(/from ['"](\.[^'"]+)['"]/g, (match, p1) => {
        if (!p1.endsWith('.js') && !p1.endsWith('.json') && !p1.endsWith('.jsonc') && !p1.endsWith('.png')) {
            if (p1 === '.') return `from './index.js'`;
            if (p1 === '..') return `from '../index.js'`;
            return `from '${p1}.js'`;
        }
        return match;
    });
    newCode = newCode.replace(/import\(['"](\.[^'"]+)['"]\)/g, (match, p1) => {
        if (!p1.endsWith('.js') && !p1.endsWith('.json') && !p1.endsWith('.jsonc') && !p1.endsWith('.png')) {
            if (p1 === '.') return `import('./index.js')`;
            if (p1 === '..') return `import('../index.js')`;
            return `import('${p1}.js')`;
        }
        return match;
    });
    if (code !== newCode) {
        fs.writeFileSync(f, newCode);
        changedCount++;
    }
}
console.log('Fixed ' + changedCount + ' files in rsmv with missing .js extensions');
