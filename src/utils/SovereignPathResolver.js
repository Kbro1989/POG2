"use strict";
/**
 * SovereignPathResolver - Centralized TERNARY path resolution
 *
 * Philosophy: True Ternary Architecture
 * Tier 1 (+1): D:\ Sovereign Drive - Persistent, stable, high capacity
 * Tier 2 (0):  ~/.pog2-sovereign - User home, portable across projects
 * Tier 3 (-1): .pog in project root - Project-local, fully portable
 *
 * The system auto-escalates to the highest available tier, or you can
 * force a specific tier via environment variables.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SovereignPaths = void 0;
exports.setProjectRoot = setProjectRoot;
exports.hasHighPerformanceSubstrate = hasHighPerformanceSubstrate;
exports.hasSovereignDrive = hasSovereignDrive;
exports.detectPathTier = detectPathTier;
exports.getSovereignRoot = getSovereignRoot;
exports.resolveSovereignPath = resolveSovereignPath;
exports.getRSMVSubstratePath = getRSMVSubstratePath;
exports.getTransientClonePath = getTransientClonePath;
exports.getAgentSubstratePath = getAgentSubstratePath;
exports.getStaticResourcesPath = getStaticResourcesPath;
exports.getRSMVCachePath = getRSMVCachePath;
exports.getGodHeadRoot = getGodHeadRoot;
exports.getOllamaModelsPath = getOllamaModelsPath;
exports.getGutenbergPath = getGutenbergPath;
exports.getSystemRoot = getSystemRoot;
exports.getPipelineRootPath = getPipelineRootPath;
exports.getGenerationsPath = getGenerationsPath;
exports.getVectorDbPath = getVectorDbPath;
exports.getSatelliteDbPaths = getSatelliteDbPaths;
exports.getPipelinePath = getPipelinePath;
exports.getTrainingInteractionsPath = getTrainingInteractionsPath;
exports.getTrainingDecisionsPath = getTrainingDecisionsPath;
exports.getTrainingHistoryPath = getTrainingHistoryPath;
exports.getTrainingMetricsPath = getTrainingMetricsPath;
exports.getTrainingThinkingPath = getTrainingThinkingPath;
exports.getTrainingFPRAGPath = getTrainingFPRAGPath;
exports.getTrainingErrorFixesPath = getTrainingErrorFixesPath;
exports.getTrainingConsequencesPath = getTrainingConsequencesPath;
exports.getRscDataPath = getRscDataPath;
exports.getCircuitStatePath = getCircuitStatePath;
exports.getLearningDbPath = getLearningDbPath;
exports.getPerformanceDbPath = getPerformanceDbPath;
exports.getDashboardPath = getDashboardPath;
exports.getSnapshotPath = getSnapshotPath;
exports.getPedagogyPath = getPedagogyPath;
exports.getCachePedagogyPath = getCachePedagogyPath;
exports.getCachePedagogyFile = getCachePedagogyFile;
exports.getAtlasLogicPath = getAtlasLogicPath;
exports.getAtlasSystemPath = getAtlasSystemPath;
exports.getCliTsConfigPath = getCliTsConfigPath;
exports.resolveSpatialAnchor = resolveSpatialAnchor;
exports.getAtlasSpatialPath = getAtlasSpatialPath;
exports.resolveLogicFragment = resolveLogicFragment;
var fs_1 = require("fs");
var path_1 = require("path");
var os_1 = require("os");
// Core Sovereign Locations (ROOT ANCHORED per user setup)
var SOVEREIGN_HOME_ROOT = (0, path_1.join)((0, os_1.homedir)(), '.pog2-sovereign');
/**
 * Returns the effective Sovereign root directory.
 * Priority: 1. Environment Variable POG_SOVEREIGN_ROOT
 *           2. Existing D:\sovereign (Backward compatibility)
 *           3. OS-aware default (Home directory)
 */
function getEffectiveSovereignLair() {
    var envRoot = process.env['POG_SOVEREIGN_ROOT'];
    if (envRoot)
        return envRoot;
    // Direct redirection to the Sovereign substrate drive
    if (process.platform === 'win32') {
        var dDrive = 'D:\\sovereign';
        if (!(0, fs_1.existsSync)(dDrive)) {
            try {
                (0, fs_1.mkdirSync)(dDrive, { recursive: true });
            }
            catch ( /* Fallback to home */_a) { /* Fallback to home */ }
        }
        if ((0, fs_1.existsSync)(dDrive))
            return dDrive;
    }
    return SOVEREIGN_HOME_ROOT;
}
var SOVEREIGN_D_LAIR = getEffectiveSovereignLair();
var SOVEREIGN_D_ROOT = SOVEREIGN_D_LAIR;
// Model Storage (separate from config for size reasons)
// DERIVED from SOVEREIGN_D_LAIR to ensure portability
var OLLAMA_D_PATH = (0, path_1.join)((0, path_1.dirname)(SOVEREIGN_D_LAIR), 'ollama-models');
var GUTENBERG_D_PATH = (0, path_1.join)(SOVEREIGN_D_LAIR, 'pog-gutenberg');
var OLLAMA_LAIR_PATH = (0, path_1.join)(SOVEREIGN_D_LAIR, 'ollama-models');
var GENERATIONS_D_PATH = (0, path_1.join)(SOVEREIGN_D_LAIR, 'generations');
var MEMORY_D_PATH = (0, path_1.join)(SOVEREIGN_D_LAIR, 'memory');
var LEARNING_D_PATH = (0, path_1.join)(SOVEREIGN_D_LAIR, 'learning');
// Cached project root for tier -1 resolution
var _projectRoot = null;
/**
 * Sets the project root for Tier -1 (ProjectLocal) resolution
 */
function setProjectRoot(root) {
    _projectRoot = root;
}
/**
 * Detects if a high-performance substrate drive is available.
 * Renamed from hasSovereignDrive for universal compatibility.
 */
function hasHighPerformanceSubstrate() {
    try {
        var root = getEffectiveSovereignLair();
        if (!(0, fs_1.existsSync)(root))
            return false;
        var stat = (0, fs_1.statSync)(root);
        return stat.isDirectory();
    }
    catch (_a) {
        return false;
    }
}
/**
 * Legacy alias for hasHighPerformanceSubstrate
 */
function hasSovereignDrive() {
    return hasHighPerformanceSubstrate();
}
/**
 * Detects the current path tier based on environment and availability
 * @returns PathTier value: 1 (Sovereign), 0 (Home), or -1 (ProjectLocal)
 */
function detectPathTier() {
    // Environment override: force a specific tier
    var forcedTier = process.env['POG_PATH_TIER'];
    if (forcedTier === '1' || forcedTier === 'sovereign')
        return 1 /* PathTier.Sovereign */;
    if (forcedTier === '0' || forcedTier === 'home')
        return 0 /* PathTier.Home */;
    if (forcedTier === '-1' || forcedTier === 'local')
        return -1 /* PathTier.ProjectLocal */;
    // Auto-detect: try highest tier first
    if (hasHighPerformanceSubstrate())
        return 1 /* PathTier.Sovereign */;
    // Check if project-local is explicitly requested
    var useLocal = process.env['POG_USE_LOCAL'] === 'true';
    if (useLocal && _projectRoot)
        return -1 /* PathTier.ProjectLocal */;
    // Default to Home tier (balanced) 
    return 0 /* PathTier.Home */;
}
/**
 * Ensures the Home tier directory exists and returns its path
 */
function ensureHomeRoot() {
    if (!(0, fs_1.existsSync)(SOVEREIGN_HOME_ROOT)) {
        (0, fs_1.mkdirSync)(SOVEREIGN_HOME_ROOT, { recursive: true });
    }
    return SOVEREIGN_HOME_ROOT;
}
/**
 * Returns the root directory for the given (or detected) tier
 * True ternary: +1 -> Sovereign Root, 0 -> Home, -1 -> Project-local
 */
function getSovereignRoot(tier) {
    var resolvedTier = tier !== null && tier !== void 0 ? tier : detectPathTier();
    // Tier +1: Sovereign Root (Flexible based on getEffectiveSovereignLair)
    if (resolvedTier === 1 /* PathTier.Sovereign */) {
        var lair = getEffectiveSovereignLair();
        // Phase 14: Eagerly bootstrap the entire 12-directory sovereign substrate
        bootstrapSovereignSubstrate(lair);
        return lair;
    }
    // Tier -1: Project Local (with fallback to Home if no project root)
    if (resolvedTier === -1 /* PathTier.ProjectLocal */ && _projectRoot) {
        var localPath = (0, path_1.join)(_projectRoot, '.pog');
        if (!(0, fs_1.existsSync)(localPath)) {
            (0, fs_1.mkdirSync)(localPath, { recursive: true });
        }
        return localPath;
    }
    // Tier 0: Home (~/.pog2-sovereign) - default balanced tier
    return ensureHomeRoot();
}
/**
 * Resolves a subpath within the sovereign root
 * @param subpath - Relative path (e.g., 'snapshots', 'dashboards/session-123')
 * @param tier - Optional tier override
 * @returns Absolute path to the resolved location
 */
function resolveSovereignPath(subpath, tier) {
    var root = getSovereignRoot(tier);
    var resolved = (0, path_1.join)(root, subpath);
    // Ensure parent directory exists
    var parentDir = (0, path_1.dirname)(resolved);
    if (!(0, fs_1.existsSync)(parentDir)) {
        (0, fs_1.mkdirSync)(parentDir, { recursive: true });
    }
    return resolved;
}
/**
 * Bootstraps the 12 core directories required for training, pipelines, and memory.
 * Ensures the substrate is fully initialized and directories are not missing.
 */
function bootstrapSovereignSubstrate(root) {
    var requiredDirs = [
        'training/interactions',
        'training/decisions',
        'training/history',
        'training/metrics',
        'training/thinking',
        'training/fprag',
        'training/error_fixes',
        'training/consequences',
        'pipelines',
        'memory',
        'snapshots',
        'generations',
        'pog-gutenberg'
    ];
    if (!(0, fs_1.existsSync)(root)) {
        (0, fs_1.mkdirSync)(root, { recursive: true });
    }
    for (var _i = 0, requiredDirs_1 = requiredDirs; _i < requiredDirs_1.length; _i++) {
        var dir = requiredDirs_1[_i];
        var p = (0, path_1.join)(root, dir);
        if (!(0, fs_1.existsSync)(p)) {
            (0, fs_1.mkdirSync)(p, { recursive: true });
        }
    }
}
/**
 * Returns the absolute path to the RSMV Inspector substrate.
 * Authoritative: D:\sovereign\cache_pedagogy\rsmv_inspector
 */
function getRSMVSubstratePath() {
    var envPath = process.env['POG_RSMV_SUBSTRATE_PATH'];
    if (envPath && (0, fs_1.existsSync)(envPath))
        return envPath;
    // Sovereign substrate location (authoritative D: drive inspector)
    var sovereignPath = (0, path_1.join)('D:\\sovereign', 'cache_pedagogy', 'rsmv_inspector');
    if ((0, fs_1.existsSync)(sovereignPath))
        return sovereignPath;
    // Fallback: system-aware default if D is unavailable
    return (0, path_1.join)(getSovereignRoot(), 'cache_pedagogy', 'rsmv_inspector');
}
/**
 * Resolves the path to the transient/tmp repository clones (like Kbro1989/rsmv)
 * This is distinct from the active runtime substrate (RSMV Inspector).
 */
function getTransientClonePath(repoPath) {
    if (_projectRoot) {
        return (0, path_1.join)(_projectRoot, 'tmp', repoPath);
    }
    return resolveSovereignPath("tmp/".concat(repoPath));
}
/**
 * Resolves the path to the internal AI Instruction Substrate (.agent or .agents)
 * Used for accessing neural workflows and rule sets.
 */
function getAgentSubstratePath() {
    if (_projectRoot) {
        var pluralPath = (0, path_1.join)(_projectRoot, '.agents');
        if ((0, fs_1.existsSync)(pluralPath))
            return pluralPath;
        var singularPath = (0, path_1.join)(_projectRoot, '.agent');
        return singularPath;
    }
    return resolveSovereignPath('.agents');
}
/**
 * Resolves the path to the project's static resources (e.g. webviewer-deconstructed)
 */
function getStaticResourcesPath() {
    if (_projectRoot) {
        return (0, path_1.join)(_projectRoot, 'resources');
    }
    return resolveSovereignPath('resources');
}
/**
 * Returns the formal structural path to the local Jagex/RuneScape cache.
 * Governs the vision bridge's access to underlying model data.
 */
function getRSMVCachePath() {
    if (process.env['POG_RSMV_CACHE_DIR'])
        return process.env['POG_RSMV_CACHE_DIR'];
    if (process.platform === 'win32') {
        var rs3Path = 'C:\\ProgramData\\Jagex\\RuneScape';
        if ((0, fs_1.existsSync)(rs3Path))
            return rs3Path;
        var jagexRoot = 'C:\\ProgramData\\Jagex';
        if ((0, fs_1.existsSync)(jagexRoot))
            return jagexRoot;
    }
    return (0, path_1.join)((0, os_1.homedir)(), 'Jagex', 'RuneScape');
}
/**
 * Returns the "God Head" root - the current active workspace.
 * This is the source of truth for pog2.md context.
 */
function getGodHeadRoot() {
    return _projectRoot;
}
/**
 * Gets the Ollama models path (Environment override or derived from root)
 */
function getOllamaModelsPath() {
    var envPath = process.env['OLLAMA_MODELS_PATH'] || process.env['POG_ERROR_TRACKER_PATH'];
    if (envPath && (0, fs_1.existsSync)(envPath))
        return envPath;
    if (hasHighPerformanceSubstrate()) {
        var root = getEffectiveSovereignLair();
        // Check for models in ROOT/../ollama-models OR ROOT/ollama-models
        var pathsToTry = [
            (0, path_1.join)((0, path_1.dirname)(root), 'ollama-models'),
            (0, path_1.join)(root, 'ollama-models')
        ];
        for (var _i = 0, pathsToTry_1 = pathsToTry; _i < pathsToTry_1.length; _i++) {
            var p = pathsToTry_1[_i];
            if ((0, fs_1.existsSync)(p))
                return p;
        }
        var lairPath = (0, path_1.join)(root, 'ollama-models');
        if (!(0, fs_1.existsSync)(lairPath)) {
            try {
                (0, fs_1.mkdirSync)(lairPath, { recursive: true });
            }
            catch ( /* Fallback */_a) { /* Fallback */ }
        }
        return lairPath;
    }
    // Default to whatever Ollama uses internally
    return '';
}
/**
 * Gets the Gutenberg library path (Environment override or derived from root)
 */
function getGutenbergPath() {
    var envPath = process.env['POG_GUTENBERG_PATH'];
    if (envPath && (0, fs_1.existsSync)(envPath))
        return envPath;
    if (hasHighPerformanceSubstrate()) {
        var root = getEffectiveSovereignLair();
        var gutenberg = (0, path_1.join)(root, 'pog-gutenberg');
        if (!(0, fs_1.existsSync)(gutenberg)) {
            (0, fs_1.mkdirSync)(gutenberg, { recursive: true });
        }
        return gutenberg;
    }
    // Priority 2: Project-local library if it exists
    if (_projectRoot) {
        var projectLocalGutenberg = (0, path_1.join)(_projectRoot, 'sovereign', 'pog-gutenberg');
        if ((0, fs_1.existsSync)(projectLocalGutenberg))
            return projectLocalGutenberg;
    }
    // Fallback to path relative to home/system sovereign root
    return resolveSovereignPath('gutenberg');
}
/**
 * Gets the system root (alias for sovereign root)
 */
function getSystemRoot(tier) {
    return getSovereignRoot(tier);
}
/**
 * Gets the root path for production pipelines
 */
function getPipelineRootPath() {
    if (hasHighPerformanceSubstrate()) {
        var root = getSovereignRoot();
        var p = (0, path_1.join)(root, 'pipelines');
        if (!(0, fs_1.existsSync)(p))
            (0, fs_1.mkdirSync)(p, { recursive: true });
        return p;
    }
    return resolveSovereignPath('pipelines');
}
/**
 * Gets path for generations of media
 */
function getGenerationsPath() {
    if (hasHighPerformanceSubstrate()) {
        var root = getSovereignRoot();
        var p = (0, path_1.join)(root, 'generations');
        if (!(0, fs_1.existsSync)(p))
            (0, fs_1.mkdirSync)(p, { recursive: true });
        return p;
    }
    return resolveSovereignPath('generations');
}
/**
 * Gets path for vector/learning database
 */
function getVectorDbPath() {
    if (hasHighPerformanceSubstrate()) {
        var root = getSovereignRoot();
        var p = (0, path_1.join)(root, 'learning');
        if (!(0, fs_1.existsSync)(p))
            (0, fs_1.mkdirSync)(p, { recursive: true });
        return (0, path_1.join)(p, 'sovereign-learning.db');
    }
    return resolveSovereignPath('sovereign-learning.db');
}
/**
 * Phase 28: Federated Multi-DB Support
 * Gets paths for historical/satellite vector databases for readonly contextual queries.
 */
function getSatelliteDbPaths() {
    var dir = hasHighPerformanceSubstrate() ? (0, path_1.join)(getSovereignRoot(), 'learning') : getSovereignRoot();
    var candidates = ['learning.db', 'vibe-learning.db', 'embeddings.db'];
    var validPaths = [];
    for (var _i = 0, candidates_1 = candidates; _i < candidates_1.length; _i++) {
        var name_1 = candidates_1[_i];
        var p = (0, path_1.join)(dir, name_1);
        if ((0, fs_1.existsSync)(p)) {
            validPaths.push(p);
        }
    }
    return validPaths;
}
/**
 * Resolves a specific production pipeline path (category/folder)
 */
function getPipelinePath(category, folderName) {
    var root = getPipelineRootPath();
    var p = (0, path_1.join)(root, category, folderName);
    if (!(0, fs_1.existsSync)(p))
        (0, fs_1.mkdirSync)(p, { recursive: true });
    return p;
}
/**
 * Gets various training data paths
 */
function getTrainingInteractionsPath() { return resolveSovereignPath('training/interactions'); }
function getTrainingDecisionsPath() { return resolveSovereignPath('training/decisions'); }
function getTrainingHistoryPath() { return resolveSovereignPath('training/history'); }
function getTrainingMetricsPath() { return resolveSovereignPath('training/metrics'); }
function getTrainingThinkingPath() { return resolveSovereignPath('training/thinking'); }
function getTrainingFPRAGPath() { return resolveSovereignPath('training/fprag'); }
function getTrainingErrorFixesPath() { return resolveSovereignPath('training/error_fixes'); }
function getTrainingConsequencesPath() { return resolveSovereignPath('training/consequences'); }
/**
 * Gets the RSC data path for archaeology
 */
function getRscDataPath() {
    if (hasHighPerformanceSubstrate()) {
        var root = getSovereignRoot();
        var rscPath = (0, path_1.join)(root, 'rsc-data');
        if (!(0, fs_1.existsSync)(rscPath)) {
            (0, fs_1.mkdirSync)(rscPath, { recursive: true });
        }
        return rscPath;
    }
    return resolveSovereignPath('rsc-data');
}
/**
 * Gets path for circuit breaker state persistence
 */
function getCircuitStatePath() {
    return resolveSovereignPath('circuit-states.json');
}
/**
 * Gets path for learning database
 */
function getLearningDbPath() {
    return getVectorDbPath();
}
/**
 * Gets path for performance history
 */
function getPerformanceDbPath() {
    if (hasHighPerformanceSubstrate()) {
        var root = getSovereignRoot();
        var p = (0, path_1.join)(root, 'memory');
        if (!(0, fs_1.existsSync)(p))
            (0, fs_1.mkdirSync)(p, { recursive: true });
        return (0, path_1.join)(p, 'sovereign-performance.json');
    }
    return resolveSovereignPath('sovereign-performance.json');
}
/**
 * Gets path for session dashboards
 */
function getDashboardPath(sessionId) {
    return resolveSovereignPath("session_dashboards/".concat(sessionId));
}
/**
 * Gets path for snapshots
 */
function getSnapshotPath(snapshotId) {
    if (snapshotId) {
        return resolveSovereignPath("snapshots/".concat(snapshotId));
    }
    return resolveSovereignPath('snapshots');
}
/**
 * Gets the path for pedagogical knowledge substrates
 */
function getPedagogyPath() {
    return resolveSovereignPath('memory/pedagogy');
}
/**
 * Gets the path for cache-extracted pedagogical JSON dumps (forensic exports)
 */
function getCachePedagogyPath() {
    return resolveSovereignPath('cache_pedagogy/json_dumps');
}
/**
 * Resolves a specific forensic JSON file path within the pedagogy substrate
 */
function getCachePedagogyFile(filename) {
    return (0, path_1.join)(getCachePedagogyPath(), filename);
}
/**
 * Phase 29: Sovereign Spatial Engine Substrate
 * Resolves the path to the Atlas logic mappings (e.g., boundaries, region rules).
 */
function getAtlasLogicPath() {
    return resolveSovereignPath('atlas/logic');
}
/**
 * Phase 29: Sovereign Spatial Engine Substrate
 * Resolves the path to the active gameplay sandbox systems (e.g. minigames).
 */
function getAtlasSystemPath() {
    return resolveSovereignPath('atlas/system');
}
/**
 * Resolves the absolute path to this project's tsconfig.json.
 * Uses a module-relative anchor (not CWD) so it works from any directory.
 * Falls back to CWD and then sovereign root.
 */
function getCliTsConfigPath() {
    // Priority 1: Project root configured via setProjectRoot
    if (_projectRoot) {
        var p = (0, path_1.join)(_projectRoot, 'tsconfig.json');
        if ((0, fs_1.existsSync)(p))
            return p;
    }
    // Priority 2: CWD (works when run from project root)
    var cwdPath = (0, path_1.join)(process.cwd(), 'tsconfig.json');
    if ((0, fs_1.existsSync)(cwdPath))
        return cwdPath;
    // Priority 3: Give up â€” return empty so callers can handle gracefully
    return '';
}
/**
 * Phase 34: Sovereign Path Authority (C3 Bridge)
 * Resolves the "Spatial Anchor" for a specific coordinate fragment.
 * Format: m_X_Y (e.g., m_54_50)
 */
function resolveSpatialAnchor(x, z) {
    var mx = x >> 6;
    var mz = z >> 6;
    return "m_".concat(mx, "_").concat(mz);
}
/**
 * Phase 44: Sovereign Spatial Engine Substrate (Authoritative Mapsquare Logic)
 */
function getAtlasSpatialPath() {
    // Phase 44: Force Sovereign D-drive authority for spatial substrates
    if (hasHighPerformanceSubstrate()) {
        return (0, path_1.join)(getSovereignRoot(1 /* PathTier.Sovereign */), 'atlas', 'spatial');
    }
    return resolveSovereignPath('atlas/spatial');
}
/**
 * Phase 34: Sovereign Path Authority (C3 Bridge)
 * Resolves the absolute path to a Regional Logic Fragment (.json or .ts).
 * Priority: 1. D:\sovereign\atlas\spatial\m_X_Y_logic.json (Authoritative Extractions)
 *           2. D:\sovereign\atlas\logic\m_X_Y_logic.json   (System Logic)
 */
function resolveLogicFragment(anchor) {
    // 1. Check D drive spatial first (Authoritative C3 extraction)
    var spatialRoot = getAtlasSpatialPath();
    var spatialJsonPath = (0, path_1.join)(spatialRoot, "".concat(anchor, "_logic.json"));
    if ((0, fs_1.existsSync)(spatialJsonPath)) {
        return spatialJsonPath;
    }
    // 2. Fallback to standard logic directory (System Logic)
    var logicRoot = getAtlasLogicPath();
    var jsonPath = (0, path_1.join)(logicRoot, "".concat(anchor, "_logic.json"));
    var tsPath = (0, path_1.join)(logicRoot, "".concat(anchor, "_logic.ts"));
    if ((0, fs_1.existsSync)(jsonPath))
        return jsonPath;
    if ((0, fs_1.existsSync)(tsPath))
        return tsPath;
    return null;
}
// Export constants for external use (LEGACY - use resolver functions instead)
/** @deprecated use resolver functions */
exports.SovereignPaths = {
    get D_ROOT() { return getSovereignRoot(); },
    HOME_ROOT: SOVEREIGN_HOME_ROOT,
    get OLLAMA() { return getOllamaModelsPath(); },
    get GUTENBERG() { return getGutenbergPath(); },
    get RSC_DATA() { return getRscDataPath(); },
    get GENERATIONS() { return getGenerationsPath(); },
    get MEMORY() { return resolveSovereignPath('memory'); },
    get LEARNING() { return getVectorDbPath(); }
};
