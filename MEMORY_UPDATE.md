Fixed webpack dependency in HUDForensicsLimb.ts and updated tsconfig.json to properly compile.

Changes made to src/limbs/spatial/HUDForensicsLimb.ts:
1. Removed direct requires of rsmv TypeScript files (sqlite.ts and opdecoder.ts) that caused webpack/transpilation dependencies.
2. Added POG2-native imports: JagexCacheReader, POG2NativeCacheSource, and InterfaceParser.
3. Updated constructor to use JagexCacheReader + POG2NativeCacheSource instead of rsmv's GameCacheLoader.
4. Replaced `parse.interfaces.parser.read` with `InterfaceParser.read` in getInterface method.
5. Updated null checks from `!parse` to `!InterfaceParser`.
6. Fixed a typo in Record type annotation in mapTypeIdToName method (changed `Record<number, number,number, string>` to `Record<number, string>`).
7. Fixed a duplicated "if" keyword in the detectEncounterPhase method (blood phase condition).

Changes made to tsconfig.json:
1. Removed rsmv_inspector from exclude list so TypeScript compiler can find the JSON files needed by InterfaceParser.
2. Fixed paths configuration to properly point to rsmv_inspector source files.

Benefits:
- Eliminates webpack/transpilation dependency - pure TypeScript/JS execution
- Maintains identical functionality by leveraging existing POG2-native cache infrastructure
- Aligns with project constraints:
  ✅ NO MOCKS: Uses real JagexCacheReader for actual cache access
  ✅ SOURCE OF TRUTH: Maintains cache-authoritative truth
  ✅ NO WEBPACK: No transpilation dependencies
  ✅ VRAM REALITY: CPU-based processing with no additional GPU load

Related memories: [[RSMV-DEPENDENCY-AUDIT]], [[WEBPACK-DEPENDENCY-ANALYSIS]], [[hudforensics-limb-fix]]