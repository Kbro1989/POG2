const fs = require('fs');

// Helper to replace with exact matching or warn
function patch(file, target, replacement) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes(target)) {
        content = content.replace(target, replacement);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Patched ${file}`);
    } else {
        console.log(`Warning: Target not found in ${file}`);
    }
}

// 1. models.ts
let models = fs.readFileSync('src/core/models.ts', 'utf8');

// Ensure ServerSideInjector has provenance
if (models.includes("authorityTier: 'SYNTHESIZED' | 'CACHE' | 'WIKI';") && !models.includes("provenance?: string;")) {
    models = models.replace("authorityTier: 'SYNTHESIZED' | 'CACHE' | 'WIKI';", "authorityTier: 'SYNTHESIZED' | 'CACHE' | 'WIKI';\n    provenance?: string;");
}

// Add SovereignAvatar missing methods
const saTarget = "quests: QuestState;";
if (models.includes(saTarget) && !models.includes("applyDamage?")) {
    models = models.replace(saTarget, saTarget + "\n    metadata?: any;\n    applyDamage?(amount: number): number;\n    heal?(amount: number): number;\n    firstEmptySlot?(): number | null;");
}

// Add MapZone and VolumeContext properly
if (!models.includes("export interface MapZone")) {
    models += `\nexport interface MapZone {\n    id: string;\n    name: string;\n    bounds: {\n        dst: {\n            xstart: number;\n            xend: number;\n            zstart: number;\n            zend: number;\n        };\n        plane: number;\n    }[];\n}\n`;
}
if (!models.includes("export interface VolumeContext")) {
    models += `\nexport interface VolumeContext {\n    allVolumes: MapZone[];\n    primaryVolume: MapZone | null;\n    ambientSound?: string;\n}\n`;
}

fs.writeFileSync('src/core/models.ts', models, 'utf8');

// 2. DBRowOracleLimb.ts (remove extra props if they fail, or we just added provenance to model so it should be fine)
// We already added provenance to ServerSideInjector in model, so TS2353 should disappear.

// 3. verify_volumetric_fragments.ts
patch('src/tests/verify_volumetric_fragments.ts', 'verifyFragment(v)', 'verifyFragment(v: any)');

// 4. cli.ts - the mock bodies are the ones failing
let cli = fs.readFileSync('src/cli.ts', 'utf8');
// Fix the mockAvatar missing residualSouls
cli = cli.replace(/interactionState: 'IDLE',/g, "interactionState: 'IDLE',\n        residualSouls: 0,\n        lastCombatTick: 0,\n        cooldowns: {},");
// (The above might catch too many, but since it's a mock it's safer than erroring)
fs.writeFileSync('src/cli.ts', cli, 'utf8');

console.log("Final master fix executed.");
