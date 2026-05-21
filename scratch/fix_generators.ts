
import fs from 'fs';
import path from 'path';

function walk(dir: string, callback: (file: string) => void) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targetDir = 'd:/POG2/src/rsmv';

walk(targetDir, (file) => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        let content = fs.readFileSync(file, 'utf8');
        let original = content;

        // Fix generator functions lacking return type
        // Matches: function* name(...) {
        // Replaces with: function* name(...): Generator<any, any, any> {
        content = content.replace(/function\*\s+(\w+)\s*\(([^)]*)\)\s*(?!:)/g, 'function* $1($2): Generator<any, any, any> ');

        // Matches: name = function*\s*\(([^)]*)\)\s*(?!:)/
        content = content.replace(/=\s*function\*\s*\(([^)]*)\)\s*(?!:)/g, '= function*($1): Generator<any, any, any> ');

        if (content !== original) {
            console.log(`Adding generator types to ${file}`);
            fs.writeFileSync(file, content, 'utf8');
        }
    }
});
