import * as fs from "fs";

// Fix destructured for-of/for-in with `: any` annotation
// These have destructuring patterns like `[, left, right]` or `{ buffer, fileid }`
const fixes: [string, number, string, string][] = [
    // [file, lineNum (1-indexed), old pattern, new pattern]
    ["src/rsmv/clientscript/ast.ts", 611,
        "for (let [, left, right]: any of",
        "for (let [, left, right] of"],
    ["src/rsmv/map/index.ts", 719,
        "for (let [hash, { center, locdata }]: any of",
        "for (let [hash, { center, locdata }] of"],
    ["src/rsmv/scripts/previewall.ts", 49,
        "for (let { buffer, fileid }: any of",
        "for (let { buffer, fileid } of"],
    ["src/rsmv/viewer/RSMeshLoader.ts", 134,
        "for (const { rootNode, rsModel }: any of",
        "for (const { rootNode, rsModel } of"],
];

for (const [file, lineNum, oldStr, newStr] of fixes) {
    if (!fs.existsSync(file)) { console.log(`SKIP: ${file}`); continue; }
    let content = fs.readFileSync(file, "utf8");
    if (content.includes(oldStr)) {
        content = content.replace(oldStr, newStr);
        fs.writeFileSync(file, content, "utf8");
        console.log(`FIXED line ${lineNum} in ${file}`);
    } else {
        console.log(`NOT FOUND in ${file}: "${oldStr}"`);
    }
}

// Also check for remaining TS2483/TS2404 patterns we missed
const checkFiles = [
    "src/rsmv/cache/sqlitewasm.ts",
    "src/rsmv/map/mapcli.ts",
    "src/rsmv/scripts/dependencies.ts",
    "src/rsmv/scripts/scrapeavatars.ts",
    "src/rsmv/viewer/maincomponents.tsx",
];

for (const file of checkFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].match(/:\s*any\s+(of|in)\b/)) {
            console.log(`REMAINING in ${file} line ${i+1}: ${lines[i].trim()}`);
        }
    }
}
