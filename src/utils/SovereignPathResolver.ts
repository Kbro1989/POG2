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

import { existsSync, mkdirSync, statSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

// Ternary Path Tiers
export const enum PathTier {
    Sovereign = 1,   // D:\ drive (most stable)
    Home = 0,        // pog2-sovereign
    ProjectLocal = -1 // .pog in project root (most portable)
}

// Core Sovereign Locations
// Core Sovereign Locations (ROOT ANCHORED per user setup)
const SOVEREIGN_D_LAIR = 'D:\\sovereign';
const SOVEREIGN_D_ROOT = SOVEREIGN_D_LAIR; // Aligned with user feedback: D:\sovereign is the root
const SOVEREIGN_HOME_ROOT = join(homedir(), '.pog2-sovereign');

// Model Storage (separate from config for size reasons)
const OLLAMA_D_PATH = 'D:\\ollama-models';
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
 * Detects if D:\ drive is available and writable
 */
export function hasSovereignDrive(): boolean {
    try {
        if (!existsSync('D:\\')) return false;
        const stat = statSync('D:\\');
        return stat.isDirectory();
    } catch {
        return false;
    }
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
    if (hasSovereignDrive()) return PathTier.Sovereign;

    // Check if project-local is explicitly requested
    const useLocal = process.env['POG_USE_LOCAL'] === 'true';
    if (useLocal && _projectRoot) return PathTier.ProjectLocal;

    // Default to Home tier (balanced) if D:\ is missing
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
 * True ternary: +1 -> D:\, 0 -> Home, -1 -> Project-local
 */
export function getSovereignRoot(tier?: PathTier): string {
    const resolvedTier = tier ?? detectPathTier();

    // Tier +1: Sovereign D:\ Drive
    if (resolvedTier === PathTier.Sovereign && existsSync('D:\\')) {
        // Create Lair folder if missing
        if (!existsSync(SOVEREIGN_D_LAIR)) {
            mkdirSync(SOVEREIGN_D_LAIR, { recursive: true });
        }

        if (!existsSync(SOVEREIGN_D_ROOT)) {
            mkdirSync(SOVEREIGN_D_ROOT, { recursive: true });
        }
        // Ensure Gutenberg path is also initialized if it doesn't exist
        if (!existsSync(GUTENBERG_D_PATH)) {
            mkdirSync(GUTENBERG_D_PATH, { recursive: true });
        }
        return SOVEREIGN_D_ROOT;
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
    const parentDir = join(resolved, '..');
    if (!existsSync(parentDir)) {
        mkdirSync(parentDir, { recursive: true });
    }

    return resolved;
}

/**
 * Returns the "God Head" root - the current active workspace.
 * This is the source of truth for pog2.md context.
 */
export function getGodHeadRoot(): string | null {
    return _projectRoot;
}

/**
 * Gets the Ollama models path (D:\ollama-models or environment override)
 */
export function getOllamaModelsPath(): string {
    const envPath = process.env['OLLAMA_MODELS_PATH'] || process.env['POG_ERROR_TRACKER_PATH'];
    if (envPath && existsSync(envPath)) return envPath;

    if (hasSovereignDrive()) {
        // Check for models in D:\ollama-models OR D:\sovereign\ollama-models
        const pathsToTry = [OLLAMA_D_PATH, OLLAMA_LAIR_PATH];
        for (const p of pathsToTry) {
            if (existsSync(p)) return p;
        }

        // Default creation point: nested in LAIR for better hygiene
        if (!existsSync(OLLAMA_LAIR_PATH)) {
            try {
                mkdirSync(OLLAMA_LAIR_PATH, { recursive: true });
            } catch { /* Fallback */ }
        }
        return OLLAMA_LAIR_PATH;
    }

    // Default to whatever Ollama uses internally
    return '';
}

/**
 * Gets the Gutenberg library path (D:\pog-gutenberg or environment override)
 */
export function getGutenbergPath(): string {
    const envPath = process.env['POG_GUTENBERG_PATH'];
    if (envPath && existsSync(envPath)) return envPath;

    // Phase 37 Fix: Priority 1 must be the Sovereign Drive (+1 Tier)
    if (hasSovereignDrive()) {
        if (!existsSync(GUTENBERG_D_PATH)) {
            mkdirSync(GUTENBERG_D_PATH, { recursive: true });
        }
        return GUTENBERG_D_PATH;
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
 * Gets the root path for production pipelines (D:\sovereign\pipelines)
 */
export function getPipelineRootPath(): string {
    if (hasSovereignDrive()) {
        const p = 'D:\\sovereign\\pipelines';
        if (!existsSync(p)) mkdirSync(p, { recursive: true });
        return p;
    }
    return resolveSovereignPath('pipelines');
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
 * Gets the RSC data path for archaeology (D:\sovereign\rsc-data)
 */
export function getRscDataPath(): string {
    if (hasSovereignDrive()) {
        const rscPath = join(SOVEREIGN_D_LAIR, 'rsc-data');
        if (!existsSync(rscPath)) {
            mkdirSync(rscPath, { recursive: true });
        }
        return rscPath;
    }
    return resolveSovereignPath('rsc-data');
}

/**
 * Gets the generations path for forged media (D:\sovereign\generations)
 */
export function getGenerationsPath(): string {
    if (hasSovereignDrive()) {
        if (!existsSync(GENERATIONS_D_PATH)) {
            mkdirSync(GENERATIONS_D_PATH, { recursive: true });
        }
        return GENERATIONS_D_PATH;
    }
    return resolveSovereignPath('generations');
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
 * Gets path for learning database (Anchor: Memory)
 */
export function getVectorDbPath(): string {
    if (hasSovereignDrive()) {
        if (!existsSync(LEARNING_D_PATH)) {
            mkdirSync(LEARNING_D_PATH, { recursive: true });
        }
        return join(LEARNING_D_PATH, 'sovereign-learning.db');
    }
    return resolveSovereignPath('sovereign-learning.db');
}

/**
 * Gets path for performance history
 */
export function getPerformanceDbPath(): string {
    if (hasSovereignDrive()) {
        if (!existsSync(MEMORY_D_PATH)) {
            mkdirSync(MEMORY_D_PATH, { recursive: true });
        }
        return join(MEMORY_D_PATH, 'sovereign-performance.json');
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

// Export constants for external use
export const SovereignPaths = {
    D_ROOT: SOVEREIGN_D_ROOT,
    HOME_ROOT: SOVEREIGN_HOME_ROOT,
    OLLAMA: OLLAMA_D_PATH,
    GUTENBERG: GUTENBERG_D_PATH,
    RSC_DATA: join(SOVEREIGN_D_LAIR, 'rsc-data'),
    GENERATIONS: GENERATIONS_D_PATH,
    MEMORY: MEMORY_D_PATH,
    LEARNING: LEARNING_D_PATH
} as const;
