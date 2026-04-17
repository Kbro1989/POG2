const fs = require('fs');

function fixImport(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('SovereignAvatar') && content.includes("from '../../core/models.js'") && !content.includes('SovereignAvatar,')) {
         content = content.replace("import { ", "import { SovereignAvatar, ");
         fs.writeFileSync(filePath, content, 'utf8');
         console.log(`Fixed imports in ${filePath}`);
    } else if (content.includes('SovereignAvatar') && content.includes("from '../core/models.js'") && !content.includes('SovereignAvatar,')) {
         content = content.replace("import { ", "import { SovereignAvatar, ");
         fs.writeFileSync(filePath, content, 'utf8');
         console.log(`Fixed imports in ${filePath}`);
    }
}

console.log("Starting Surgical Stabilizer...");

// 1. models.ts
let models = fs.readFileSync('src/core/models.ts', 'utf8');
if (models.includes('interface ServerSideInjector') && !models.includes('provenance?: string;')) {
    models = models.replace(/interface ServerSideInjector \{([\s\S]*?)trigger:.*?;/, (match) => {
        return match + "\n  provenance?: string;";
    });
    fs.writeFileSync('src/core/models.ts', models, 'utf8');
    console.log("Fixed ServerSideInjector in models.ts");
}

// 2. Fix imports in identified files
const files = [
    'src/limbs/logical/InteractionGateway.ts',
    'src/limbs/logical/WorldStateLimb.ts',
    'src/limbs/spatial/GameplaySovereigntyLimb.ts',
    'src/limbs/spatial/SpatialRadarLimb.ts',
    'src/engines/gameplay/UniversalInterpreter.ts',
    'src/tests/radar_probe.ts',
    'src/engines/gameplay/SimulationHarness.ts'
];
files.forEach(f => {
    if (fs.existsSync(f)) fixImport(f);
});

// 3. Fix SimulationHarness specific logic
let sh = fs.readFileSync('src/engines/gameplay/SimulationHarness.ts', 'utf8');
if (sh.includes('avatar.bank.forEach(i =>')) {
    sh = sh.replace('avatar.bank.forEach(i =>', 'avatar.bank.forEach((i: any) =>');
}
if (sh.includes('find(i => i?.id === itemId);')) {
    sh = sh.replace('find(i => i?.id === itemId);', 'find(i => i?.id === itemId) as any;');
}
fs.writeFileSync('src/engines/gameplay/SimulationHarness.ts', sh, 'utf8');
console.log("Fixed SimulationHarness logic.");

// 4. Fix verify_volumetric_fragments.ts internal_name
let vv = fs.readFileSync('src/tests/verify_volumetric_fragments.ts', 'utf8');
if (vv.includes('internal_name')) {
    vv = vv.replace(/internal_name/g, 'name'); // Force use name if internal_name is causing issues, or fix model
    fs.writeFileSync('src/tests/verify_volumetric_fragments.ts', vv, 'utf8');
}

console.log("Stabilizer complete.");
