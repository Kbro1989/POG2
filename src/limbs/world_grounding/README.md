# `src/limbs/world_grounding`

World-grounding anchor — ties avatar state to the live game world coordinate system.

## Contents

| File | Purpose |
|------|---------|
| `WorldGroundingLimb.ts` | Projects `SovereignAvatar` coordinates into the canonical world reference frame (RuneScape tile coordinates, planes, regions). Reconciles discrepancies between cached ground truth and live client state. |

## Usage

Invoked each heartbeat tick by `TemporalHeartbeatLimb`. Reads from `SpatialDecoder` /
`CacheForensicsLimb` to validate that avatar position, NPC positions, and map tiles
are consistent with decoded cache data.
