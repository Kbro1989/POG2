import fs from 'fs';
const content = fs.readFileSync('src/engines/OrchestrateEngine.ts', 'utf8');

let inString = null;
let inComment = null;
let b1 = 0, b2 = 0; // {}
let p1 = 0, p2 = 0; // ()
let k1 = 0, k2 = 0; // []

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const next = content[i+1];
    const prev = content[i-1];

    if (inComment === 'line') {
        if (char === '\n') inComment = null;
        continue;
    }
    if (inComment === 'block') {
        if (char === '*' && next === '/') {
            inComment = null;
            i++;
        }
        continue;
    }
    if (inString) {
        if (char === inString && prev !== '\\') inString = null;
        continue;
    }

    if (char === '/' && next === '/') { inComment = 'line'; i++; continue; }
    if (char === '/' && next === '*') { inComment = 'block'; i++; continue; }
    if (char === '"' || char === "'" || char === '`') { inString = char; continue; }

    if (char === '{') b1++;
    if (char === '}') b2++;
    if (char === '(') p1++;
    if (char === ')') p2++;
    if (char === '[') k1++;
    if (char === ']') k2++;
}

console.log('Braces:', b1, b2, b1 - b2);
console.log('Parens:', p1, p2, p1 - p2);
console.log('Brackets:', k1, k2, k1 - k2);
