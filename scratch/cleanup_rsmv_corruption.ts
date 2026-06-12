
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

        // 1. Fix the typed arrow function parameters without parentheses
        // Matches: param: any =>
        // Matches: (param: any) => (redundant but safe)
        content = content.replace(/(?<!\()(\w+):\s*any\s*=>/g, '($1: any) =>');

        // 2. Fix the broken cache.(...) syntax from previous failed attempt
        // Matches: cache.(target as (any) as any)[cachename]
        // Matches: cache.(foundjag as any)[key]
        content = content.replace(/(\w+)\.\(([\w\s]+)as\s+\(any\)\s+as\s+any\)/g, '($1.$2 as any)');
        content = content.replace(/(\w+)\.\(([\w\s]+)as\s+any\)/g, '($1.$2 as any)');

        // 3. Fix the weird oldbufferdata.(. as any).call
        content = content.replace(/oldbufferdata\.\(\.\s+as\s+any\)\.call/g, 'oldbufferdata.call');

        if (content !== original) {
            console.log(`Fixing ${file}`);
            fs.writeFileSync(file, content, 'utf8');
        }
    }
});
