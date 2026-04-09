import fs from 'fs';
import path from 'path';

function walk(dir) {
    let results = [];
    try {
        const list = fs.readdirSync(dir);
        for (const file of list) {
            const fullp = path.join(dir, file);
            if (fullp.includes('node_modules') || fullp.includes('.git')) continue;
            try {
                const stat = fs.statSync(fullp);
                if (stat.isDirectory()) {
                    results = results.concat(walk(fullp));
                } else {
                    results.push({ path: fullp, size: stat.size });
                }
            } catch (e) {}
        }
    } catch (e) {}
    return results;
}

['C:\\Users\\Destiny\\Desktop\\pog-vibe-interactive\\files', 'D:\\sovereign'].forEach(d => {
    console.log(`\nScanning ${d}...`);
    const files = walk(d);
    files.sort((a, b) => b.size - a.size);
    const topFiles = files.slice(0, 15);
    for (const f of topFiles) {
        console.log(`${(f.size / 1024 / 1024).toFixed(2)} MB - ${f.path}`);
    }
});
