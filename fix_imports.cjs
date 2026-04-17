const fs = require("fs");

const fixes = {
    "src/rsmv/viewer/RSEngine.ts": [
        ['import("./RSSpatialManager")', 'import("./RSSpatialManager.js")'],
        ['import("../map/grounding_logic")', 'import("../map/grounding_logic.js")'],
        ['import("../3d/modelnodes")', 'import("../3d/modelnodes.js")'],
        ['import("./SovereignPersistence")', 'import("./SovereignPersistence.js")'],
    ],
    "src/rsmv/viewer/index.tsx": [
        ['import("../map/grounding_logic")', 'import("../map/grounding_logic.js")'],
    ],
    "src/rsmv/viewer/maincomponents.tsx": [
        ['import("../map/grounding_logic")', 'import("../map/grounding_logic.js")'],
        ['from "../map/grounding_logic"', 'from "../map/grounding_logic.js"'],
    ],
    "src/rsmv/viewer/SovereignContainerLogic.ts": [
        ['from "./SovereignPersistence"', 'from "./SovereignPersistence.js"'],
    ],
    "src/rsmv/viewer/SovereignHUD.tsx": [
        ['from "./SovereignBridge"', 'from "./SovereignBridge.js"'],
    ],
};

for (const [file, reps] of Object.entries(fixes)) {
    if (!fs.existsSync(file)) { console.log("SKIP: " + file); continue; }
    let c = fs.readFileSync(file, "utf8");
    let n = 0;
    for (const [old, rep] of reps) {
        if (c.includes(old)) {
            c = c.replaceAll(old, rep);
            n++;
        }
    }
    if (n > 0) {
        fs.writeFileSync(file, c, "utf8");
        console.log("FIXED " + n + " in " + file);
    } else {
        console.log("NO CHANGES in " + file);
    }
}
