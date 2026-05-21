const fs = require('fs');
const path = require('path');

function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) walk(p);
        else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
            let c = fs.readFileSync(p, 'utf8');
            let fixed = c.replace(/(import .* from\s+['\"](\.\.?\/[^'\"]+))['\"]/g, (m, p1, p2) => {
                if (p2.endsWith('.js') || p2.endsWith('.json')) return m;
                return p1 + `.js'`;
            });
            // Also fix dynamic imports: import('./path')
            fixed = fixed.replace(/(import\s*\(\s*['\"](\.\.?\/[^'\"]+))['\"]/g, (m, p1, p2) => {
                if (p2.endsWith('.js') || p2.endsWith('.json')) return m;
                return p1 + `.js'`;
            });
            if (fixed !== c) {
                fs.writeFileSync(p, fixed);
                console.log('Fixed imports in', p);
            }
        }
    });
}

walk('d:/POG2/rsmv/src');
