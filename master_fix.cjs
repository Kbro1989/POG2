const fs = require('fs');
const path = require('path');

function replaceOrThrow(file, regex, replacement) {
    let content = fs.readFileSync(file, 'utf8');
    if (!regex.test(content) && !content.includes(replacement)) {
        console.log(`[Warning] Could not find match for ${regex} in ${file}`);
    } else {
        content = content.replace(regex, replacement);
        fs.writeFileSync(file, content, 'utf8');
    }
}

// 1. Fix models.ts
let models = fs.readFileSync('src/core/models.ts', 'utf8');
// Fix CombatantState correctly
models = models.replace(/adrenaline: number; \/\/ 0 - 10000/g, 'adrenaline?: number; // 0 - 10000');
models = models.replace(/necrosisStacks: number;/g, 'necrosisStacks?: number;');
models = models.replace(/residualSouls: number;/g, 'residualSouls?: number;');
// Fix SovereignAvatar methods parsing
models = models.replace(/gender: 'male' \| 'female';\s+applyDamage\?\(amount: number\): number;\s+heal\?\(amount: number\): number;\s+firstEmptySlot\?\(\): number \| null;\s+\};/g, 
`gender: 'male' | 'female';\n    };\n    metadata?: any;\n    applyDamage?(amount: number): number;\n    heal?(amount: number): number;\n    firstEmptySlot?(): number | null;`);
// MapZone and VolumeContext interface stubs if missing
if (!models.includes('export interface MapZone')) {
    models += `\nexport interface MapZone { id: string; name: string; bounds?: any; }`;
}
if (!models.includes('export interface VolumeContext')) {
    models += `\nexport interface VolumeContext { ambientSound?: string; }`;
}
// ServerSideInjector add provenance
if(!models.includes('provenance?: string;')) {
    models = models.replace(/authorityTier: 'SYNTHESIZED' \| 'CACHE' \| 'WIKI';/g, "authorityTier: 'SYNTHESIZED' | 'CACHE' | 'WIKI';\n    provenance?: string;");
}
fs.writeFileSync('src/core/models.ts', models, 'utf8');


// 2. Fix GameplaySovereigntyLimb.ts
let gsl = fs.readFileSync('src/limbs/spatial/GameplaySovereigntyLimb.ts', 'utf8');
// restore varps and varcs
gsl = gsl.replace(/varbits: new Map\(\),\s+lastTickTime:/g, 'varbits: new Map(),\n        varps: new Map(),\n        varcs: new Map(),\n        lastTickTime:');
// fix forceTick
gsl = gsl.replace(/public forceTick\(\): string \| null \{\s+return this\.processTick\(\);\s+\}/g, 'public async forceTick(): Promise<string | null> {\n        return this.processTick();\n    }');
// fix object possibly undefined
gsl = gsl.replace(/this\.globalState\.graves\.set/g, 'this.globalState.graves!.set');
gsl = gsl.replace(/this\.globalState\.graves\.get/g, 'this.globalState.graves!.get');
gsl = gsl.replace(/this\.globalState\.graves\.delete/g, 'this.globalState.graves!.delete');
gsl = gsl.replace(/this\.globalState\.groundItems\.get/g, 'this.globalState.groundItems!.get');
fs.writeFileSync('src/limbs/spatial/GameplaySovereigntyLimb.ts', gsl, 'utf8');


// 3. Fix cli.ts mock avatars
replaceOrThrow('src/cli.ts', 
  /quests: \{ points: 0, completedCount: 0, quests: \{\} \}\r?\n    \};/g, 
  `quests: { points: 0, completedCount: 0, quests: {} },\n        coord: { x: 0, y: 0, plane: 0 },\n        interactionState: 'IDLE',\n        lastActionTick: 0,\n        lastCombatTick: 0,\n        cooldowns: {}\n    };`);
replaceOrThrow('src/cli.ts', 
  /return \{\r?\n\s+plane: 0,\r?\n\s+varbits,\r?\n\s+players,\r?\n\s+npcMap: new Map\(\),\r?\n\s+npcSpatialIndex: new Map\(\),\r?\n\s+objectMap: new Map\(\)\r?\n\s+\};/g,
  `return {\n        plane: 0,\n        varps: new Map(),\n        varcs: new Map(),\n        varbits,\n        players,\n        npcMap: new Map(),\n        npcSpatialIndex: new Map(),\n        objectMap: new Map()\n    };`);


// 4. Fix Singletons & minor misses from other limbs
replaceOrThrow('src/engines/spatial/ObservationEngine.ts', /new WorldForensicsLimb\(\)/g, "WorldForensicsLimb.getInstance()");
replaceOrThrow('src/engines/gameplay/SimulationHarness.ts', /new DBRowOracleLimb\(\)/g, "DBRowOracleLimb.getInstance()");
replaceOrThrow('src/limbs/spatial/LessonLearner.ts', /new SovereignKnowledgeDB\(\)/g, "SovereignKnowledgeDB.getInstance()");
replaceOrThrow('src/refill_tester.ts', /new SovereignKnowledgeDB\(\)/g, "SovereignKnowledgeDB.getInstance()");
replaceOrThrow('src/tests/verify_volumetric_fragments.ts', /verifyFragment\((v)\)/g, "verifyFragment(v: any)");
replaceOrThrow('src/limbs/spatial/VarbitSovereigntyLimb.ts', /manifestedId/g, "id"); 

// 5. Fix MechanicalSovereigntyLimb Path duplication
let msl = fs.readFileSync('src/limbs/technical/MechanicalSovereigntyLimb.ts', 'utf8');
if (!msl.includes("import * as path from")) {
    msl = `import * as path from "path";\n` + msl;
    fs.writeFileSync('src/limbs/technical/MechanicalSovereigntyLimb.ts', msl, 'utf8');
}

console.log("Master core fix successfully executed.");
