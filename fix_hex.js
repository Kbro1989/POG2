const fs = require('fs');
let f = fs.readFileSync('D:/POG2/src/core/HexagramDefinitions.ts', 'utf8');
f = f.replace(/prosody: \{[^}]+\} \}(?!,)/g, match => match + `, activeLimbs: ['motor', 'forge', 'core']`);
fs.writeFileSync('D:/POG2/src/core/HexagramDefinitions.ts', f);
console.log('HexagramDefinitions updated');
