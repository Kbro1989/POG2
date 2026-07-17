# `src/limbs/combat`

Combat adrenaline / state-machine layer.

## Contents

| File | Purpose |
|------|---------|
| `AdrenalineStateMachine.ts` | Finite state machine for player and NPC adrenaline. Defines adren-charge thresholds, decay, and ability unlock conditions. |

## Usage

Instantiated and stepped by `CombatLimb` (spatial) and `PVMERotationLimb` (gameplay).
