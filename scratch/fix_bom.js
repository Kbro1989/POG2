import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const logicDir = 'D:\\sovereign\\memory\\pedagogy\\logic';
const files = readdirSync(logicDir);

for (const file of files) {
    if (file.endsWith('.json')) {
        const fullPath = join(logicDir, file);
        const buffer = readFileSync(fullPath);
        
        // Remove BOM if present (UTF-8 BOM is EF BB BF)
        let content = buffer.toString('utf8');
        if (content.startsWith('\uFEFF')) {
            content = content.substring(1);
            console.log(`Removed BOM from ${file}`);
        } else if (buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
             content = buffer.slice(3).toString('utf8');
             console.log(`Removed BOM (buffer slice) from ${file}`);
        }
        
        // Ensure it's valid JSON before writing back, or at least not empty
        try {
            JSON.parse(content);
            writeFileSync(fullPath, content, 'utf8');
            console.log(`Cleaned and verified ${file}`);
        } catch (e) {
            console.error(`Error parsing ${file}: ${e.message}`);
            // If it's just "{}" but failing, force it
            if (content.trim() === '{}' || content.trim() === '[]') {
                 writeFileSync(fullPath, content.trim(), 'utf8');
                 console.log(`Forced write for simple object/array in ${file}`);
            }
        }
    }
}
