# `src/limbs/pedagogy`

Learning / forensics limbs — extract pedagogical signals from gameplay and feed them back into training.

## Contents

| File | Purpose |
|------|---------|
| `PedagogyForensicsLimb.ts` | Post-session forensic analysis; extracts mistake patterns and skill gaps from playback. |
| `PedagogyDistiller.ts` | Distills pedagogical events into compact training labels. |
| `CombatPedagogyBridge.ts` | Bridges combat events to pedagogical constructs. |
| `SovereignSyncLimb.ts` | Synchronises sovereign state to the learning model. |
| `SovereignAvatarActionBarVolition.ts` | Models player volition / action-bar intent as pedagogical signals. |
| `Interface1841ActionBarMapping.ts` | Maps OpenRS 1841 interface IDs to action-bar semantics. |
| `GhostTrainingLimb.ts` | Runs training loops against GhostLimb (NPC self-play). |

## Usage

Feed playback data into `PedagogyForensicsLimb.distill()` to produce training events
consumed by `OmniTrainingBridge`.
