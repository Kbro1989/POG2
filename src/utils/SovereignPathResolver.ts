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

import { existsSync, mkdirSync, statSync, writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';

// Ternary Path Tiers
export const enum PathTier {
    Sovereign = 1,   // D:\ drive (most stable)
    Home = 0,        // pog2-sovereign
    ProjectLocal = -1 // .pog in project root (most portable)
}

// Core Sovereign Locations (ROOT ANCHORED per user setup)
const SOVEREIGN_HOME_ROOT = join(homedir(), '.pog2-sovereign');

/**
 * Returns the effective Sovereign root directory.
 * Priority: 1. Environment Variable POG_SOVEREIGN_ROOT
 *           2. Existing D:\sovereign (Backward compatibility)
 *           3. OS-aware default (Home directory)
 */
function getEffectiveSovereignLair(): string {
    const envRoot = process.env['POG_SOVEREIGN_ROOT'];
    if (envRoot) return envRoot;

    // Direct redirection to the Sovereign substrate drive
    if (process.platform === 'win32') {
        const dDrive = 'D:\\sovereign';
        if (!existsSync(dDrive)) {
            try { mkdirSync(dDrive, { recursive: true }); } catch { /* Fallback to home */ }
        }
        if (existsSync(dDrive)) return dDrive;
    }

    return SOVEREIGN_HOME_ROOT;
}

const SOVEREIGN_D_LAIR = getEffectiveSovereignLair();
const SOVEREIGN_D_ROOT = SOVEREIGN_D_LAIR;

// Model Storage (separate from config for size reasons)
// DERIVED from SOVEREIGN_D_LAIR to ensure portability
const OLLAMA_D_PATH = join(dirname(SOVEREIGN_D_LAIR), 'ollama-models');
const GUTENBERG_D_PATH = join(SOVEREIGN_D_LAIR, 'pog-gutenberg');
const OLLAMA_LAIR_PATH = join(SOVEREIGN_D_LAIR, 'ollama-models');
const GENERATIONS_D_PATH = join(SOVEREIGN_D_LAIR, 'generations');
const MEMORY_D_PATH = join(SOVEREIGN_D_LAIR, 'memory');
const LEARNING_D_PATH = join(SOVEREIGN_D_LAIR, 'learning');

// Cached project root for tier -1 resolution
let _projectRoot: string | null = null;

/**
 * Sets the project root for Tier -1 (ProjectLocal) resolution
 */
export function setProjectRoot(root: string): void {
    _projectRoot = root;
}

/**
 * Detects if a high-performance substrate drive is available.
 * Renamed from hasSovereignDrive for universal compatibility.
 */
export function hasHighPerformanceSubstrate(): boolean {
    try {
        const root = getEffectiveSovereignLair();
        if (!existsSync(root)) return false;
        const stat = statSync(root);
        return stat.isDirectory();
    } catch {
        return false;
    }
}

/**
 * Legacy alias for hasHighPerformanceSubstrate
 */
export function hasSovereignDrive(): boolean {
    return hasHighPerformanceSubstrate();
}

/**
 * Detects the current path tier based on environment and availability
 * @returns PathTier value: 1 (Sovereign), 0 (Home), or -1 (ProjectLocal)
 */
export function detectPathTier(): PathTier {
    // Environment override: force a specific tier
    const forcedTier = process.env['POG_PATH_TIER'];
    if (forcedTier === '1' || forcedTier === 'sovereign') return PathTier.Sovereign;
    if (forcedTier === '0' || forcedTier === 'home') return PathTier.Home;
    if (forcedTier === '-1' || forcedTier === 'local') return PathTier.ProjectLocal;

    // Auto-detect: try highest tier first
    if (hasHighPerformanceSubstrate()) return PathTier.Sovereign;

    // Check if project-local is explicitly requested
    const useLocal = process.env['POG_USE_LOCAL'] === 'true';
    if (useLocal && _projectRoot) return PathTier.ProjectLocal;

    // Default to Home tier (balanced) 
    return PathTier.Home;
}

/**
 * Ensures the Home tier directory exists and returns its path
 */
function ensureHomeRoot(): string {
    if (!existsSync(SOVEREIGN_HOME_ROOT)) {
        mkdirSync(SOVEREIGN_HOME_ROOT, { recursive: true });
    }
    return SOVEREIGN_HOME_ROOT;
}

/**
 * Returns the root directory for the given (or detected) tier
 * True ternary: +1 -> Sovereign Root, 0 -> Home, -1 -> Project-local
 */
export function getSovereignRoot(tier?: PathTier): string {
    const resolvedTier = tier ?? detectPathTier();

    // Tier +1: Sovereign Root (Flexible based on getEffectiveSovereignLair)
    if (resolvedTier === PathTier.Sovereign) {
        const lair = getEffectiveSovereignLair();
        
        // Phase 14: Eagerly bootstrap the entire 12-directory sovereign substrate
        bootstrapSovereignSubstrate(lair);
        
        return lair;
    }

    // Tier -1: Project Local (with fallback to Home if no project root)
    if (resolvedTier === PathTier.ProjectLocal && _projectRoot) {
        const localPath = join(_projectRoot, '.pog');
        if (!existsSync(localPath)) {
            mkdirSync(localPath, { recursive: true });
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
export function resolveSovereignPath(subpath: string, tier?: PathTier): string {
    const root = getSovereignRoot(tier);
    const resolved = join(root, subpath);

    // Ensure parent directory exists
    const parentDir = dirname(resolved);
    if (!existsSync(parentDir)) {
        mkdirSync(parentDir, { recursive: true });
    }

    return resolved;
}

/**
 * Bootstraps the 12 core directories required for training, pipelines, and memory.
 * Ensures the substrate is fully initialized and directories are not missing.
 */
function bootstrapSovereignSubstrate(root: string): void {
    const requiredDirs = [
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

    if (!existsSync(root)) {
        mkdirSync(root, { recursive: true });
    }

    for (const dir of requiredDirs) {
        const p = join(root, dir);
        if (!existsSync(p)) {
            mkdirSync(p, { recursive: true });
        }
    }
}

/**
 * Returns the formal structural path to the local Jagex/RuneScape cache.
 * Governs the vision bridge's access to underlying model data.
 */
export function getRSMVCachePath(): string {
    if (process.env['POG_RSMV_CACHE_DIR']) return process.env['POG_RSMV_CACHE_DIR'];
    
    if (process.platform === 'win32') {
        const rs3Path = 'C:\\ProgramData\\Jagex\\RuneScape';
        if (existsSync(rs3Path)) return rs3Path;
        return 'C:\\ProgramData\\Jagex';
    }
    
    return join(homedir(), 'Jagex', 'RuneScape');
}

/**
 * Returns the "God Head" root - the current active workspace.
 * This is the source of truth for pog2.md context.
 */
export function getGodHeadRoot(): string | null {
    return _projectRoot;
}

/**
 * Gets the Ollama models path (Environment override or derived from root)
 */
export function getOllamaModelsPath(): string {
    const envPath = process.env['OLLAMA_MODELS_PATH'] || process.env['POG_ERROR_TRACKER_PATH'];
    if (envPath && existsSync(envPath)) return envPath;

    if (hasHighPerformanceSubstrate()) {
        const root = getEffectiveSovereignLair();
        // Check for models in ROOT/../ollama-models OR ROOT/ollama-models
        const pathsToTry = [
            join(dirname(root), 'ollama-models'),
            join(root, 'ollama-models')
        ];
        
        for (const p of pathsToTry) {
            if (existsSync(p)) return p;
        }

        const lairPath = join(root, 'ollama-models');
        if (!existsSync(lairPath)) {
            try {
                mkdirSync(lairPath, { recursive: true });
            } catch { /* Fallback */ }
        }
        return lairPath;
    }

    // Default to whatever Ollama uses internally
    return '';
}

/**
 * Gets the Gutenberg library path (Environment override or derived from root)
 */
export function getGutenbergPath(): string {
    const envPath = process.env['POG_GUTENBERG_PATH'];
    if (envPath && existsSync(envPath)) return envPath;

    if (hasHighPerformanceSubstrate()) {
        const root = getEffectiveSovereignLair();
        const gutenberg = join(root, 'pog-gutenberg');
        if (!existsSync(gutenberg)) {
            mkdirSync(gutenberg, { recursive: true });
        }
        return gutenberg;
    }

    // Priority 2: Project-local library if it exists
    if (_projectRoot) {
        const projectLocalGutenberg = join(_projectRoot, 'sovereign', 'pog-gutenberg');
        if (existsSync(projectLocalGutenberg)) return projectLocalGutenberg;
    }

    // Fallback to path relative to home/system sovereign root
    return resolveSovereignPath('gutenberg');
}

/**
 * Gets the system root (alias for sovereign root)
 */
export function getSystemRoot(tier?: PathTier): string {
    return getSovereignRoot(tier);
}


/**
 * Gets the root path for production pipelines
 */
export function getPipelineRootPath(): string {
    if (hasHighPerformanceSubstrate()) {
        const root = getSovereignRoot();
        const p = join(root, 'pipelines');
        if (!existsSync(p)) mkdirSync(p, { recursive: true });
        return p;
    }
    return resolveSovereignPath('pipelines');
}

/**
 * Gets path for generations of media
 */
export function getGenerationsPath(): string {
    if (hasHighPerformanceSubstrate()) {
        const root = getSovereignRoot();
        const p = join(root, 'generations');
        if (!existsSync(p)) mkdirSync(p, { recursive: true });
        return p;
    }
    return resolveSovereignPath('generations');
}

/**
 * Gets path for vector/learning database
 */
export function getVectorDbPath(): string {
    if (hasHighPerformanceSubstrate()) {
        const root = getSovereignRoot();
        const p = join(root, 'learning');
        if (!existsSync(p)) mkdirSync(p, { recursive: true });
        return join(p, 'sovereign-learning.db');
    }
    return resolveSovereignPath('sovereign-learning.db');
}

/**
 * Phase 28: Federated Multi-DB Support
 * Gets paths for historical/satellite vector databases for readonly contextual queries.
 */
export function getSatelliteDbPaths(): string[] {
    const dir = hasHighPerformanceSubstrate() ? join(getSovereignRoot(), 'learning') : getSovereignRoot();
    const candidates = ['learning.db', 'vibe-learning.db', 'embeddings.db'];
    const validPaths: string[] = [];
    
    for (const name of candidates) {
        const p = join(dir, name);
        if (existsSync(p)) {
            validPaths.push(p);
        }
    }
    
    return validPaths;
}

/**
 * Resolves a specific production pipeline path (category/folder)
 */
export function getPipelinePath(category: string, folderName: string): string {
    const root = getPipelineRootPath();
    const p = join(root, category, folderName);
    if (!existsSync(p)) mkdirSync(p, { recursive: true });
    return p;
}

/**
 * Gets various training data paths
 */
export function getTrainingInteractionsPath(): string { return resolveSovereignPath('training/interactions'); }
export function getTrainingDecisionsPath(): string { return resolveSovereignPath('training/decisions'); }
export function getTrainingHistoryPath(): string { return resolveSovereignPath('training/history'); }
export function getTrainingMetricsPath(): string { return resolveSovereignPath('training/metrics'); }
export function getTrainingThinkingPath(): string { return resolveSovereignPath('training/thinking'); }
export function getTrainingFPRAGPath(): string { return resolveSovereignPath('training/fprag'); }
export function getTrainingErrorFixesPath(): string { return resolveSovereignPath('training/error_fixes'); }
export function getTrainingConsequencesPath(): string { return resolveSovereignPath('training/consequences'); }

/**
 * Gets the RSC data path for archaeology
 */
export function getRscDataPath(): string {
    if (hasHighPerformanceSubstrate()) {
        const root = getSovereignRoot();
        const rscPath = join(root, 'rsc-data');
        if (!existsSync(rscPath)) {
            mkdirSync(rscPath, { recursive: true });
        }
        return rscPath;
    }
    return resolveSovereignPath('rsc-data');
}

/**
 * Gets path for circuit breaker state persistence
 */
export function getCircuitStatePath(): string {
    return resolveSovereignPath('circuit-states.json');
}

/**
 * Gets path for learning database
 */
export function getLearningDbPath(): string {
    return getVectorDbPath();
}

/**
 * Gets path for performance history
 */
export function getPerformanceDbPath(): string {
    if (hasHighPerformanceSubstrate()) {
        const root = getSovereignRoot();
        const p = join(root, 'memory');
        if (!existsSync(p)) mkdirSync(p, { recursive: true });
        return join(p, 'sovereign-performance.json');
    }
    return resolveSovereignPath('sovereign-performance.json');
}

/**
 * Gets path for session dashboards
 */
export function getDashboardPath(sessionId: string): string {
    return resolveSovereignPath(`session_dashboards/${sessionId}`);
}

/**
 * Gets path for snapshots
 */
export function getSnapshotPath(snapshotId?: string): string {
    if (snapshotId) {
        return resolveSovereignPath(`snapshots/${snapshotId}`);
    }
    return resolveSovereignPath('snapshots');
}

/**
 * Gets the path for pedagogical knowledge substrates
 */
export function getPedagogyPath(): string {
    return resolveSovereignPath('memory/pedagogy');
}

/**
 * Gets the path for cache-extracted pedagogical JSON dumps (forensic exports)
 */
export function getCachePedagogyPath(): string {
    return resolveSovereignPath('cache_pedagogy/json_dumps');
}

/**
 * Resolves a specific forensic JSON file path within the pedagogy substrate
 */
export function getCachePedagogyFile(filename: string): string {
    return join(getCachePedagogyPath(), filename);
}

/**
 * Phase 29: Sovereign Spatial Engine Substrate
 * Resolves the path to the Atlas logic mappings (e.g., boundaries, region rules).
 */
export function getAtlasLogicPath(): string {
    return resolveSovereignPath('atlas/logic');
}

/**
 * Phase 29: Sovereign Spatial Engine Substrate
 * Resolves the path to the active gameplay sandbox systems (e.g. minigames).
 */
export function getAtlasSystemPath(): string {
    return resolveSovereignPath('atlas/system');
}

/**
 * Resolves the absolute path to this project's tsconfig.json.
 * Uses a module-relative anchor (not CWD) so it works from any directory.
 * Falls back to CWD and then sovereign root.
 */
export function getCliTsConfigPath(): string {
    // Priority 1: Project root configured via setProjectRoot
    if (_projectRoot) {
        const p = join(_projectRoot, 'tsconfig.json');
        if (existsSync(p)) return p;
    }

    // Priority 2: CWD (works when run from project root)
    const cwdPath = join(process.cwd(), 'tsconfig.json');
    if (existsSync(cwdPath)) return cwdPath;

    // Priority 3: Give up — return empty so callers can handle gracefully
    return '';
}

// Export constants for external use (LEGACY - use resolver functions instead)
/** @deprecated use resolver functions */
export const SovereignPaths = {
    get D_ROOT() { return getSovereignRoot(); },
    HOME_ROOT: SOVEREIGN_HOME_ROOT,
    get OLLAMA() { return getOllamaModelsPath(); },
    get GUTENBERG() { return getGutenbergPath(); },
    get RSC_DATA() { return getRscDataPath(); },
    get GENERATIONS() { return getGenerationsPath(); },
    get MEMORY() { return resolveSovereignPath('memory'); },
    get LEARNING() { return getVectorDbPath(); }
} as const;
