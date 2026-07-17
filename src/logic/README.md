# src/logic

Clinical gameplay logic implementations for POG2. Currently this directory only contains the `handlers` subfolder with concrete feature handlers; there is no top-level LogicBrain here.

Contents:
- `handlers/PhotoBoothHandler.ts` — Snapshot identity pipeline: captures a player’s 3D avatar export, hooks HiScore stats, binds identity to the technical limb substrate, and injects a memory record.
- `handlers/NecromancyHandler.ts` — Necromancy combat mechanics: synthesizes necromancy stack logic from pedagogy data, including necrosis/adrenaline/soul cap handling and ability damage scaling.

Notes:
- Both handlers are singletons and depend on limbs under `src/limbs/` and logger/models from `src/core`.
- This folder is effectively a dispatcher bucket for domain-specific gameplay behaviors.