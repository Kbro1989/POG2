const fs = require('fs');

// 1. Fix models.ts SovereignAvatar
let modelsStr = fs.readFileSync('src/core/models.ts', 'utf8');
const oldModels = `    appearance?: {
        bodyColors: [number, number][]; // [original, replacement]
        gender: 'male' | 'female';
    
    applyDamage?(amount: number): number;
    heal?(amount: number): number;
    firstEmptySlot?(): number | null;
};`;
const newModels = `    appearance?: {
        bodyColors: [number, number][]; // [original, replacement]
        gender: 'male' | 'female';
    };
    metadata?: any;
    applyDamage?(amount: number): number;
    heal?(amount: number): number;
    firstEmptySlot?(): number | null;`;

// Using split/join to avoid regex /r/n issues
modelsStr = modelsStr.split(oldModels.replace(/\n/g, '\r\n')).join(newModels.replace(/\n/g, '\r\n'));
modelsStr = modelsStr.split(oldModels).join(newModels); // Fallback for \n
fs.writeFileSync('src/core/models.ts', modelsStr, 'utf8');

// 2. Fix AppearanceBlockDecoder left-hand optional assignment
let app = fs.readFileSync('src/limbs/logical/world/AppearanceBlockDecoder.ts', 'utf8');
app = app.replace(/avatar\.metadata\?\.appearance\s*=\s*appearance;/g, `if(!avatar.metadata) avatar.metadata = {};\n        avatar.metadata.appearance = appearance;`);
fs.writeFileSync('src/limbs/logical/world/AppearanceBlockDecoder.ts', app, 'utf8');

// 3. Fix GameplaySovereigntyLimb promise error again
let gsl = fs.readFileSync('src/limbs/spatial/GameplaySovereigntyLimb.ts', 'utf8');
// The L233 assignment error was probably in tick() or queryTileContent.
// TS2322: Type 'Promise<string | null>' is not assignable to type 'string'.
// looking at L233...
// "return await SpatialSovereigntyLimb.getInstance().queryTileContent(plane, x, y);"
// but function returns a string instead of Promise<string>. 
// Wait, if it awaits, it IS a string (or null). Unless we missed an await or the function signature changed.
// We'll replace it with returning an empty string if null, BUT wait... if it says Promise, then the function itself isn't async?
const match = gsl.match(/public query(\w*)[^{]+{\s+return.*queryTileContent/);
if (match) {
    console.log("Found function:", match[0]);
    gsl = gsl.replace(/public queryTileContent\(plane: number, x: number, y: number\): string \{/, 'public async queryTileContent(plane: number, x: number, y: number): Promise<string> {');
    // or maybe the parent function is missing async
    gsl = gsl.replace(/public getTileContext\(plane: number, x: number, y: number\): string \{/, 'public async getTileContext(plane: number, x: number, y: number): Promise<string> {');
} else {
    // maybe it is named something else
    gsl = gsl.replace(/queryTileContext\(.*?\): string/, (m) => m.replace(': string', ': Promise<string>'));
    gsl = gsl.replace(/getTileContext\(.*?\): string/, (m) => m.replace(': string', ': Promise<string>'));
}
// We'll try a generic replace on "Promise<string | null> is not assignable to type 'string'"
gsl = gsl.replace(/return \(await SpatialSovereigntyLimb.getInstance\(\).queryTileContent\(plane, x, y\)\) \|\| "None";/g, 
                 'const res = await SpatialSovereigntyLimb.getInstance().queryTileContent(plane, x, y); return res || "None";');
fs.writeFileSync('src/limbs/spatial/GameplaySovereigntyLimb.ts', gsl, 'utf8');

console.log("Core 3 fixed");
