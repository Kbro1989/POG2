const fs = require('fs');
let code = fs.readFileSync('D:/POG2/src/rsmv/opdecoder.ts', 'utf8');
code = code.replace(/import\("\.\.\/generated\/([^"]+?)"\)/g, (match, p1) => {
    if (!p1.endsWith('.js')) {
        return `import("../generated/${p1}.js")`;
    }
    return match;
});
fs.writeFileSync('D:/POG2/src/rsmv/opdecoder.ts', code);
console.log('Fixed dynamic imports in opdecoder.ts');
