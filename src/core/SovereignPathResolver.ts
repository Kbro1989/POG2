import * as path from "path";
import * as fs from "fs";

/**
 * SovereignPathResolver
 * 
 * Enforces the "D-drive First" authority rule for cache fragments and atlas data.
 * This is the primary mechanism for resolving C3 boundary disconnects.
 */
export class SovereignPathResolver {
    private static AUTHORITATIVE_ROOT = "D:\\sovereign";
    private static LOCAL_ROOT = "c:\\Users\\Destiny\\Desktop\\pog-vibe-interactive\\files";

    /**
     * Resolves a relative path (e.g. 'atlas/spatial/m_55_50_logic.json') 
     * to the most authoritative existing local path.
     */
    static resolveauthoritativePath(relativePath: string): string {
        // Normalize the relative path to use platform-specific separators
        const normalizedRel = relativePath.split(/[\\\/]/).join(path.sep);

        // 1. Check authoritative D-drive first
        const dPath = path.join(this.AUTHORITATIVE_ROOT, normalizedRel);
        if (fs.existsSync(dPath)) {
            return dPath;
        }

        // 2. Fallback to local C-drive (the repo's own data)
        const cPath = path.join(this.LOCAL_ROOT, normalizedRel);
        return cPath; 
    }

    /**
     * Helper for specifically resolving refilled logic fragments.
     */
    static resolveLogicFragment(major: number, id: number): string {
        const rel = path.join("refilled", `js5-${major}`, `${id}_logic.json`);
        return this.resolveauthoritativePath(rel);
    }
    
    /**
     * Helper for spatial atlas anchors.
     */
    static resolveSpatialAnchor(coordKey: string): string {
        const rel = path.join("atlas", "spatial", `${coordKey}_logic.json`);
        return this.resolveauthoritativePath(rel);
    }
}

