# `src/entities/ai`

AI brain implementations for POG2 NPC entities.

## Contents

| File | Purpose |
|------|---------|
| `NecromancerBrain.ts` | Decentralised cognitive delegate for Necromancer NPCs. Implements 4-tick Magic rhythm (2.4 s cadence), target aggro evaluation, spell/intent injection, and state persistence across ticks. Called by `GameplaySovereigntyLimb` every heartbeat (600 ms). |

## Usage

```ts
import { NecromancerBrain } from '../entities/ai/NecromancerBrain';
const brain = new NecromancerBrain(npcInstance);
brain.think(tick, gameState, avatar);
```
