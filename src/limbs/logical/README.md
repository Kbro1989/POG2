# `src/limbs/logical`

Game-logic decoders and world-state management — packet/cache interpretation and persistence.

## Contents (17 files)

| File | Purpose |
|------|---------|
| `WorldStateLimb.ts` | authoritative world-state holder for the current session. |
| `InteractionGateway.ts` | Routes in-game actions to the correct limb / substrate. |
| `HandshakeLimb.ts` | Handshake protocol with the WorldDO. |
| `RestockLimb.ts` | Automatic supply/restock logic (e.g. supply tablets). |
| `SandboxBridge.ts` | Bridges sandboxed simulation into the live world-state pipeline. |
| `StatePersistenceLimb.ts` | Serialises / deserialises session state. |
| `StateMocks.ts` | Test fixture factory for world-state mocks. |
| `SovereignVocabularyLimb.ts` | Parses / translates sovereign command vocabulary. |
| `ClueLogicLimb.ts` | Clue-scroll step evaluation and progression logic. |
| `ExtrasOracle.ts` | Oracle for cosmetic/extras prediction. |
| `world/VariableBlockDecoder.ts` | Decodes variable-length cache blocks. |
| `world/MovementBlockDecoder.ts` | Decodes movement cache packets. |
| `world/MapPacketDecoder.ts` | Decodes map region packet payloads. |
| `world/HitsplatBlockDecoder.ts` | Decodes hitsplat (damage) cache blocks. |
| `world/AppearanceBlockDecoder.ts` | Decodes player/NPC appearance blocks. |
| `world/AnimationBlockDecoder.ts` | Decodes animation cache blocks. |
| `world/AdminCommandProcessor.ts` | Parses privileged admin command payloads. |

## Sub-modules

- `world/` — individual cache block decoders for each update-packet type.
