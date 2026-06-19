import * as fs from 'fs';
import * as path from 'path';

const modelsDir = 'D:/POG2/public/models';
const files = fs.readdirSync(modelsDir).filter(f => f.startsWith('kit_') && f.endsWith('.json'));

console.log('=== KIT MESH ANALYSIS ===');

for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(modelsDir, file), 'utf8'));
    const positions = data.positions;
    
    if (!positions || positions.length === 0) {
        console.log(`\n[${file}] No positions found.`);
        continue;
    }
    
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    
    for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i+1];
        const z = positions[i+2];
        
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (z < minZ) minZ = z;
        
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
        if (z > maxZ) maxZ = z;
    }
    
    const width = maxX - minX;
    const height = maxY - minY;
    const depth = maxZ - minZ;
    
    console.log(`\n[${file}]`);
    console.log(`  Vertices: ${positions.length / 3}`);
    console.log(`  Bounds: X[${minX} to ${maxX}] Y[${minY} to ${maxY}] Z[${minZ} to ${maxZ}]`);
    console.log(`  Size: W=${width.toFixed(2)} H=${height.toFixed(2)} D=${depth.toFixed(2)}`);
}
