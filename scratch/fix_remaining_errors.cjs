const fs = require('fs');
const path = require('path');

// 1. Fix GameplaySovereigntyLimb
const limbPath = path.join(__dirname, '../src/limbs/spatial/GameplaySovereigntyLimb.ts');
if (fs.existsSync(limbPath)) {
    let content = fs.readFileSync(limbPath, 'utf8');
    const pushActionTarget = "public pushAction(action: string): string {";
    const pushActionReplacement = "public async pushAction(action: string): Promise<string> {";
    const onActionCallTarget = "return this.activeModule.onAction(action, this.globalState, this.avatar);";
    const onActionCallReplacement = "return await this.activeModule.onAction(action, this.globalState, this.avatar);";

    if (content.includes(pushActionTarget)) {
        content = content.replace(pushActionTarget, pushActionReplacement).replace(onActionCallTarget, onActionCallReplacement);
        fs.writeFileSync(limbPath, content);
        console.log('Fixed GameplaySovereigntyLimb pushAction.');
    }
}

// 2. Fix cli.ts GameState literal
const cliPath = path.join(__dirname, '../src/cli.ts');
if (fs.existsSync(cliPath)) {
    let content = fs.readFileSync(cliPath, 'utf8');
    // Look for the GameState literal around line 2809 (now around line 2835 in restored state)
    const stateLiteralPattern = /npcMap: new Map\(\),\r?\n\s+npcSpatialIndex: new Map\(\),\r?\n\s+objectMap: new Map\(\)/g;
    if (stateLiteralPattern.test(content)) {
        content = content.replace(stateLiteralPattern, 'varps: new Map(),\n        varcs: new Map(),\n        npcMap: new Map(),\n        npcSpatialIndex: new Map(),\n        objectMap: new Map()');
        fs.writeFileSync(cliPath, content);
        console.log('Fixed cli.ts GameState literal.');
    }
}
