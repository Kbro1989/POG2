const fs = require('fs');

const cliPath = 'src/cli.ts';
let content = fs.readFileSync(cliPath, 'utf8');

// Consolidate models imports
// Remove lines 67 and 86
const lines = content.split('\n');
const filteredLines = lines.filter(line => !line.includes("from './core/models.js'"));

// Insert consolidated import at line 67
const consolidated = "import { type Result, YaoState, NPC, GameState, VarbitSnapshot, CompositeCondition, Item, SovereignAvatar, GameObject } from './core/models.js';";
filteredLines.splice(66, 0, consolidated);

// Insert ArchaeologyEngine at line 85
filteredLines.splice(84, 0, "import { ArchaeologyEngine } from './limbs/spatial/ArchaeologyEngine.js';");

fs.writeFileSync(cliPath, filteredLines.join('\n'));
console.log('Consolidated imports and added ArchaeologyEngine.');
