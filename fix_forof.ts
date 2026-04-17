import * as fs from "fs";
import * as path from "path";

// TS2483: "The left-hand side of a 'for...of' statement cannot use a type annotation."
// The fix_ts.ts script incorrectly added `: any` to for-of loop variables.
// This script surgically reverts those destructive annotations.

// Pattern: `for (const varName: any of` → `for (const varName of`
// Also handles `let` and `var`
const FOR_OF_REGEX = /\bfor\s*\(\s*(const|let|var)\s+(\[?[a-zA-Z_$][\w$,\s\[\]]*\]?)\s*:\s*any\s+of\b/g;

const files = [
    "src/rsmv/3d/animationframes.ts",
    "src/rsmv/3d/animationframestoskeletal.ts",
    "src/rsmv/3d/animationskeletal.ts",
    "src/rsmv/3d/avatar.ts",
    "src/rsmv/3d/classicmap.ts",
    "src/rsmv/3d/modelnodes.ts",
    "src/rsmv/3d/proceduraltexture.ts",
    "src/rsmv/3d/rt2model.ts",
    "src/rsmv/3d/rt5model.ts",
    "src/rsmv/3d/rt7model.ts",
    "src/rsmv/3d/sprite.ts",
    "src/rsmv/3d/webglleaktest.ts",
    "src/rsmv/buildfiletypes.ts",
    "src/rsmv/cache/autocache.ts",
    "src/rsmv/cache/classicloader.ts",
    "src/rsmv/cache/downloader.ts",
    "src/rsmv/cache/index.ts",
    "src/rsmv/cache/openrs2loader.ts",
    "src/rsmv/cache/sqlite.ts",
    "src/rsmv/cache/sqlitewasm.ts",
    "src/rsmv/cache/sqlitewasmworker.ts",
    "src/rsmv/clientscript/ast.ts",
    "src/rsmv/clientscript/ast_nodes.ts",
    "src/rsmv/clientscript/callibrator.ts",
    "src/rsmv/clientscript/codeparser.ts",
    "src/rsmv/clientscript/codewriter.ts",
    "src/rsmv/clientscript/definitions.ts",
    "src/rsmv/clientscript/extractmodule.ts",
    "src/rsmv/clientscript/index.ts",
    "src/rsmv/clientscript/interpreter.ts",
    "src/rsmv/clientscript/jsonwriter.ts",
    "src/rsmv/clientscript/subtypedetector.ts",
    "src/rsmv/clientscript/util.ts",
    "src/rsmv/find_sounds.ts",
    "src/rsmv/headless/StructuralAnalyzer.ts",
    "src/rsmv/imgutils.ts",
    "src/rsmv/libs/yieldparser.ts",
    "src/rsmv/map/chunksummary.ts",
    "src/rsmv/map/collisionimage.ts",
    "src/rsmv/map/grounding_logic.ts",
    "src/rsmv/map/index.ts",
    "src/rsmv/map/mapcli.ts",
    "src/rsmv/map/mipper.ts",
    "src/rsmv/map/progressui.ts",
    "src/rsmv/map/svgrender.ts",
    "src/rsmv/scripts/audit_pedagogy.ts",
    "src/rsmv/scripts/cachediff.ts",
    "src/rsmv/scripts/cluecoords.ts",
    "src/rsmv/scripts/dependencies.ts",
    "src/rsmv/scripts/extract_prifddinas_logic.ts",
    "src/rsmv/scripts/extract_sovereign_taxonomic.ts",
    "src/rsmv/scripts/extract_spatial_grounding.ts",
    "src/rsmv/scripts/extractfiles.ts",
    "src/rsmv/scripts/filehistory.ts",
    "src/rsmv/scripts/gameinterfaces.ts",
    "src/rsmv/scripts/generate_pedagogy_registries.ts",
    "src/rsmv/scripts/ground_prifddinas.ts",
    "src/rsmv/scripts/groupskeletons.ts",
    "src/rsmv/scripts/indexoverview.ts",
    "src/rsmv/scripts/materialize_thick_substrates.ts",
    "src/rsmv/scripts/musictrack.ts",
    "src/rsmv/scripts/openrs2ids.ts",
    "src/rsmv/scripts/previewall.ts",
    "src/rsmv/scripts/probe_all_tables.ts",
    "src/rsmv/scripts/probe_dbrows.ts",
    "src/rsmv/scripts/probe_dbtables.ts",
    "src/rsmv/scripts/probe_framemap.ts",
    "src/rsmv/scripts/probe_hex.ts",
    "src/rsmv/scripts/probe_items.ts",
    "src/rsmv/scripts/probe_locales.ts",
    "src/rsmv/scripts/probe_map_npcs.ts",
    "src/rsmv/scripts/probe_row2353.ts",
    "src/rsmv/scripts/quickchatlookup.ts",
    "src/rsmv/scripts/rendercutscene.ts",
    "src/rsmv/scripts/renderrsinterface.ts",
    "src/rsmv/scripts/research_prifddinas_interactions.ts",
    "src/rsmv/scripts/scan_table39.ts",
    "src/rsmv/scripts/scrapeavatars.ts",
    "src/rsmv/scripts/synthesize_havenhythe.ts",
    "src/rsmv/scripts/synthesize_prifddinas.ts",
    "src/rsmv/utils.ts",
    "src/rsmv/viewer/jsonsearch.tsx",
    "src/rsmv/viewer/maincomponents.tsx",
    "src/rsmv/viewer/RSEngine.ts",
    "src/rsmv/viewer/RSMeshLoader.ts",
    "src/rsmv/viewer/RSSpatialManager.ts",
    "src/rsmv/viewer/rsuiviewer.tsx",
    "src/rsmv/viewer/scenenodes.tsx",
    "src/rsmv/viewer/scriptsui.tsx",
    "src/rsmv/viewer/SovereignGroundingStream.ts",
    "src/rsmv/viewer/SovereignThickSubstrateParser.ts",
    "src/rsmv/viewer/SovereignValidator.ts",
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
    
    const newContent = content.replace(FOR_OF_REGEX, (match, keyword, varName) => {
        count++;
        return `for (${keyword} ${varName} of`;
    });
    
    if (count > 0) {
        fs.writeFileSync(fullPath, newContent, "utf8");
        console.log(`FIXED ${count} for-of annotations in ${relPath}`);
        totalFixed += count;
    }
}

console.log(`\nTotal for-of annotations reverted: ${totalFixed}`);
