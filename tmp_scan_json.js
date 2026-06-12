import { readdirSync, statSync } from 'fs';
import { join } from 'path';

function scan(dir, exclude = []) {
    let results = [];
    try {
        const files = readdirSync(dir);
        for (const file of files) {
            const fullPath = join(dir, file);
            if (exclude.some(ex => fullPath.includes(ex))) continue;

            const stat = statSync(fullPath);
            if (stat.isDirectory()) {
                results.push(...scan(fullPath, exclude));
            } else if (file.endsWith('.json') || file.endsWith('.jsonc')) {
                results.push(fullPath);
            }
        }
    } catch (e) { }
    return results;
}

console.log("--- LOCAL JSON FILES ---");
const local = scan('.', ['node_modules', '.git', '.gemini', 'package.json', 'tsconfig.json']);
local.forEach(f => console.log(f));

console.log("\n--- D: rsmv JSON FILES ---");
const rsmv = scan('D:\\sovereign\\cache_pedagogy\\rsmv_inspector', ['node_modules', 'package.json']);
rsmv.forEach(f => console.log(f));
