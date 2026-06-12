const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts')) results.push(file);
        }
    });
    return results;
}

const rsmvDir = path.resolve('D:/POG2/src/rsmv');
const files = walk(rsmvDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Regex to match import/export statements with relative paths
    // Example: import { foo } from "./bar"
    // Example: export * from "../baz"
    const regex = /(import|export)([\s\S]*?from\s+["'])((\.\.?\/)[^"']+)(["'])/g;

    const newContent = content.replace(regex, (match, p1, p2, p3, p4, p5) => {
        // p1: import/export
        // p2: space + from + quote
        // p3: the relative path
        // p4: ./ or ../
        // p5: closing quote

        if (!p3.match(/\.(js|json|jsonc|css|wasm)$/)) {
            changed = true;
            return `${p1}${p2}${p3}.js${p5}`;
        }
        return match;
    });

    if (changed) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`Updated: ${file}`);
    }
});
