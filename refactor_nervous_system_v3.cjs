const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach( f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

console.log("Starting Nervous System Refactor v3...");

// 1. Clean up models.ts
let modelsPath = 'src/core/models.ts';
let models = fs.readFileSync(modelsPath, 'utf8');

// Remove the messy appends at the end
models = models.split('\nexport interface MapZone')[0];
models = models.split('\nexport interface VolumeContext')[0];
models = models.trim();

// Ensure ServerSideInjector has provenance (surgical)
if (models.includes("authorityTier: 'SYNTHESIZED' | 'CACHE' | 'WIKI';") && !models.includes("provenance?: string;")) {
    models = models.replace("authorityTier: 'SYNTHESIZED' | 'CACHE' | 'WIKI';", "authorityTier: 'SYNTHESIZED' | 'CACHE' | 'WIKI';\n    provenance?: string;");
}

// Add the final authoritative interfaces
models += `

export interface MapZone {
    id: string;
    name: string;
    internal_name?: string;
    bounds: {
        dst: { xstart: number; xend: number; zstart: number; zend: number; };
        plane: number;
    }[];
}

export interface VolumeContext {
    allVolumes: MapZone[];
    primaryVolume: MapZone | null;
    ambientSound?: string;
}
`;

fs.writeFileSync(modelsPath, models, 'utf8');
console.log("models.ts cleaned and finalized.");

// 2. Fix the "Cannot find name 'SovereignAvatar'" and import consistency
walk('src', (filePath) => {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    if (filePath.includes('node_modules')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // If file uses SovereignAvatar but doesn't import it (or only imported class)
    if (content.includes('SovereignAvatar') && !content.includes('SovereignAvatarEntity')) {
        // If it doesn't import SovereignAvatar from models, add it
        const modelsImportRegex = /import \{ (.*?) \} from '.*?\/models\.js'/;
        const match = content.match(modelsImportRegex);
        if (match) {
            if (!match[1].includes('SovereignAvatar')) {
                const newImport = match[0].replace('import { ', 'import { SovereignAvatar, ');
                content = content.replace(modelsImportRegex, newImport);
                changed = true;
            }
        } else if (!content.includes('import { SovereignAvatar }')) {
            // Need to add import (find a good place, maybe after other imports)
            // This is complex, but for limps we usually have models.js imports already.
        }
    }
    
    // Fix implicit any and other misses
    if (filePath.endsWith('GameplaySovereigntyLimb.ts')) {
        content = content.replace(/\(i\) => i !== null/, '(i: any) => i !== null');
        content = content.replace(/\(item, slot\) =>/, '(item: any, slot: any) =>');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed ${filePath}`);
    }
});

console.log("Refactor v3 complete.");
