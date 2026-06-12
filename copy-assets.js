import fs from 'fs';
import path from 'path';

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    let entries = fs.readdirSync(src, { withFileTypes: true });

    for (let entry of entries) {
        let srcPath = path.join(src, entry.name);
        let destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

console.log('Copying POG2 assets to dist...');
copyDir('rsmv/opcodes', 'dist/rsmv/opcodes');
copyDir('rsmv/assets', 'dist/rsmv/assets');
// Also copy any json files in src root if they are used
if (fs.existsSync('src/config.json')) fs.copyFileSync('src/config.json', 'dist/src/config.json');

console.log('Assets successfully deployed to dist substrate.');
