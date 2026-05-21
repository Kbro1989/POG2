import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(fullPath));
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            results.push(fullPath);
        }
    });
    return results;
}

const files = walk('src');
let replacedCatches = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const original = content;
    
    // Regex to find empty catch blocks: 'catch (e) { }' or 'catch { }'
    // Looks for 'catch' followed by optional parameter in parens, followed by empty braces
    content = content.replace(/catch\s*(?:\([^)]+\))?\s*\{\s*\}/g, (match) => {
        replacedCatches++;
        const componentName = path.basename(file, path.extname(file));
        return `catch (_error) {\n            // [SILENT NECROSIS LOGGER]\n            console.warn("[SILENT NECROSIS] Caught in ${componentName}: ", _error);\n        }`;
    });
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Instrumented:', file);
    }
});

console.log('Total empty catches instrumented:', replacedCatches);
