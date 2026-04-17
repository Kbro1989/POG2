const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/cli.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add missing varps/varcs to GameState literals
const stateLogicPattern = /varbits: new Map<number, number>\(\),/g;
content = content.replace(stateLogicPattern, 'varps: new Map<number, number>(),\n        varcs: new Map<number, number | string>(),\n        varbits: new Map<number, number>(),');

// 2. Add missing varps/varcs to slightly different literal (line 2811)
const stateLogicPattern2 = /varbits,\n        players,/g;
content = content.replace(stateLogicPattern2, 'varps: new Map(),\n        varcs: new Map(),\n        varbits,\n        players,');

// 3. Rename mountModule to registerModule
content = content.replace(/\.mountModule\(module\)/g, '.registerModule(module)');

fs.writeFileSync(filePath, content);
console.log('Final Polish complete.');
