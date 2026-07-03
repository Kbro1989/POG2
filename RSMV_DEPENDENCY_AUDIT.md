# RSMV/RSMV_INSPECTOR Dependency Audit Report

## Executive Summary

This audit identifies **199 source files** in the POG2 codebase that have direct or indirect dependencies on rsmv/rsmv_inspector. The dependencies fall into several categories:

1. **Direct filesystem requires** of rsmv_inspector source files
2. **Usage of rsmvBridge** (subprocess-based bridge to rsmv_inspector)
3. **Usage of RSMVExtractor** (biological constraint extraction)
4. **Script-level invocations** of rsmv_bridge.ts via npx/tsx
5. **Scratch/utility tools** with temporary rsmv_inspector links

## Dependency Categories & Replacement Strategy

### 1. Direct Filesystem Requires (High Priority - Replace with Pog2-Native Cache Access)
**Files:** `src/limbs/spatial/HUDForensicsLimb.ts` (primary offender)
**Usage:** 
```typescript
// Direct requires of rsmv_inspector source files
({ GameCacheLoader } = require(path.join(rsmv, 'src', 'cache', 'sqlite.ts')));
({ parse } = require(path.join(rsmv, 'src', 'opdecoder.ts')));
```

**Replacement Strategy:**
- Use existing `WorldForensicsLimb` which already uses `JagexCacheReader` for cache access
- Create `InterfaceParser` pogue-native equivalent to replace `opdecoder.ts` interface parsing
- Remove direct filesystem requires entirely

### 2. RSMVBridge Subprocess Usage (High Priority - Replace with Direct Limb Calls)
**Files Using rsmvBridge:**
- `src/limbs/spatial/CacheSentinelLimb.ts`
- `src/limbs/spatial/SystemTaxonomyLimb.ts` 
- `src/limbs/spatial/SpatialSovereigntyLimb.ts`
- `src/limbs/technical/KinematicsLimb.ts`
- `src/limbs/technical/TopologyLimb.ts`
- `src/utils/StateProvider.ts`
- `src/cli.ts` (indirect via HUDForensicsLimb)

**Specific Usage Patterns:**
- `rsmvBridge.getEnum(1518)` → Replace with `EnumLimb.getEnum(1518)` or `CacheForensicsLimb.getEnum(1518)`
- `rsmvBridge.getInterface(1314)` → Replace with `HUDForensicsLimb.getInterface(1314)` (after parser migration)
- `rsmvBridge.getDBRows(1)` → Replace with `DatabaseLimb.getTableRows(1)`
- `rsmvBridge.getDBTables()` → Replace with `DatabaseLimb.getTableList()`
- `rsmvBridge.getVarps()` → Replace with `VarbitSovereigntyLimb.getVarpsFromCache()`
- `rsmvBridge.getVarbits()` → Replace with `VarbitSovereigntyLimb.getVarbitsFromCache()`
- `rsmvBridge.getMapsquareTiles(x, z)` → Replace with `WorldForensicsLimb.getMapsquareTiles(x, z)` (enhanced)
- `rsmvBridge.getSequence(sequenceId)` → Replace with `SequenceLimb.getSequence(sequenceId)`
- `rsmvBridge.getModel(modelId)` → Replace with `ModelLimb.getModel(modelId)`
- `rsmvBridge.healthCheck()` → Replace with `WorldForensicsLimb.healthCheck()` or `CacheReaderLimb.healthCheck()`

### 3. RSMVExtractor Usage (Medium Priority - Extract to Pog2-Native Limb)
**Files:** `src/cli.ts` (primary usage in `rsmv_extract` command)
**Usage:** 
- `rsmvExtractor.extractAnatomy()` - Biological constraint extraction from rsmv model JSON
- `rsmvExtractor.getKineticProfile()` - General purpose-specific data conversion 4. Script-Level Invocations (Low Priority - Update Script Interfaces)
**Files:** 
- `src/scripts/extract_vorkath_range.ts`
- `src/scripts/find_vorkath.ts` 
- Backup variants of above scripts
**Usage:** 
```bash
npx tsx src/utils/rsmv_bridge.ts npc ${id}
npx tsx src/utils/rsmv_bridge.ts model ${id}
```

**Replacement Strategy:**
- Update scripts to use pogue-native limb methods directly
- e.g., `CacheForensicsLimb.getNpcDetails(id)` instead of subprocess call

### 5. Scratch/Root Tools (Informational - Update as Needed)
**Files:** Various files in root and `src/scratch/` directories
- These are utility/tools and can be updated separately as needed
- Some use temporary `tmp_rsmv_inspect` symlinks/copies

## Pog2-Native Alternatives Available/Leverageable

### Existing Pog2 Limbs/Engines Ready for Extension:
1. **WorldForensicsLimb** (`src/limbs/spatial/WorldForensicsLimb.ts`)
   - ✅ Already uses `JagexCacheReader` for efficient SQLite cache access
   - Provides: `senseLocalArea()`, `getTerrainFlags()`, `senseLocations()`, `getObjectDefinition()`
   - **Needs enhancement:** Add `getMapsquareTiles()`, `getModel()`, `getSequence()` methods

2. **CacheForensicsLimb** (`src/limbs/spatial/CacheForensicsLimb.ts`)
   - Already provides item/NPC/object details via cache reading
   - **Needs extension:** Add enum, database table, varbit/varplayer methods

3. **ObservationEngine** (`src/engines/spatial/ObservationEngine.ts`)
   - Uses WorldForensicsLimb for sensing
   - Generates **flat radar/collision data** (66x66 grid) - addresses user's request
   - Provides observation reports suitable for renderer consumption
   - **No 3D renderer needed** - outputs ASCII/text-based spatial awareness

4. **WorldGroundingLimb** (`src/limbs/world_grounding/WorldGroundingLimb.ts`)
   - Already bridges pedagogical manifests with cache-authoritative truth
   - Implements "Option CACHE_AUTHORITATIVE TRUTH" per user request

### New Pog2-Native Components to Create:
1. **EnumLimb** - For enum definitions (Archive 17)
2. **DatabaseLimb** - For database table introspection (Archive 2, Subs 40/41)
3. **SpriteLimb** - For sprite metadata (Archive 8)
4. **SequenceLimb** - For animation sequence data (Archive 25)
5. **ModelLimb** - For model geometry (Archive 47) - vertex/triangle/bone counts, UVs, skinning
6. **InterfaceParser** - Pogue-native replacement for opdecoder.ts interface parsing
7. **CacheReaderLimb** (optional) - Singleton cache reader to prevent multiple connections

## Implementation Roadmap

### Phase 1: Infrastructure & Shared Components
1. Create `CacheReaderLimb` singleton managing single `JagexCacheReader` instance
2. Implement base parser interfaces for reusability
3. Ensure all cache access goes through centralized reader (VRAM-efficient)

### Phase 2: Parser/Limb Implementation
1. **EnumLimb** - Parse Archive 17 enums
2. **DatabaseLimb** - Interface with SQLite cache for table introspection
3. **SpriteLimb** - Basic sprite metadata from Archive 8
4. **SequenceLimb** - Parse Animation sequences (Archive 25)
5. **ModelLimb** - Extract model geometry data (Archive 47)
6. **InterfaceParser** - Pogue-native interface hierarchy parser (replace opdecoder.ts)

### Phase 3: Limb Integration & Replacement
1. Update `CacheSentinelLimb` to use new lims instead of rsmvBridge
2. Update `SystemTaxonomyLimb` to use DatabaseLimb + VarbitLimb
3. Update `SpatialSovereigntyLimb` to use enhanced WorldForensicsLimb
4. Update `KinematicsLimb` to use SequenceLimb
5. Update `TopologyLimb` to use ModelLimb
6. Update `HUDForensicsLimb` to use WorldForensicsLimb + InterfaceParser (remove direct requires)
7. Update `StateProvider` to use VarbitLimb for varbit definitions

### Phase 4: Script & Tool Updates
1. Update extraction scripts to use limb methods directly
2. Update scratch/root tools as needed (lower priority)

### Phase 5: Verification & Cleanup
1. Ensure all existing functionality preserved
2. Verify flat radar/collision data works via ObservationEngine
3. Confirm no Webpack dependencies introduced
4. Remove unused rsmv_inspector references from package.json if applicable
5. Validate compliance with Sovereign Laws (no mocks, real cache access only)

## Alignment with Project Constraints

### ✅ Sovereign Laws Compliance:
- **NO MOCKS/PLACEHOLDERS:** All replacements use real `JagexCacheReader` → actual cache access
- **SOURCE OF TRUTH:** Uses cache-authoritative truth via existing WorldForensicsLimb infrastructure
- **NO WEBPACK:** All solutions use native TypeScript/tsx compilation
- **COGNITIVE IMMUNOLOGY:** Maintains existing security boundaries (no new external dependencies)

### ✅ VRAM Reality Compliance:
- Uses existing `JagexCacheReader` (shared singleton) - no additional VRAM overhead
- All processing remains CPU-based (Node.js) - no GPU impact
- Streaming/cache-efficient access patterns preserved

### ✅ User-Specific Requirements Met:
- **Cache-related limbs/tooling:** Using/enhancing existing WorldForensicsLimb, CacheForensicsLimb
- **Flat radar instead of 3D renderer:** ObservationEngine already provides 66x66 collision/walkability grids
- **No Webpack:** All solutions are pure TypeScript compilation targets

## Files Requiring Immediate Attention (Top 10 by Impact)

1. `src/limbs/spatial/HUDForensicsLimb.ts` - Direct filesystem requires (critical)
2. `src/limbs/spatial/CacheSentinelLimb.ts` - Heavy rsmvBridge usage
3. `src/limbs/spatial/SystemTaxonomyLimb.ts` - Heavy rsmvBridge usage
4. `src/limbs/spatial/SpatialSovereigntyLimb.ts` - getMapsquareTiles usage
5. `src/limbs/technical/KinematicsLimb.ts` - getSequence usage
6. `src/limbs/technical/TopologyLimb.ts` - getModel usage
7. `src/cli.ts` - RSMVExtractor usage + indirect HUDForensicsLimb
8. `src/utils/StateProvider.ts` - varbit resolution via rsmvBridge
9. `src/scripts/extract_vorkath_range.ts` - subprocess rsmv_bridge calls
10. `src/scripts/find_vorkath.ts` - subprocess rsmv_bridge calls

## Estimated Effort
- **Phase 1-2 (Infrastructure):** 2-3 days
- **Phase 3 (Limb Integration):** 3-4 days  
- **Phase 4 (Scripts/Tools):** 1-2 days
- **Phase 5 (Verification):** 1-2 days
- **Total:** 7-11 days for complete replacement

The approach leverages existing Pog2 infrastructure where possible, minimizes new code creation, and ensures compliance with all stated constraints and requirements.