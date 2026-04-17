const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/limbs/spatial/GameplaySovereigntyLimb.ts');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Imports
content = content.replace(
    "import { GameState, Result, Item, SkillId, EquipmentSlot, NPC, ok, err } from '../../core/models.js';",
    "import { GameState, Result, Item, SkillId, EquipmentSlot, NPC, ok, err, SovereignAvatar } from '../../core/models.js';"
);
content = content.replace(
    "import { SovereignAvatar } from '../../core/SovereignAvatar.js';",
    "import { SovereignAvatarEntity } from '../../core/SovereignAvatar.js';"
);

// 2. Fix globalState literal
const statePattern = /varbits: new Map\(\),/g;
content = content.replace(statePattern, 'varps: new Map(),\n        varcs: new Map(),\n        varbits: new Map(),');

// 3. Fix Constructor Instantiation
content = content.replace(
    "this.avatar = new SovereignAvatar('POG2_Sovereign');",
    "this.avatar = new SovereignAvatarEntity('POG2_Sovereign') as any as SovereignAvatar;"
);

// 4. Fix forceTick (async)
content = content.replace(
    "public forceTick(): string | null {\n        return this.processTick();\n    }",
    "public async forceTick(): Promise<string | null> {\n        return await this.processTick();\n    }"
);

// 5. Fix onTick call (await)
content = content.replace(
    "moduleResult = this.activeModule.onTick(this.tickCount, this.globalState, this.avatar);",
    "moduleResult = await this.activeModule.onTick(this.tickCount, this.globalState, this.avatar);"
);

// 6. Fix Iterator Implicit Any
content = content.replace(
    "const existing = this.avatar.bank.find(i => i.id === item.id);",
    "const existing = this.avatar.bank.find((i: Item) => i.id === item.id);"
);
content = content.replace(
    "this.avatar.inventory.forEach((item, slot) => {",
    "this.avatar.inventory.forEach((item: Item | null, slot: number) => {"
);

// 7. Fix Null Safety (possibly undefined)
// Line 425: this.globalState.graves.set(graveKey, graveMarker); -> graveMarker is local, should be fine?
// Actually the errors from the IDE are helpful:
// - "Object is possibly 'undefined'" at 425, 455, 460, 474.
// Let's ensure the Maps are correctly typed.
// In models.ts, GameState likely has: graves: Map<string, GraveMarker> | undefined; 
// or groundItems: Map<string, Item[]> | undefined;
// If so, we need to check if they exist.

content = content.replace(
    "this.globalState.graves.set(graveKey, graveMarker);",
    "this.globalState.graves?.set(graveKey, graveMarker);"
);
content = content.replace(
    "const grave = this.globalState.graves.get(graveKey);",
    "const grave = this.globalState.graves?.get(graveKey);"
);
content = content.replace(
    "this.globalState.graves.delete(graveKey);",
    "this.globalState.graves?.delete(graveKey);"
);
content = content.replace(
    "const items = this.globalState.groundItems.get(key);",
    "const items = this.globalState.groundItems?.get(key);"
);

fs.writeFileSync(filePath, content);
console.log('GameplaySovereigntyLimb.ts stabilized.');
