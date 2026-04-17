const fs = require('fs');

let gsl = fs.readFileSync('src/limbs/spatial/GameplaySovereigntyLimb.ts', 'utf8');

// Fix TS2322
gsl = gsl.replace(
    /public forceTick\(\): string \| null \{\s*return this\.processTick\(\);\s*\}/,
    'public async forceTick(): Promise<string | null> {\n        return this.processTick();\n    }'
);

// Fix TS2532 (using exact method calls)
gsl = gsl.replace(/this\.globalState\.graves\.set\(/g, 'this.globalState.graves!.set(');
gsl = gsl.replace(/this\.globalState\.graves\.get\(/g, 'this.globalState.graves!.get(');
gsl = gsl.replace(/this\.globalState\.graves\.delete\(/g, 'this.globalState.graves!.delete(');
gsl = gsl.replace(/this\.globalState\.groundItems\.get\(/g, 'this.globalState.groundItems!.get(');
// also fix any state.varps being undefined that we lost in revert
gsl = gsl.replace(/state\.varbits\.set/g, 'state!.varbits!.set');
gsl = gsl.replace(/state\.varbits\.get/g, 'state!.varbits!.get');
gsl = gsl.replace(/state\.varps\.set/g, 'state!.varps!.set');
gsl = gsl.replace(/state\.varcs\.set/g, 'state!.varcs!.set');
gsl = gsl.replace(/this\.globalState\.varbits\.set/g, 'this.globalState!.varbits!.set');
gsl = gsl.replace(/this\.globalState\.varps\.set/g, 'this.globalState!.varps!.set');
gsl = gsl.replace(/this\.globalState\.varcs\.set/g, 'this.globalState!.varcs!.set');
gsl = gsl.replace(/this\.globalState\.varbits\.get/g, 'this.globalState!.varbits!.get');

fs.writeFileSync('src/limbs/spatial/GameplaySovereigntyLimb.ts', gsl, 'utf8');

console.log("GameplaySovereigntyLimb fixed");
