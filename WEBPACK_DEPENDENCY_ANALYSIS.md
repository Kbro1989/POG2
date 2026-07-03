# Webpack Dependency Analysis in POG2

## Executive Summary

POG2 has an unintended webpack dependency created by direct TypeScript file imports in `HUDForensicsLimb.ts`. This causes runtime errors when .ts files aren't properly transpiled. The solution leverages existing POG2-native cache access infrastructure.

## Problem Identification

### Direct TypeScript Imports Causing Webpack Dependency

**File:** `src/limbs/spatial/HUDForensicsLimb.ts` (lines ~12-22)
```typescript
let GameCacheLoader: any = null;
let parse: any = null;

try {
    const alt1 = require('alt1cache');
    GameCacheLoader = alt1.GameCacheLoader;
    parse = alt1.parse;
} catch (alt1Error) {
    const rsmv = getrsmvSubstratePath();
    try { ({ GameCacheLoader } = require(path.join(rsmv, 'src', 'cache', 'sqlite.ts'))); } catch { }
    try { ({ parse } = require(path.join(rsmv, 'src', 'opdecoder.ts'))); } catch { }
}
```

**Issues:**
1. Attempts to `require()` `.ts` files directly at runtime
2. Requires webpack/tsx to transpile TypeScript on-the-fly
3. Breaks when running pure Node.js without transpilation
4. Creates unnecessary webpack dependency in critical path

## Existing POG2-Native Solutions

### ✅ JagexCacheReader - Already Available
- **Location:** `src/utils/JagexCacheReader.ts`
- **Usage:** Already used by `WorldForensicsLimb.ts` and `POG2NativeCacheSource.ts`
- **Capability:** Direct SQLite access to `.jcache` files
- **Advantage:** No webpack/transpilation needed - pure TypeScript/JS

### ✅ ObservationEngine - Provides Required Flat Radar Data
- **Location:** `src/engines/spatial/ObservationEngine.ts`
- **Output:** 66x66 collision/walkability grid (exactly what requested)
- **Dependency:** Uses `WorldForensicsLimb` → `JagexCacheReader`
- **Advantage:** Zero 3D renderer required, pure spatial awareness data

### ✅ WorldGroundingLimb - Cache-Authoritative Truth
- **Location:** `src/limbs/world_grounding/WorldGroundingLimb.ts`
- **Function:** Bridges pedagogical manifests with cache truth
- **Status:** Already implements requested approach

## Current RSMV Dependencies to Replace

### 1. HUDForensicsLimb.ts (Critical - Direct TS Imports)
**Replace with:**
- `WorldForensicsLimb.getObjectDefinition()` (exists, needs enhancement)
- New POG2-native `InterfaceParser` (to replace opdecoder.ts)

### 2. RSMVBridge Subprocess Calls
| Current Usage | POG2-Native Replacement |
|---------------|-------------------------|
| `rsmvBridge.getEnum(1518)` | `EnumLimb.getEnum(1518)` |
| `rsmvBridge.getInterface(1314)` | `HUDForensicsLimb.getInterface(1314)` (after fix) |
| `rsmvBridge.getDBRows(1)` | `DatabaseLimb.getTableRows(1)` |
| `rsmvBridge.getDBTables()` | `DatabaseLimb.getTableList()` |
| `rsmvBridge.getVarps()` | `VarbitSovereigntyLimb.getAllVarps()` |
| `rsmvBridge.getVarbits()` | `VarbitSovereigntyLimb.getAllVarbits()` |
| `rsmvBridge.getMapsquareTiles(x, z)` | `WorldForensicsLimb.getMapsquareTiles(x, z)` |
| `rsmvBridge.getSequence(id)` | `SequenceLimb.getSequence(id)` |
| `rsmvBridge.getModel(id)` | `ModelLimb.getModel(id)` |

## Implementation Strategy

### Phase 1: Fix HUDForensicsLimb (Highest Priority)
1. Remove direct `.ts` file requires
2. Use `WorldForensicsLimb` for object/NPC/item data
3. Create `InterfaceParser` class in `src/parsers/`
4. Maintain identical API contracts

### Phase 2: Eliminate RSMVBridge Subprocesses
Replace each `rsmvBridge` call with direct limb method invocations:
- Create missing limbs: `EnumLimb`, `DatabaseLimb`, `SequenceLimb`, `ModelLimb`
- Enhance existing limbs: `WorldForensicsLimb`, `VarbitSovereigntyLimb`
- Update all calling sites to use limb instances directly

### Phase 3: Verify & Optimize
1. Confirm all functionality preserved
2. Validate flat radar output via `ObservationEngine`
3. Ensure no webpack/transpilation dependencies remain
4. Measure performance improvement (eliminate subprocess overhead)

## Benefits of This Approach

✅ **Removes Webpack Dependency:** Pure TypeScript/JS execution  
✅ **Improves Performance:** Eliminates subprocess overhead  
✅ **Leverages Existing Code:** Uses battle-tested `JagexCacheReader`  
✅ **Maintains Compatibility:** Identical external interfaces  
✅ **Aligns with Architecture:** Uses existing POG2 limbs patterns  
✅ **Satisfies Requirements:** Cache-access only, flat radar data, no 3D renderer  

## Files Already Using POG2-Native Cache Access (Correct Pattern)
- `src/limbs/spatial/WorldForensicsLimb.ts` → Uses `JagexCacheReader` directly
- `src/engines/spatial/ObservationEngine.ts` → Uses `WorldForensicsLimb`
- `src/utils/POG2NativeCacheSource.ts` → Adapts `JagexCacheReader` to RSMV interface
- `src/limbs/spatial/CacheForensicsLimb.ts` → Uses JSON catalogs (already cache-independent)

The foundation is already in place - we just need to extend the existing patterns to replace the remaining RSMV dependencies.