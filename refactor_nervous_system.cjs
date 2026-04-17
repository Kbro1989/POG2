const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach( f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
};

console.log("Starting Nervous System Refactor v2...");

// 1. Fix models.ts (The Source of Truth)
let modelsPath = 'src/core/models.ts';
let models = fs.readFileSync(modelsPath, 'utf8');

// Ensure proper volume types
if (!models.includes('allVolumes: MapZone[]')) {
    models = models.replace(/export interface VolumeContext \{[\s\S]*?\}/, 
`export interface VolumeContext {
    allVolumes: MapZone[];
    primaryVolume: MapZone | null;
    ambientSound?: string;
}`);
}
// Ensure MapZone exists with right structure
if (!models.includes('export interface MapZone')) {
    models += `\nexport interface MapZone {\n    id: string;\n    name: string;\n    internal_name?: string;\n    bounds: {\n        dst: { xstart: number; xend: number; zstart: number; zend: number; };\n        plane: number;\n    }[];\n}\n`;
}

fs.writeFileSync(modelsPath, models, 'utf8');

// 2. Fix SovereignAvatar.ts (The Implementation Entity)
let saPath = 'src/core/SovereignAvatar.ts';
let saContent = fs.readFileSync(saPath, 'utf8');

// Rename class to SovereignAvatarEntity
saContent = saContent.replace('export class SovereignAvatar', 'export class SovereignAvatarEntity');

// Import the interface properly
if (!saContent.includes('SovereignAvatar as ISovereignAvatar')) {
    saContent = saContent.replace(
        /import \{ (.+?) \} from '\.\/models\.js';/,
        "import { $1, SovereignAvatar as ISovereignAvatar } from './models.js';"
    );
}

// Implement the interface
if (saContent.includes('implements NPC, CombatantState')) {
    saContent = saContent.replace('implements NPC, CombatantState', 'implements NPC, CombatantState, ISovereignAvatar');
}

fs.writeFileSync(saPath, saContent, 'utf8');

// 3. Global update
walk('src', (filePath) => {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
    if (filePath.includes('node_modules')) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Fix imports from SovereignAvatar.js
    if (content.includes("from ") && (content.includes("SovereignAvatar.js") || content.includes("SovereignAvatar'"))) {
        // If it was importing SovereignAvatar (class), rename to SovereignAvatarEntity
        const saImportRegex = /import \{ (.*?)SovereignAvatar(.*?) \} from '(.*?)SovereignAvatar\.js'/g;
        if (saImportRegex.test(content)) {
            content = content.replace(saImportRegex, "import { $1SovereignAvatarEntity$2 } from '$3SovereignAvatar.js'");
            changed = true;
        }

        // Rename instantiations
        if (content.includes("new SovereignAvatar(")) {
            content = content.replace(/new SovereignAvatar\(/g, "new SovereignAvatarEntity(");
            changed = true;
        }
    }

    // Fix cli.ts specifically
    if (filePath.endsWith('cli.ts')) {
        // Fix multiple definitions of properties
        const props = ['interactionState', 'residualSouls', 'lastCombatTick', 'cooldowns'];
        props.forEach(p => {
            // Find lines like "    interactionState: 'IDLE',"
            const pRegex = new RegExp(`^\\s+${p}\\s*:.*?,?\\r?\\n`, 'gm');
            const matches = content.match(pRegex);
            if (matches && matches.length > 1) {
                // Keep only the first one (or last one? Usually first definition in mock is fine, but we added new ones)
                // Actually, let's keep the one that has more info if it's a map/object, or just be surgical.
                // For 'interactionState: IDLE', just remove all but one.
                let count = 0;
                content = content.replace(pRegex, (m) => {
                    count++;
                    return count === 1 ? m : '';
                });
                changed = true;
            }
        });
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
});

console.log("Refactor v2 complete.");
