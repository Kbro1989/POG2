import { join, relative, sep } from 'path';

/**
 * SovereignIgnoreManager - Centralized exclusion logic for POG2.
 * 
 * Philosophy: Structural Integrity via Selective Ignorance.
 * Prevent token bloat and embedding noise by ignoring:
 * 1. Third-party boilerplate (cloudflare-templates)
 * 2. Build artifacts (dist, node_modules)
 * 3. Ephemeral residue (tmp, captures, logs)
 * 4. Test loops and experimentation debris
 */
export class SovereignIgnoreManager {
    private static readonly IGNORE_PATTERNS = [
        'resources/cloudflare-templates',
        'node_modules',
        'dist',
        'tmp',
        'captures',
        'logs',
        'pog2-test-loop',
        '.pog2-coder-pog2',
        '.POG2',
        '.git',
        '.claude',
        '.gemini',
        'system_health_out.txt',
        'system_health_full.txt',
        'system_health_final.txt',
        'system_health_final_check.txt',
        'system_health_utf8.txt',
        'system_health_final_utf8.txt',
        'system_health_complete.txt'
    ];

    private static readonly IGNORE_EXTENSIONS = [
        '.log',
        '.map',
        '.tsbuildinfo'
    ];

    /**
     * Returns true if the given path should be ignored.
     * @param projectRoot - Absolute project root
     * @param targetPath - Absolute or relative path to check
     */
    public static isIgnored(projectRoot: string, targetPath: string): boolean {
        // Root-bound ignore system: only paths within projectRoot are considered.
        const relPath = relative(projectRoot, targetPath).replace(/\\/g, '/');

        // Path Normalization Risk: Ignore paths outside projectRoot or the root itself
        if (!relPath || relPath.startsWith('..')) {
            return false;
        }

        // Extension-based ignores (Hygiene)
        if (this.IGNORE_EXTENSIONS.some(ext => relPath.endsWith(ext))) {
            return true;
        }

        // Directory boundary safety (Root-scoped patterns)
        return this.IGNORE_PATTERNS.some(pattern => {
            return relPath === pattern || relPath.startsWith(pattern + '/');
        });
    }

    /**
     * Returns the list of patterns currently being ignored.
     */
    public static getIgnorePatterns(): string[] {
        return [...this.IGNORE_PATTERNS];
    }

    /**
     * Returns the list of extensions currently being ignored.
     */
    public static getIgnoreExtensions(): string[] {
        return [...this.IGNORE_EXTENSIONS];
    }
}
