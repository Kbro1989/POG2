# `src/limbs/technical`

Infrastructure, validation, topology, quest synthesis, and UI substrate limbs.

## Contents (22 files)

| File | Purpose |
|------|---------|
| `AILimb.ts` | Generic AI inference wrapper consumed by neural limbs. |
| `EntityLimb.ts` / `EntitySchema.ts` | Entity lifecycle and schema validation. |
| `LogicBrainLimb.ts` | Logical inference brain for puzzle and mechanic evaluation. |
| `PedagogyLimb.ts` | Pedagogy sub-limb (lower-level, complements `PedagogyForensicsLimb`). |
| `VectorPedagogyLimb.ts` | Vector-space pedagogical representations. |
| `UISubstrateLimb.ts` | UI overlay / substrate abstraction layer. |
| `SovereignSandboxLimb.ts` | Sandboxed session for safe simulation. |
| `SovereignEditorLimb.ts` | Editor-side sovereign data manipulation. |
| `ValidationLimb.ts` | Cross-field validation for game-state mutations. |
| `TopologyLimb.ts` | Network/graph topology over the Hexagram substrate. |
| `QuestForgeLimb.ts` / `QuestSynthesisLimb.ts` | Quest content generation and synthesis. |
| `ObjectiveLimb.ts` | Quest-objective state tracker. |
| `MechanicalSovereigntyLimb.ts` | Sovereign mechanical rules (e.g. tick-equaliser). |
| `KinematicsLimb.ts` | Kinematic motion model for NPCs and projectiles. |
| `HiScoreLimb.ts` | Hi-score / personal-best tracking. |
| `HexagramNetworkBridge.ts` | Bridge registration for technical BRD structures. |
| `EpistemicVerificationLimb.ts` | Knowledge/truth verification state machine. |
| `EnvironmentLimb.ts` | Environment / weather / time-of-day state. |
| `DynamicsLimb.ts` | General-purpose dynamic systems primitives. |
| `ControlPlaneLimb.ts` | Control-plane API for external tooling. |

## Usage

Technical limbs are infrastructure-adjacent; they are rarely invoked directly from
gameplay code and instead service other limbs via the `HexagramNetworkBridge`.
