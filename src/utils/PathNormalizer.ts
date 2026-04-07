import { relative, resolve, sep } from 'path';
import { homedir } from 'os';
import { getSystemRoot } from './SovereignPathResolver.js';

/**
 * PathNormalizer â€” Sovereign Path Aesthetic Processor.
 * 
 * Philosophy: Absolute system paths are exposing and cluttered. 
 * This utility converts absolute system paths into ./... or ~/... or POG2://
 */
export class PathNormalizer {
    private static projectRoot: string = process.cwd();
    private static home: string = homedir();

    /**
     * Set the current project root (Tier -1).
     */
    public static setProjectRoot(root: string): void {
        this.projectRoot = resolve(root);
    }

    /**
     * Normalize an absolute path to a professional relative string.
     * Priority: Project-Relative (./) > Home-Relative (~/) > Sovereign-Relative (POG2://)
     */
    public static normalize(path: string): string {
        if (!path) return path;

        const absolute = resolve(path);
        const sovereignRoot = getSystemRoot();

        // 1. Project-Relative
        if (absolute.startsWith(this.projectRoot)) {
            const rel = relative(this.projectRoot, absolute);
            return rel === '' ? '.' : `.${sep}${rel}`;
        }

        // 2. Sovereign-Relative (Dynamic Sovereign Root)
        if (absolute.toLowerCase().startsWith(sovereignRoot.toLowerCase())) {
            const rel = absolute.substring(sovereignRoot.length);
            return `POG2://${rel.replace(/^[\\/]/, '').replace(/\\/g, '/')}`;
        }

        // 3. Home-Relative
        if (absolute.startsWith(this.home)) {
            const rel = relative(this.home, absolute);
            return `~${sep}${rel}`;
        }

        return absolute;
    }

    /**
     * Scan a string for absolute paths and normalize them.
     * Uses regex to find C:/... or D:/... style paths.
     */
    public static normalizeString(text: string): string {
        // Matches Windows style paths (C:\... or C:/...)
        const pathRegex = /([a-zA-Z]:[\\/][^:?*"<>|\r\n]+)/g;

        return text.replace(pathRegex, (match) => {
            // Check if it's actually a path-like string (has extensions or slashes)
            if (match.includes(sep) || match.includes('/') || match.includes('.')) {
                return this.normalize(match);
            }
            return match;
        });
    }

    /**
     * Get a simple relative path for internal state tracking.
     */
    public static relative(path: string): string {
        return relative(this.projectRoot, resolve(path));
    }
}
