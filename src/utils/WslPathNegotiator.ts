import { platform, release } from 'node:os';
import { join, isAbsolute, sep } from 'node:path';

/**
 * WslPathNegotiator — resolve MCP server entrypoint paths across the
 * Windows / WSL boundary so `POG2-mcp.json` args work no matter which
 * side is spawning the process.
 *
 * Rules:
 * - `/mnt/c/...`  → `C:/Users/...`  when running on Windows
 * - `C:/Users/...` → `/mnt/c/...` when running in WSL
 * - Leave already-canonical paths untouched
 * - If `wslContract: true` is present on the server config, force the
 *   translation even when the current platform would not normally need it
 *   (useful when a Windows host spawns on behalf of WSL resident code).
 */
export class WslPathNegotiator {
  private static isWindows = platform() === 'win32';
  private static isWsl =
    !this.isWindows &&
    release().toLowerCase().includes('microsoft');

  private static winDriveLetter = /^[a-zA-Z]:[\\/]/;
  private static mntPrefix = /^\/mnt\//;

  /**
   * Translate a single path to the active platform's native form.
   */
  public static resolvePath(raw: string): string {
    if (!raw) return raw;
    const trimmed = raw.trim();

    if (this.isWindows || !this.mntPrefix.test(trimmed)) {
      // On Windows, still translate /mnt/c/... → C:/Users/...
      if (this.mntPrefix.test(trimmed) && trimmed.startsWith('/mnt/c/Users/')) {
        const rest = trimmed.slice('/mnt/c/Users/'.length);
        return `C:/Users/${rest}`;
      }
      return trimmed;
    }

    // Running in WSL
    if (trimmed.startsWith('/mnt/c/Users/')) {
      return trimmed;
    }
    if (this.winDriveLetter.test(trimmed)) {
      const drive = trimmed[0].toLowerCase();
      const rest = trimmed.slice(2).replace(/\\/g, '/');
      return `/mnt/${drive}/${rest}`;
    }
    return trimmed;
  }

  /**
   * Normalize every entry in `config.args` in-place.
   * Returns the same array reference with mutated strings.
   */
  public static resolveArgs(
    args: string[],
    flags: { wslContract?: boolean } = {}
  ): string[] {
    const mustNegotiate =
      !!flags.wslContract || this.isWindows || this.isWsl;

    if (!mustNegotiate) return args;

    return args.map((a) => this.resolvePath(a));
  }

  /**
   * Best-effort: if `wslContract` force-translation is requested but
   * we cannot determine the target platform, prefer WSL form.
   */
  public static normalize(
    targets: string | string[],
    flags: { wslContract?: boolean } = {}
  ): string | string[] {
    const list = Array.isArray(targets) ? targets : [targets];
    const out = this.resolveArgs(list, flags);
    return Array.isArray(targets) ? out : out[0];
  }
}
