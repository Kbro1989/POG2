// fix_unused.cjs - removes unused named imports from flagged files
const fs = require('fs');
const path = require('path');

const root = 'C:/Users/krist/.gemini/antigravity/scratch/POG2/src';

function read(f) { return fs.readFileSync(f, 'utf8'); }
function write(f, c) { fs.writeFileSync(f, c, 'utf8'); }

// Remove a named identifier from import lines
function removeNamedImport(file, name) {
    if (!fs.existsSync(file)) { console.log(`SKIP (missing): ${file}`); return; }
    let c = read(file);
    const before = c;
    // Remove from middle: ", Name" or "Name, "
    c = c.replace(new RegExp(`,\\s*\\b${name}\\b`, 'g'), '');
    c = c.replace(new RegExp(`\\b${name}\\b,\\s*`, 'g'), '');
    // If now empty braces: "import {  } from 'x';\n" -> remove line
    c = c.replace(/import\s*\{\s*\}\s*from\s*['"][^'"]+['"];?\r?\n?/g, '');
    if (c !== before) console.log(`  FIXED ${path.basename(file)}: -${name}`);
    write(file, c);
}

// Remove an entire import line matching a pattern
function removeImportLine(file, pattern) {
    if (!fs.existsSync(file)) { console.log(`SKIP (missing): ${file}`); return; }
    let lines = read(file).split('\n');
    const before = lines.length;
    lines = lines.filter(l => !pattern.test(l));
    if (lines.length !== before) console.log(`  FIXED ${path.basename(file)}: removed line matching ${pattern}`);
    write(file, lines.join('\n'));
}

// Prefix an unused param with _ in function signatures
function prefixParam(file, name) {
    if (!fs.existsSync(file)) { console.log(`SKIP (missing): ${file}`); return; }
    let c = read(file);
    const before = c;
    // Match param in signature: (name: or (name,  or , name: or , name,
    c = c.replace(new RegExp(`(\\(|,\\s*)${name}(\\s*[,:\\)])`, 'g'), `$1_${name}$2`);
    if (c !== before) console.log(`  FIXED ${path.basename(file)}: ${name} -> _${name}`);
    write(file, c);
}

console.log('=== Removing unused imports ===\n');

// test_vision_pipeline.ts
removeNamedImport(`${root}/test_vision_pipeline.ts`, 'SovereignConfig');

// ToolRegistry.ts - performance is a global declaration attempt
removeImportLine(`${root}/ToolRegistry.ts`, /import.*\bperformance\b/);

// tools
removeImportLine(`${root}/tools/explore_cutscenes.ts`, /^import.*['"]path['"]/);
removeImportLine(`${root}/tools/ollama_tier_bridge.ts`, /^import.*['"]path['"]/);

// ui
removeNamedImport(`${root}/ui/CapabilityBridge.ts`, 'AbilityDefinition');
removeImportLine(`${root}/ui/Renderer.ts`, /import.*chalk/);
removeNamedImport(`${root}/ui/Renderer.ts`, 'SovereignAvatar');
removeNamedImport(`${root}/ui/Renderer.ts`, 'EmotionalState');
removeNamedImport(`${root}/ui/Renderer.ts`, 'SovereignRecord');

// utils
removeImportLine(`${root}/utils/ClockAuthorityRegistry.ts`, /import.*createLogger/);
removeNamedImport(`${root}/utils/CognitiveTranslator.ts`, 'Result');
removeImportLine(`${root}/utils/CompressionEngine.ts`, /import.*createLogger/);
removeImportLine(`${root}/utils/EndpointHealer.ts`, /import.*'\$'/);
removeNamedImport(`${root}/utils/ItemCollector.ts`, 'TruthClass');
removeImportLine(`${root}/utils/NarrativeExtractor.ts`, /import.*createLogger/);
removeNamedImport(`${root}/utils/NpcCollector.ts`, 'WikiMonsterMeta');
removeNamedImport(`${root}/utils/NpcCollector.ts`, 'TruthClass');
removeImportLine(`${root}/utils/PlayerStateExporter.ts`, /import.*createLogger/);
removeNamedImport(`${root}/utils/POG2NativeCacheSource.ts`, 'CacheFileSource');
removeNamedImport(`${root}/utils/PVMEIngester.ts`, 'WikiRotation');
removeNamedImport(`${root}/utils/RSMVExtractor.ts`, 'Result');
removeNamedImport(`${root}/utils/RSMVExtractor.ts`, 'ok');
removeNamedImport(`${root}/utils/RSMVExtractor.ts`, 'err');
removeImportLine(`${root}/utils/SovereignIgnoreManager.ts`, /import.*\{.*join.*sep/);
removeImportLine(`${root}/utils/SovereignIgnoreManager.ts`, /import.*\{.*sep.*join/);
removeNamedImport(`${root}/utils/SovereignPathResolver.ts`, 'writeFileSync');
removeNamedImport(`${root}/utils/SovereignPathResolver.ts`, 'readFileSync');
removeNamedImport(`${root}/utils/WikiEquipmentEnricher.ts`, 'QueryType');
removeNamedImport(`${root}/utils/WikiEquipmentEnricher.ts`, 'GePrice');
removeNamedImport(`${root}/utils/WikiEquipmentEnricher.ts`, 'BestiaryBeastData');
removeImportLine(`${root}/verify_advanced_audio.ts`, /import.*\{.*join.*\}.*['"]path['"]/);

// vision
removeNamedImport(`${root}/vision/PuppeteerEye.ts`, 'CaptureSource');
removeNamedImport(`${root}/vision/PuppeteerEye.ts`, 'CaptureResult');
removeNamedImport(`${root}/vision/PuppeteerEye.ts`, 'YaoState');
removeImportLine(`${root}/vision/PuppeteerEye.ts`, /import.*CanonicalClock/);
removeNamedImport(`${root}/vision/RSMVController.ts`, 'resolve');
removeNamedImport(`${root}/vision/ShaderInjector.ts`, 'SyntaxKind');
removeNamedImport(`${root}/vision/ShaderInjector.ts`, 'VariableDeclaration');
removeNamedImport(`${root}/vision/ShaderInjector.ts`, 'readFileSync');
removeNamedImport(`${root}/vision/ShaderInjector.ts`, 'writeFileSync');
removeImportLine(`${root}/vision/TransientObserver.ts`, /import.*CanonicalClock/);

// cli.ts - unused type/class imports
removeNamedImport(`${root}/cli.ts`, 'VarbitSnapshot');
removeNamedImport(`${root}/cli.ts`, 'CacheForensicsLimb');
removeNamedImport(`${root}/cli.ts`, 'SpatialSovereigntyLimb');
removeNamedImport(`${root}/cli.ts`, 'UniversalInterpreter');
removeNamedImport(`${root}/cli.ts`, 'SovereignGrounding');

console.log('\n=== Prefixing unused params with _ ===\n');

// Unused params -> prefix with _
prefixParam(`${root}/ui/CapabilityBridge.ts`, 'payload');
prefixParam(`${root}/ui/Renderer.ts`, 'reason');
prefixParam(`${root}/tools/annotate_geometry.ts`, 'plane');
prefixParam(`${root}/utils/DirectionalRegistry.ts`, 'width');
prefixParam(`${root}/utils/CompressionEngine.ts`, 'level');
prefixParam(`${root}/utils/PlayerStateExporter.ts`, 'tick');
prefixParam(`${root}/utils/SovereignUI.ts`, 'features');
prefixParam(`${root}/vision/StructuralAnalyzer.ts`, 'buffer');

console.log('\n=== Done ===');
