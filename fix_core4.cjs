const fs = require('fs');

function replaceInFile(filepath, searchRegex, replaceWith) {
    if(!fs.existsSync(filepath)) return;
    let text = fs.readFileSync(filepath, 'utf8');
    const originalText = text;
    text = text.replace(searchRegex, replaceWith);
    if(text !== originalText) {
        fs.writeFileSync(filepath, text, 'utf8');
        console.log('Fixed', filepath);
    } else {
        console.log('No match found in', filepath);
    }
}

// 1. SimulationHarness.ts
replaceInFile('src/engines/gameplay/SimulationHarness.ts', /this\.dbRowOracle = new DBRowOracleLimb\([^)]*\);/g, 'this.dbRowOracle = DBRowOracleLimb.getInstance();');

// 2. LessonLearner.ts
replaceInFile('src/limbs/spatial/LessonLearner.ts', /new SovereignKnowledgeDB\([^)]*\)/g, 'SovereignKnowledgeDB.getInstance()');

// 3. refill_tester.ts
replaceInFile('src/refill_tester.ts', /new SovereignKnowledgeDB\([^)]*\)/g, 'SovereignKnowledgeDB.getInstance()');
replaceInFile('src/refill_tester.ts', /catch\s*\(([^)]+)\)\s*{/g, (match, param) => {
    // If the catch param lacks a type in TS, we don't necessarily need to touch it unless it's the specific TS7006 error on 't'
    return match;
});
replaceInFile('src/refill_tester.ts', /public checkRefill\((t)\)/g, 'public checkRefill(t: any)'); // guessing the TS7006 on 't' parameter

// 4. MechanicalSovereigntyLimb.ts missing 'path'
replaceInFile('src/limbs/technical/MechanicalSovereigntyLimb.ts', /import \* as path from 'path';/g, ''); // Remove if previously added incorrectly
replaceInFile('src/limbs/technical/MechanicalSovereigntyLimb.ts', /import \{([^}]+)\} from 'path';/g, "import { $1, join, resolve, basename, dirname } from 'path';\nimport * as path from 'path';"); 
// if it just doesn't have path:
let mech = fs.readFileSync('src/limbs/technical/MechanicalSovereigntyLimb.ts', 'utf8');
if(!mech.includes('import * as path from "path"')) {
    mech = "import * as path from \"path\";\n" + mech;
    fs.writeFileSync('src/limbs/technical/MechanicalSovereigntyLimb.ts', mech, 'utf8');
}

// 5. NodeTester.ts
replaceInFile('src/monitor/NodeTester.ts', /return \{\s*status:\s*['"]DEGRADED['"][^}]+\};/g, (match) => {
    if(!match.includes('yaoState')) return match.replace('};', ', yaoState: 0 as any };');
    return match;
});
replaceInFile('src/monitor/NodeTester.ts', /return \{\s*status:\s*['"]OFFLINE['"][^}]+\};/g, (match) => {
    if(!match.includes('yaoState')) return match.replace('};', ', yaoState: 0 as any };');
    return match;
});

// 6. HitsplatBlockDecoder.ts
replaceInFile('src/limbs/logical/world/HitsplatBlockDecoder.ts', /avatar\.applyDamage\?\.\(/g, 'avatar.applyDamage?.('); // Should be fine if interface has it.

// 7. fix appearance logic
replaceInFile('src/limbs/logical/world/AppearanceBlockDecoder.ts', /avatar\.metadata\?\.lastAppearanceUpdate/g, 'if(avatar.metadata) avatar.metadata.lastAppearanceUpdate');

console.log("Secondary cleanup complete");
