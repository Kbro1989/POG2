# `src/entities`

Runtime entity definitions for POG2 avatars and NPCs.

## Structure

```
entities/
└── ai/
    └── NecromancerBrain.ts    (single file)
```

The top-level `entities/` folder currently has no direct files; the only concrete
implementation lives under `ai/`.

## `ai/`

| File | Purpose |
|------|---------|
| `NecromancerBrain.ts` | Decentralised cognitive delegate for Necromancer NPCs. Implements 4-tick Magic rhythm (2.4 s cadence), target aggro evaluation, spell/intent injection, and state persistence across ticks. |

## Notes

Entity brains are referenced by `GameplaySovereigntyLimb` at each heartbeat tick.
