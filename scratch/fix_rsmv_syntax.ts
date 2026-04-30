import fs from 'fs';
import path from 'path';

function walk(dir: string, cb: (f: string) => void) {
    fs.readdirSync(dir).forEach(f => {
        let p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) walk(p, cb);
        else if (p.endsWith('.ts')) cb(p);
    });
}

walk('src/rsmv', (f) => {
    let content = fs.readFileSync(f, 'utf8');
    let changed = false;
    // Fix q: any => to (q: any) =>
    let newContent = content.replace(/([a-z0-9_]+): any =>/g, '($1: any) =>');
    // Fix async q: any => to async (q: any) =>
    newContent = newContent.replace(/async ([a-z0-9_]+): any =>/g, 'async ($1: any) =>');
    
    if (newContent !== content) {
        fs.writeFileSync(f, newContent);
        console.log('Fixed:', f);
    }
});
