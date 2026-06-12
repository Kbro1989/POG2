
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

        // Fix empty object indexing
        // Matches: const name = {};
        // Replaces with: const name: Record<string, any> = {};
        content = content.replace(/const\s+(\w+)\s*=\s*\{\};/g, 'const $1: Record<string, any> = {};');
        content = content.replace(/let\s+(\w+)\s*=\s*\{\};/g, 'let $1: Record<string, any> = {};');

        if (content !== original) {
            console.log(`Fixing indexing in ${file}`);
            fs.writeFileSync(file, content, 'utf8');
        }
    }
});
