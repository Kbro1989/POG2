
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

        // Fix directory imports in src/rsmv
        content = content.replace(/from "\.\.\/cache\.js"/g, 'from "../cache/index.js"');
        content = content.replace(/from "\.\.\/map\.js"/g, 'from "../map/index.js"');
        content = content.replace(/from "\.\.\/clientscript\.js"/g, 'from "../clientscript/index.js"');

        if (content !== original) {
            console.log(`Fixing imports in ${file}`);
            fs.writeFileSync(file, content, 'utf8');
        }
    }
});
