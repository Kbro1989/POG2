# `src/limbs/system`

System-level skill and meta-management limb.

## Contents

| File | Purpose |
|------|---------|
| `SkillsLimb.ts` | Skill resolver / aggregator. Reads `SovereignAvatar` skill state, applies `SkillRelevance` mapping, and exposes skill trees to downstream combat and pedagogical limbs. |

## Usage

Consumed by `CombatRotationEngine`, `PedagogyForensicsLimb`, and `PVMERotationLimb`.
