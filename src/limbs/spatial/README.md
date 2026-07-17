# `src/limbs/spatial`

Largest limb collection — spatial reasoning, rendering, forensics, world-state, and game systems.

Targets: RuneLite/RuneScape cache interpretation, OSRS map reconstruction, avatar state,
HUD overlay, combat, soundtracks, and cross-version data reconciliation.

## Notable files (50+)

### Rendering & Avatar
`AvatarRenderLimb.ts`, `AvatarStateLimb.ts`, `OracleEmotionAdapter.ts`, `GhostSplatLimb.ts`,
`ModelViewerLimb.ts`, `MaterialLimb.ts`

### Spatial Decoding
`SpatialDecoder.ts`, `CacheSpatialDecoder.ts`, `SpatialRadarLimb.ts`, `SpatialMetricEngine.ts`,
`SpatialMetricsRegistry.ts`, `DirectionalPathfinder.ts`, `NavigationLimb.ts`,
`SovereignCollisionEngine.ts`, `GeometryAnnotationLayer.ts`, `FragmentOrchestrator.ts`

### World Forensics
`WorldForensicsLimb.ts`, `CacheForensicsLimb.ts`, `HUDForensicsLimb.ts` (`.ts` + `.js`),
`ArchaeologyEngine.ts`, `MinigameForensicsLimb.ts`, `OfficialApiLimb.ts`

### Sovereignty & State
`SpatialSovereigntyLimb.ts`, `VolumeSovereigntyLimb.ts`, `VarbitSovereigntyLimb.ts`,
`GameplaySovereigntyLimb.ts`, `GameplayProjectionLimb.ts`, `SovereignInteractionLimb.ts`,
`SovereignCs2NativeRegistry.ts`, `ItemLifecycleLimb.ts`

### Data / Back-end
`DBRowOracleLimb.ts`, `CacheSpatialDecoder.ts`, `PlaneTransitionRegistry.ts`,
`RSCLimb.ts`, `CloudflareSyncLimb.ts`, `SoundtrackLimb.ts`, `SpatialDecoder.ts`

### Specs & Docs
`oracle-avatar-payload-spec.md`, `oracle-avatar-head-spec.md`

## Sub-modules scattered across other limbs

Many files in the `spatial/` listing belong to other domain limbs (audio, creative, pedagogical,
system) due to cross-cutting cache-rendering concerns. See those limb READMEs for details.

## Usage

`SpatialDecoder` is the primary entry-point to convert cache exports → spatial truth.
