import fs from 'fs';
import path from 'path';

const directories = ['src', 'multiplayer-globe-template', 'to-do-list-kv-template-123', '.'];

function processFile(filePath: string) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Regex for relative imports/exports
    // Matches: import ... from './foo.js' or import './foo' or export ... from './foo.js'
    // Group 1: prefix, Group 2: quote, Group 3: path, Group 4: quote
    const regex = /(import|export)([\s\S]*?from\s+)?(['"])((\.\/|\.\.\/).*?)(['"])/g;

    const newContent = content.replace(regex, (match, p1, p2, quote, importPath) => {
        // Skip if already has an extension or is a data URL or similar
        if (importPath.endsWith('.js') || importPath.endsWith('.mjs') || importPath.endsWith('.cjs') || importPath.endsWith('.css') || importPath.endsWith('.json') || importPath.includes('?') || importPath.includes('#')) {
            return match;
        }

        changed = true;
        return `${p1}${p2 || ''}${quote}${importPath}.js${quote}`;
    });

    if (changed) {
        console.log(`Updated imports in ${filePath}`);
        fs.writeFileSync(filePath, newContent);
    }
}

function walk(dir: string) {
    if (!fs.existsSync(dir)) return;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
                walk(fullPath);
            }
        } else {
            processFile(fullPath);
        }
    });
}

directories.forEach(walk);
