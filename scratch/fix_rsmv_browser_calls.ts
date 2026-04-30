import fs from 'fs';
import path from 'path';

const files = [
    'src/rsmv/3d/animationskeletal.ts',
    'src/rsmv/3d/proceduraltexture.ts'
];

files.forEach(file => {
    const filePath = path.resolve(file);
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace document.body.append(cnv) with document.body.appendChild(cnv)
    // and check if document/document.body exists
    content = content.replace(/document\.body\.append\((.*?)\);/g, 'if (typeof document !== "undefined" && document.body) document.body.appendChild($1 as any);');
    
    fs.writeFileSync(filePath, content);
    console.log(`Patched browser calls in ${file}`);
});
