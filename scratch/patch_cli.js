import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const filePath = 'D:/POG2/src/cli.ts';
let content = readFileSync(filePath, 'utf8');

const import1 = "import { GlobeStateLimb } from './limbs/spatial/GlobeStateLimb.js';";
const import2 = "import { SwitchboardLimb } from './limbs/spatial/SwitchboardLimb.js';";

if (!content.includes(import1)) {
    content = content.replace(
        "import { SpatialRadarLimb } from './limbs/spatial/SpatialRadarLimb.js';",
        "import { SpatialRadarLimb } from './limbs/spatial/SpatialRadarLimb.js';\n" + import1 + "\n" + import2
    );
    writeFileSync(filePath, content);
    console.log('cli.ts patched successfully.');
} else {
    console.log('cli.ts already patched.');
}
