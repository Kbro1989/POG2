# `src/limbs/cognitive`

Cognitive permission matrix — governs what subsystems may act and under what authorisation.

## Contents

| File | Purpose |
|------|---------|
| `CognitivePermissionMatrix.ts` | Central permission gate for limb actions. Defines authority tiers (`pog2`, `hermes`, `hardware`, `user`) and reason chains. |

## Usage

Consulted by `TemporalHeartbeatLimb` and all intent-producing limbs before acting.
