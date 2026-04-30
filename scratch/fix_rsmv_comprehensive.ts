
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

        // Fix directory imports (single or double quotes)
        content = content.replace(/from ['"]\.\.\/cache\.js['"]/g, 'from "../cache/index.js"');
        content = content.replace(/from ['"]\.\/cache\.js['"]/g, 'from "./cache/index.js"');
        content = content.replace(/from ['"]\.\.\/map\.js['"]/g, 'from "../map/index.js"');
        content = content.replace(/from ['"]\.\.\/clientscript\.js['"]/g, 'from "../clientscript/index.js"');
        content = content.replace(/from ['"]\.\.\/generated\/clientscript\.js['"]/g, 'from "../../generated/clientscript.js"');

        // Fix three/examples imports (add .js)
        content = content.replace(/from ['"]three\/examples\/jsm\/([^'"]+)(?<!\.js)['"]/g, 'from "three/examples/jsm/$1.js"');

        // Fix autobind-decorator
        content = content.replace(/import \{ boundMethod \} from ['"]autobind-decorator['"]/g, 'import boundMethod from "autobind-decorator"');

        // Add React import to TSX if missing
        if (file.endsWith('.tsx') && !content.includes('import * as React from') && !content.includes('import React from')) {
            content = 'import * as React from "react";\n' + content;
        }

        if (content !== original) {
            console.log(`Fixing imports/types in ${file}`);
            fs.writeFileSync(file, content, 'utf8');
        }
    }
});
