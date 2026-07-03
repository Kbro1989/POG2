# RSMV to Pog2-Native Replacement Plan

## Executive Summary
This document outlines a plan to replace all rsmv/rsmv_inspector dependencies in the POG2 codebase with pog2-native implementations, focusing on:
1. Using cache-related limbs/tooling for cache parsing instead of rsmv
2. Utilizing flat radar from pog2/public for collision data (no 3D renderer needed)
3. Ensuring webpack is not required in pog2
4. Maintaining compliance with Sovereign Laws and VRAM Reality constraints

## Current rsmv Usage Analysis

### Core Dependencies Found:
1. **Direct rsmv_inspector requires** (in TypeScript files):
   - `src/limbs/spatial/HUDForensicsLimb.ts` - Direct requires for cache/sqlite.ts and opdecoder.ts
   - Multiple scratch/root-level extraction scripts

2. **rsmvBridge usage** (via src/utils/rsmvBridge.ts subprocess):
   - `src/limbs/spatial/CacheSentinelLimb.ts` - getEnum, getInterface, getDBRows
   - `src/limbs/spatial/SystemTaxonomyLimb.ts` - getDBTables, getDBRows, getVarps, getVarbits
   - `src/limbs/spatial/SpatialSovereigntyLimb.ts` - getMapsquareTiles
   - `src/limbs/technical/KinematicsLimb.ts` - getSequence
   - `src/limbs/technical/TopologyLimb.ts` - getModel
   - `src/cli.ts` - Indirect via HUDForensicsLimb
   - `src/scripts/extract_vorkath_range.ts` and similar scripts

3. **RSMVExtractor usage**:
   - `src/cli.ts` - For biological constraint and kinetic profile extraction

## Pog2-Native Alternatives Available

### Existing Pog2 Limbs/Engines:
1. **WorldForensicsLimb** (`src/limbs/spatial/WorldForensicsLimb.ts`)
   - Uses JagexCacheReader for direct cache access
   - Provides: senseLocalArea, getTerrainFlags, senseLocations, getObjectDefinition
   - Already implements caching and efficient SQLite access

2. **ObservationEngine** (`src/engines/spatial/ObservationEngine.ts`)
   - Uses WorldForensicsLimb for sensing
   - Provides flat radar/collision data (66x66 grid)
   - Generates observation reports for renderer

3. **WorldGroundingLimb** (`src/limbs/world_grounding/WorldGroundingLimb.ts`)
   - Bridges pedagogical manifests with cache-authoritative truth
   - Implements "Option CACHE_AUTHORITATIVE TRUTH"

4. **CacheForensicsLimb** (`src/limbs/spatial/CacheForensicsLimb.ts`)
   - Already provides getItemDetails, getNpcDetails, getObjectDetails

### Missing Components to Implement:
1. **ModelLimb** - For model geometry (vertex/triangle/bone counts, UVs, skinning)
2. **SequenceLimb** - For animation sequence data
3. **InterfaceParser** - To replace direct opdecoder.ts usage in HUDForensicsLimb
4. **EnumLimb** - For enum definitions
5. **SpriteLimb** - For sprite metadata
6. **DatabaseLimb** - For database table/row access

## Implementation Plan

### Phase 1: Infrastructure Setup
1. Create `CacheReaderLimb` singleton to manage single JagexCacheReader instance
2. Establish parser infrastructure in `src/parsers/` directory

### Phase 2: Component Replacement
#### A. HUDForensicsLimb.ts (Most Critical)
**Current**: Direct requires of rsmv_inspector/src/cache/sqlite.ts and opdecoder.ts
**Replace with**:
- Inject CacheReaderLimb to fetch interface buffer (Archive 3)
- Implement InterfaceParser to parse interface data
- Remove all direct rsmv_inspector dependencies

#### B. CacheSentinelLimb.ts
**Current**: 
- rsmvBridge.getEnum(1518) → EnumLimb.getEnum(1518)
- rsmvBridge.getInterface(1314) → HUDForensicsLimb.getInterface(1314) 
- rsmvBridge.getDBRows(1) → DatabaseLimb.getTableRows(1)

#### C. SystemTaxonomyLimb.ts
**Current**:
- rsmvBridge.getDBTables() → DatabaseLimb.getTableList()
- rsmvBridge.getDBRows() → DatabaseLimb.getAllTableRows()
- rsmvBridge.getVarps() → VarbitSovereigntyLimb.getAllVarps()
- rsmvBridge.getVarbits() → VarbitSovereigntyLimb.getAllVarbits()

#### D. SpatialSovereigntyLimb.ts
**Current**:
- rsmvBridge.getMapsquareTiles(x, z) → WorldForensicsLimb.getMapsquareTiles(x, z)
*(Need to add this method to WorldForensicsLimb)*

#### E. KinematicsLimb.ts
**Current**:
- rsmvBridge.getSequence(sequenceId) → SequenceLimb.getSequence(sequenceId)

#### F. TopologyLimb.ts
**Current**:
- rsmvBridge.getModel(modelId) → ModelLimb.getModel(modelId)

#### G. StateProvider.ts
**Current**:
- resolveFromBridge() → VarbitSovereigntyLimb.getVarbitDefinitionFromCache(id)

### Phase 3: Script Updates
Update extraction scripts to use new limb interfaces:
- src/scripts/extract_vorkath_range.ts
- src/scripts/find_vorkath.ts
- Root level extract_*.ts files

### Phase 4: Verification and Cleanup
1. Ensure all functionality remains identical
2. Remove rsmv_inspector references from package.json if no longer needed
3. Verify no webpack dependencies introduced
4. Confirm VRAM efficiency maintained (all cache reading via JagexCacheReader)

## Alignment with Sovereign Laws & VRAM Reality

✅ **NO MOCKS / NO PLACEHOLDERS**: All implementations use real cache access via JagexCacheReader
✅ **TERNiary routing**: New limbs integrate with existing TernaryRouter through proper domain registration
✅ **61-Minute Law**: Cache reading is local-first, no Ollama/HuggingFace fallback needed
✅ **Ghost Normalization**: Outputs flow through existing GhostLimb where appropriate
✅ **Cognitive Immunology**: All cache access validated through existing security layers
✅ **Source of Truth**: Uses public/authentic_spawn_manifest.json and grounding_manifest.json
✅ **VRAM Reality**: All implementations are CPU-based, VRAM-efficient cache reading

## Flat Radar Implementation (Per User Request)

Instead of 3D rendering via rsmv_inspector viewer:
1. **Use pog2/public flat radar data**: Existing ground truth files in public/ directory
2. **ObservationEngine**: Already provides 66x66 collision grid via WorldForensicsLimb
3. **Enhance WorldForensicsLimb**: Add direct flat radar reading capability from pog2/public/
4. **Remove 3D dependencies**: No need for model parsing, skinning, UVs when using flat radar

## Benefits of This Approach
1. **Eliminates external dependency**: No more rsmv_insulator required
2. **Improves performance**: Direct cache access vs subprocess bridging
3. **Enhances sovereignty**: Complete control over cache reading pipeline
4. **Reduces complexity**: Single cache reader instance, no ESM/CJS boundary issues
5. **Maintains compatibility**: All existing interfaces preserved
6. **Aligns with architecture**: Uses existing Pog2 limbs and patterns