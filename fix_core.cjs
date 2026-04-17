const fs = require("fs");

// Fix cli.ts: second mockAvatar and GameState return
let content = fs.readFileSync("src/cli.ts", "utf8");

// Fix mockAvatar at ~line 2842
content = content.replace(
    `quests: { points: 0, completedCount: 0, quests: {} }\r\n    };`,
    `quests: { points: 0, completedCount: 0, quests: {} },\r\n        coord: { x: 0, y: 0, z: 0 },\r\n        interactionState: 'IDLE',\r\n        lastActionTick: 0,\r\n        lastCombatTick: 0,\r\n        cooldowns: {}\r\n    };`
);

// Fix GameState return at ~line 2846
content = content.replace(
    `return {\r\n        plane: 0,\r\n        varbits,\r\n        players,\r\n        npcMap: new Map(),\r\n        npcSpatialIndex: new Map(),\r\n        objectMap: new Map()\r\n    };`,
    `return {\r\n        plane: 0,\r\n        varps: new Map(),\r\n        varcs: new Map(),\r\n        varbits,\r\n        players,\r\n        npcMap: new Map(),\r\n        npcSpatialIndex: new Map(),\r\n        objectMap: new Map()\r\n    };`
);

fs.writeFileSync("src/cli.ts", content, "utf8");
console.log("cli.ts patched (second mockAvatar + GameState)");

// Fix GameplaySovereigntyLimb.ts
let gsl = fs.readFileSync("src/limbs/spatial/GameplaySovereigntyLimb.ts", "utf8");
// Find the GameState construction that's missing varps/varcs
if (gsl.includes("npcSpatialIndex: new Map()") && !gsl.includes("varps:")) {
    gsl = gsl.replace(
        /varbits: new Map\(\)(,?\r?\n\s+lastTickTime:)/,
        "varbits: new Map(),\n            varps: new Map(),\n            varcs: new Map()$1"
    );
    fs.writeFileSync("src/limbs/spatial/GameplaySovereigntyLimb.ts", gsl, "utf8");
    console.log("GameplaySovereigntyLimb.ts patched (varps/varcs)");
}

// Fix ObservationEngine.ts singleton
let obs = fs.readFileSync("src/engines/spatial/ObservationEngine.ts", "utf8");
obs = obs.replace(
    /new WorldForensicsLimb\(\)/g,
    "WorldForensicsLimb.getInstance()"
);
fs.writeFileSync("src/engines/spatial/ObservationEngine.ts", obs, "utf8");
console.log("ObservationEngine.ts patched (singleton)");

// Fix SimulationHarness.ts singleton
let sh = fs.readFileSync("src/engines/gameplay/SimulationHarness.ts", "utf8");
sh = sh.replace(
    /new DBRowOracleLimb\(\)/g,
    "DBRowOracleLimb.getInstance()"
);
fs.writeFileSync("src/engines/gameplay/SimulationHarness.ts", sh, "utf8");
console.log("SimulationHarness.ts patched (singleton)");

// Fix LessonLearner.ts singleton
let ll = fs.readFileSync("src/limbs/spatial/LessonLearner.ts", "utf8");
ll = ll.replace(
    /new SovereignKnowledgeDB\(\)/g,
    "SovereignKnowledgeDB.getInstance()"
);
fs.writeFileSync("src/limbs/spatial/LessonLearner.ts", ll, "utf8");
console.log("LessonLearner.ts patched (singleton)");

// Fix refill_tester.ts singleton
let rt = fs.readFileSync("src/refill_tester.ts", "utf8");
rt = rt.replace(
    /new SovereignKnowledgeDB\(\)/g,
    "SovereignKnowledgeDB.getInstance()"
);
fs.writeFileSync("src/refill_tester.ts", rt, "utf8");
console.log("refill_tester.ts patched (singleton)");

// Fix MechanicalSovereigntyLimb.ts missing path import
let mech = fs.readFileSync("src/limbs/technical/MechanicalSovereigntyLimb.ts", "utf8");
if (!mech.includes("import * as path") && !mech.includes("import path")) {
    // Add path import after the first import line
    mech = mech.replace(
        /(import .+?\n)/,
        "$1import * as path from 'path';\n"
    );
    fs.writeFileSync("src/limbs/technical/MechanicalSovereigntyLimb.ts", mech, "utf8");
    console.log("MechanicalSovereigntyLimb.ts patched (path import)");
}

console.log("\nAll core patches applied.");
