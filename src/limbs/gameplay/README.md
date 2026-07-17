# `src/limbs/gameplay`

High-level game-simulation limbs — rotations, simulations, and PvM orchestration.

## Contents

| File | Purpose |
|------|---------|
| `PVMERotationLimb.ts` | Player-vs-Monster combat rotation planner. Derives optimal ability order from `SovereignAvatar` skill state and `AdrenalineStateMachine`. |

## Notes

Most gameplay scalability (rotation engines, aggression simulators, simulation harnesses,
loot resolvers) is wired into `bootstrap.ts` under `src/core/` rather than as standalone limb files.
