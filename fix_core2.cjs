const fs = require('fs');

// 1. cli.ts - replace 'z' with 'plane' and 'mountModule' with 'registerModule'
let cli = fs.readFileSync('src/cli.ts', 'utf8');
cli = cli.replace(/coord: \{ x, y, z: plane \}/g, 'coord: { x, y, plane }');
cli = cli.replace(/coord: \{ x: 0, y: 0, z: 0 \}/g, 'coord: { x: 0, y: 0, plane: 0 }');
cli = cli.replace(/\.mountModule\(/g, '.registerModule(');
fs.writeFileSync('src/cli.ts', cli, 'utf8');
console.log('Fixed cli.ts');

// 2. GameplaySovereigntyLimb.ts - type fixes and undefined checks
let gsl = fs.readFileSync('src/limbs/spatial/GameplaySovereigntyLimb.ts', 'utf8');
// Fix L233: Promise<string | null> to string
gsl = gsl.replace(
    /return await SpatialSovereigntyLimb\.getInstance\(\)\.queryTileContent\(plane, x, y\);/g,
    'return (await SpatialSovereigntyLimb.getInstance().queryTileContent(plane, x, y)) || "None";'
);
// Fix L439, 469, 474, 488: Object is possibly 'undefined' (e.g. state?.varps etc)
gsl = gsl.replace(/state\.varbits\.set/g, 'state!.varbits!.set');
gsl = gsl.replace(/state\.varbits\.get/g, 'state!.varbits!.get');
gsl = gsl.replace(/state\.varps\.set/g, 'state!.varps!.set');
gsl = gsl.replace(/state\.varcs\.set/g, 'state!.varcs!.set');
// Some specific replacements based on the typical usage in the file
gsl = gsl.replace(/this\.globalState\.varbits\.set/g, 'this.globalState!.varbits!.set');
gsl = gsl.replace(/this\.globalState\.varps\.set/g, 'this.globalState!.varps!.set');
gsl = gsl.replace(/this\.globalState\.varcs\.set/g, 'this.globalState!.varcs!.set');
gsl = gsl.replace(/this\.globalState\.varbits\.get/g, 'this.globalState!.varbits!.get');
fs.writeFileSync('src/limbs/spatial/GameplaySovereigntyLimb.ts', gsl, 'utf8');
console.log('Fixed GameplaySovereigntyLimb.ts');

// 3. NodeTester.ts - missing yaoState
let nt = fs.readFileSync('src/monitor/NodeTester.ts', 'utf8');
nt = nt.replace(
    /return \{ status: 'DEGRADED', details: `File path missing`, category, path, role, docDomain \};\s*/g,
    "return { status: 'DEGRADED', details: `File path missing`, category, path, role, docDomain, yaoState: 0 as any };\n"
);
nt = nt.replace(
    /return \{ status: 'OFFLINE', details: `Critical check failed: \$\{err\.message\}`, category, path, role, docDomain \};\s*/g,
    "return { status: 'OFFLINE', details: `Critical check failed: ${err.message}`, category, path, role, docDomain, yaoState: 0 as any };\n"
);
fs.writeFileSync('src/monitor/NodeTester.ts', nt, 'utf8');
console.log('Fixed NodeTester.ts');

// 4. AppearanceBlockDecoder.ts & HitsplatBlockDecoder.ts & ItemLifecycleLimb.ts
// Add missing method signatures to models.ts
let md = fs.readFileSync('src/core/models.ts', 'utf8');
if (!md.includes('applyDamage(amount: number)')) {
    md = md.replace(
        /export interface SovereignAvatar extends NPC \{([^\}]+)\}/,
        "export interface SovereignAvatar extends NPC {$1\n    applyDamage?(amount: number): number;\n    heal?(amount: number): number;\n    firstEmptySlot?(): number | null;\n}"
    );
    fs.writeFileSync('src/core/models.ts', md, 'utf8');
    console.log('Fixed models.ts (SovereignAvatar interface)');
}

// 5. AppearanceBlockDecoder.ts fix
let appearance = fs.readFileSync('src/limbs/logical/world/AppearanceBlockDecoder.ts', 'utf8');
appearance = appearance.replace(/avatar\.metadata\./g, 'avatar.metadata?.');
fs.writeFileSync('src/limbs/logical/world/AppearanceBlockDecoder.ts', appearance, 'utf8');
console.log('Fixed AppearanceBlockDecoder.ts');

// 6. HitsplatBlockDecoder.ts fix
let hitsplat = fs.readFileSync('src/limbs/logical/world/HitsplatBlockDecoder.ts', 'utf8');
hitsplat = hitsplat.replace(/avatar\.applyDamage\(/g, 'avatar.applyDamage?.(');
hitsplat = hitsplat.replace(/avatar\.heal\(/g, 'avatar.heal?.(');
fs.writeFileSync('src/limbs/logical/world/HitsplatBlockDecoder.ts', hitsplat, 'utf8');
console.log('Fixed HitsplatBlockDecoder.ts');

// 7. ItemLifecycleLimb.ts fix
let ill = fs.readFileSync('src/limbs/spatial/ItemLifecycleLimb.ts', 'utf8');
ill = ill.replace(/avatar\.firstEmptySlot\(\)/g, 'avatar.firstEmptySlot?.() ?? -1');
fs.writeFileSync('src/limbs/spatial/ItemLifecycleLimb.ts', ill, 'utf8');
console.log('Fixed ItemLifecycleLimb.ts');
