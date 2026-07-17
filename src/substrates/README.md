# src/substrates

World-state prediction and combat feedback substrates.

- `GhostSplatEngine.ts` — Predictive spatial intelligence layer; projects NPC/player movement and threat heatmaps over a 66x66 world model for tick N+1..N+3.
- `GhostSplatHitmarkRegistry.ts` — Maps wiki hitmark sprite ids to telemetry and volition signals for state transitions in the combat layer.

Run / test: driven by gameplay loop; see `src/tests/test_ghostsplat_engine.ts`.
