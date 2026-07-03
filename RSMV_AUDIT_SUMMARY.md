# RSMV Dependency Audit - Executive Summary

## What Was Done (Alternative to skills.sh/agents)

Since the Agent tool was temporarily unavailable, I performed a comprehensive dependency audit using built-in bash tools and file analysis to identify all rsmv/rsmv_inspector usage in the POG2 codebase.

## Key Findings

**Total Files with rsmv Dependencies: 199+ source files**

### Primary Usage Patterns Found:

1. **Direct Filesystem Requires** (Critical - HUDForensicsLimb.ts)
   - Direct `require()` calls to `rsmv_inspector/src/cache/sqlite.ts` and `opdecoder.ts`
   - **Solution:** Replace with existing `WorldForensicsLimb` + new `InterfaceParser`

2. **RSMVBridge Subprocess Usage** (High Impact - 6+ limbs)
   - Used by: CacheSentinelLimb, SystemTaxonomyLimb, SpatialSovereigntyLimb, 
     KinematicsLimb, TopologyLimb, StateProvider
   - **Solution:** Replace each `rsvmBridge.*` call with corresponding pogue-native limb methods

3. **RSMVExtractor** (CLI-focused - cli.ts)
   - Used in `rsmv_extract` command for biological constraint processing
   - **Solution:** Extract to dedicated AnatomyLimb or enhance existing limbs

4. **Script-Level Invocations** (Lower priority)
   - Scripts like `extract_vorkath_range.ts` call `npx tsx src/utils/rsmv_bridge.ts`
   - **Solution:** Update scripts to use limb methods directly

## Pog2-Native Solutions Already Available

✅ **WorldForensicsLimb** - Already uses `JagexCacheReader` for efficient cache access
- Provides: `senseLocalArea()`, `getTerrainFlags()`, `senseLocations()`, `getObjectDefinition()`
- **Needs enhancement:** Add `getMapsquareTiles()`, `getModel()`, `getSequence()` methods

✅ **ObservationEngine** - Already provides **flat radar/collision data** (66x66 grid)
- Generates observation reports suitable for renderer consumption
- **Addresses user requirement:** No 3D renderer needed - outputs ASCII/spatial awareness data
- Uses WorldForensicsLimb for sensing (cache-authoritative truth)

✅ **WorldGroundingLimb** - Already implements "Option CACHE_AUTHORITATIVE TRUTH"
- Bridges pedagogical manifests with cache-authoritative truth
- Aligns with user's grounding requirement

## Replacement Strategy Summary

### Immediate Actions (Highest Impact):
1. **Replace HUDForensicsLimb direct requires** → Use WorldForensicsLimb + InterfaceParser
2. **Replace CacheSentinelLimb rsmvBridge calls** → Use EnumLimb, upcoming InterfaceLimb, DatabaseLimb
3. **Replace SystemTaxonomyLimb rsmvBridge calls** → Use DatabaseLimb + VarbitLimb
4. **Replace SpatialSovereigntyLimb.getMapsquareTiles** → Enhance WorldForensicsLimb
5. **Replace KinematicsLimb.getSequence** → Create SequenceLimb
6. **Replace TopologyLimb.getModel** → Create ModelLimb
7. **Update CLI/scripts** → Use limb methods directly instead of subprocess calls

### Architecture Benefits:
- **Single cache connection:** Via proposed CacheReaderLimb singleton using JagexCacheReader
- **VRAM efficient:** All processing remains CPU-based (Node.js), no additional GPU load
- **Sovereign compliant:** Real cache access only, no mocks/placeholders
- **No Webpack:** Pure TypeScript/tsx compilation maintained
- **Flat radar ready:** ObservationEngine already provides the 66x66 collision/walkability grid requested

## Next Steps

1. **Review the detailed audit:** `RSMV_DEPENDENCY_AUDIT.md` contains complete file-by-file analysis
2. **Begin with HUDForensicsLimb** - this is the most critical direct dependency
3. **Leverage existing infrastructure** - WorldForensicsLimb is 80% of what we need
4. **Implement missing limbs** as enumerated above
5. **Update scripts last** - lower priority but important for toolchain consistency

The approach maximizes reuse of existing Pog2 infrastructure while systematically replacing each rsmv dependency with a pogue-native equivalent that maintains or improves performance and compliance with project constraints.