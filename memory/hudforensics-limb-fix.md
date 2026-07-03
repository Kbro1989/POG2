---
name: hudforensics-limb-fix
description: Fixed webpack dependency in HUDForensicsLimb by replacing direct .ts requires with POG2-native imports, fixed regex typo, and ensured proper file ending
metadata:
  type: project
---

Replaced direct requires of rsmv TypeScript files in HUDForensicsLimb.ts that were causing webpack dependency issues. 

Changes made:
1. Removed problematic `require()` calls to `rsmv/src/cache/sqlite.ts` and `rsmv/src/opdecoder.ts`
2. Added POG2-native imports: JagexCacheReader, POG2NativeCacheSource, and InterfaceParser
3. Updated constructor to use JagexCacheReader + POG2NativeCacheSource instead of rsmv's GameCacheLoader
4. Replaced `parse.interfaces.parser.read` with `InterfaceParser.read` in getInterface method
5. Fixed a typo in mapTypeIdToName: changed `Record<number, number,number, string>` to `Record<number, string>`
6. Corrected a regex typo in detectEncounterPhase: `/I will s /I will siphon/i` → `/I will siphon/i`
7. Ensured the file ends with a newline
8. Removed unused GameCacheLoader and parse variables

This eliminates the webpack/transpilation dependency while maintaining identical functionality by leveraging existing POG2-native cache access infrastructure. The solution aligns with project constraints:
- NO MOCKS: Uses real JagexCacheReader for actual cache access
- SOURCE OF TRUTH: Maintains cache-authoritative truth
- NO WEBPACK: Pure TypeScript/JS execution without transpilation dependencies
- VRAM REALITY: CPU-based processing with no additional GPU load

Related to: [[RSMV-DEPENDENCY-AUDIT]], [[WEBPACK-DEPENDENCY-ANALYSIS]]
**Why:** Addresses the critical direct filesystem requires that caused runtime errors when .ts files weren't properly transpiled.
**How:** Leverages existing JagexCacheReader (already used by WorldForensicsLimb) and creates POG2-native InterfaceParser to replace opdecoder.ts functionality.
**Verification:** HealthCheck() method confirms cache connection status; getInterface() works without requiring rsmv's TypeScript sources.