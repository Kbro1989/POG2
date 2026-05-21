import * as fs from "fs";
import * as path from "path";

// Fix both for-of (TS2483) and for-in (TS2404) patterns
// Pattern: `for (const varName: any of/in` → `for (const varName of/in`
const FOR_LOOP_REGEX = /\bfor\s*\(\s*(const|let|var)\s+(\[?[a-zA-Z_$][\w$,\s\[\]]*\]?)\s*:\s*any\s+(of|in)\b/g;

const files = [
    "src/rsmv/3d/avatar.ts",
    "src/rsmv/3d/gltfutil.ts",
    "src/rsmv/3d/modelnodes.ts",
    "src/rsmv/cache/classicloader.ts",
    "src/rsmv/cache/sqlitewasm.ts",
    "src/rsmv/clientscript/ast.ts",
    "src/rsmv/clientscript/callibrator.ts",
    "src/rsmv/clientscript/codeparser.ts",
    "src/rsmv/map/index.ts",
    "src/rsmv/map/mapcli.ts",
    "src/rsmv/scripts/dependencies.ts",
    "src/rsmv/scripts/indexoverview.ts",
    "src/rsmv/scripts/previewall.ts",
    "src/rsmv/scripts/scrapeavatars.ts",
    "src/rsmv/viewer/maincomponents.tsx",
    "src/rsmv/viewer/RSMeshLoader.ts",
    "src/rsmv/viewer/scenenodes.tsx",
    "src/rsmv/viewer/scriptsui.tsx",
];

let totalFixed = 0;

for (const relPath of files) {
    const fullPath = path.resolve(relPath);
    if (!fs.existsSync(fullPath)) {
        console.log(`SKIP: ${relPath} not found`);
        continue;
    }

    let content = fs.readFileSync(fullPath, "utf8");
    let count = 0;

    const newContent = content.replace(FOR_LOOP_REGEX, (match, keyword, varName, loopType) => {
        count++;
        return `for (${keyword} ${varName} ${loopType}`;
    });

    if (count > 0) {
        fs.writeFileSync(fullPath, newContent, "utf8");
        console.log(`FIXED ${count} for-${count > 0 ? 'in/of' : ''} annotations in ${relPath}`);
        totalFixed += count;
    } else {
        console.log(`NO MATCH in ${relPath} - checking manually...`);
        // Check for non-standard patterns
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(/for\s*\(.*:\s*any\s+(of|in)\b/)) {
                console.log(`  Line ${i + 1}: ${lines[i].trim()}`);
            }
        }
    }
}

console.log(`\nTotal for-in/of annotations reverted: ${totalFixed}`);
