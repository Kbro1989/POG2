# src/engines/gameplay

Gameplay-specific engines and interpreter modules for POG2’s deterministic simulation layer. Covers combat, minigames, boss encounters, NPC/player agents, loot resolution, and game-runtime interpretation.

## Contents

- `SimulationHarness.ts` — Central CNS node for the deterministic Dual-Tick simulation loop; handles avatar state, server logic mapping, movement substrate, AI dispatcher roles, and network bridge coordination.
- `CombatRotationEngine.ts` — Ability selection/evaluation engine with constraint pipeline for range, cooldowns, GCD, channel lock, adrenaline, and archetype priority chains.
- `NpcAgent.ts` / `PlayerAgent.ts` — Stateful runtime agents for NPC and player behavior under the simulation harness.
- `PlayerStateHydrator.ts` — Hydrates player avatars from authoritative saved-state blobs.
- `NecromancyInterfaces.ts` — Necromancy-themed types/interfaces used by combat/interpreter subsystems.
- `MinigameInterfaces.ts` — Cross-minigame interpreter contract/interfaces.
- `BarrowsInterpreter.ts` / `PestControlInterpreter.ts` / `PrifddinasInterpreter.ts` — Activity-specific runtime interpreters.
- `UniversalInterpreter.ts` / `JsonLogicInterpreter.ts` / `SubstrateResolver.ts` — General-purpose logic interpretation and substrate-resolution utilities.
- `ServerLogicRegistry.ts` — Registry/logic mapper for server-only/admin behavior derived from cache and wiki enrichment.
- `BossTemplateLoader.ts` / `BossWaveSpawner.ts` / `AggressionSimulator.ts` — Boss encounter sequencing, spawn orchestration, and aggression simulation.
- `AbilityBook.ts` / `ItemBook.ts` — Canonical ability/item registries for consumable/game-definition queries.
- `LootResolutionEngine.ts` / `LootBeamRegistry.ts` / `LuckTierRegistry.ts` — Loot-drop resolution, beam-effect tracking, and luck-tier classification.
- `CNSGodheadPulseVolley.ts` — CNS pulse/volley substrate orchestrating heartbeat-governed cognitive bursts.
