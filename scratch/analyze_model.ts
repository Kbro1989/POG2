import * as fs from 'fs';

if (fs.existsSync('D:/POG2/scratch/model_31149.json')) {
    const model = JSON.parse(fs.readFileSync('D:/POG2/scratch/model_31149.json', 'utf8'));
    console.log('Meshes array: ', Array.isArray(model.meshes));
    if (Array.isArray(model.meshes)) {
        console.log('Length:', model.meshes.length);
        console.log('Valid elements:', model.meshes.filter(m => m !== null).length);
        const first = model.meshes.find(m => m !== null);
        if (first) {
            console.log('First valid mesh keys:', Object.keys(first));
            for (const [k, v] of Object.entries(first)) {
                if (v && (v as any).length !== undefined) console.log(`  ${k}: array(${(v as any).length})`);
                else console.log(`  ${k}: ${typeof v}`);
            }
        }
    } else {
        console.log('Meshes is an object:', Object.keys(model.meshes));
        const first = Object.values(model.meshes)[0];
        if (first) {
            for (const [k, v] of Object.entries(first)) {
                if (v && (v as any).length !== undefined) console.log(`  ${k}: array(${(v as any).length})`);
                else console.log(`  ${k}: ${typeof v}`);
            }
        }
    }
} else {
    console.log('File not found');
}
