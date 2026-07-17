# `src/convergence`

Bridge layer that reconciles Old School / RuneScape 3 data formats and hydrates live POG2 state from canonical map/spec substrates.

## Contents (9 files)

| File | Purpose |
|------|---------|
| `RSCDataLoader.ts` | Loads canonical anchor objects (e.g. Castle Ladder) from the openrsc-repo substrate. |
| `RS3ObjectDecoder.ts` | Decodes RS3-flavour object definitions into POG2-native format. |
| `UnifiedPortalRegistry.ts` | Unified portal/transition registry across game variants. |
| `SovereignPortalBridge.ts` | Bridge that exposes portal transitions to other limbs. |
| `index.ts` / `types.ts` | Public API surface and shared types. |
| `data/varrock.json` | Varrock region canonical data. |
| `data/lumbridge_castle.json` | Lumbridge Castle region canonical data. |
| `data/rsc_to_rs3_map.json` | Bidirectional RSC ↔ RS3 object-id mapping table. |

## Usage

Call `RSCDataLoader.loadAll()` at startup to hydrate world truth from substrate. Decoders pipe into `CacheForensicsLimb` and `SpatialDecoder`.
