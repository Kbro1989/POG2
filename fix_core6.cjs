const fs = require('fs');

// 1. MechanicalSovereigntyLimb.ts add path
let mech = fs.readFileSync('src/limbs/technical/MechanicalSovereigntyLimb.ts', 'utf8');
if (!mech.includes("import * as path")) {
    mech = "import * as path from 'path';\n" + mech;
    fs.writeFileSync('src/limbs/technical/MechanicalSovereigntyLimb.ts', mech, 'utf8');
}

// 2. models.ts fix SovereignAvatar syntax
let models = fs.readFileSync('src/core/models.ts', 'utf8');
let lines = models.split(/\r?\n/);

let idx = lines.findIndex(l => l.includes('appearance?: {'));
if (idx !== -1) {
    console.log("Found appearance at line", idx + 1);
    // ensure we don't duplicate
    if(!lines[idx+4].includes('metadata?:')) {
        lines[idx + 3] = "    };";
        lines.splice(idx + 4, 0, "    metadata?: any;");
        fs.writeFileSync('src/core/models.ts', lines.join('\n'), 'utf8');
    }
}
console.log("Core 6 fixes complete");
