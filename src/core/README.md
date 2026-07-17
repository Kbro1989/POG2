# `src/core`

Foundation layer for POG2 — shared models, protocol definitions, registries, and bootstrap wiring.

## Contents (30 files)

| Category | Key Files |
|----------|-----------|
| **Models** | `models.ts`, `models.js` — `Coord`, `NPC`, `GameState`, `Skill`, `Wallet`, `SovereignAvatar` interfaces |
| **Avatar** | `SovereignAvatar.ts` — player entity with skill relevance mapping, combat state, equipment |
| **Bootstrap** | `bootstrap.ts` — registers gameplay/substrate bridges (CollisionEngine, GhostSplat, CombatRotation) and opens the WorldDO WebSocket |
| **Registries** | `NodeRegistry.ts`, `SpaceRegistry.ts`, `RegistryB.ts`, `ServiceDiscovery.ts` — service/resource locators |
| **Protocol** | `ProtocolOpcodes.ts`, `OpcodeReader.ts`, `HandshakeModels.ts` — wire protocol constants |
| **Hexagram** | `HexagramDefinitions.ts`, `HexagramDefinitions.js`, `HexagramNetworkBridge.ts` — I Ching / routing substrate |
| **Constants** | `beta_constants.ts`, `CacheConstants.ts`, `RealityGate.ts` — game constants & gating |
| **Transforms** | `WorldTransform.ts`, `SovereignPathResolver.ts`, `SubstrateManifestRegistry.ts` — coordinate/navigation resolvers |
| **Training** | `OmniTrainingBridge.ts`, `SkillResonance.ts`, `ProgressionValidator.ts` — cross-limb learning contracts |
| **Grounding** | `grounding.ts`, `CognitiveImmunologyEmergency.ts` — world grounding primitives |
| **Errors** | `errors.ts` |
| **Entity** | `EntityGhost.ts` |
| **Analysis** | `ArchitectureDigest.ts`, `ArchitectureDigest.js` |
| **Client Scripts** | `clientscript/callibrator.ts` |

## Sub-modules

- `clientscript/` — legacy client-script calibration shim.
