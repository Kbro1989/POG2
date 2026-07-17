# src/logic/handlers

Feature-specific gameplay handlers. Each file owns one gameplay interaction or combat system.

Files:
- `PhotoBoothHandler.ts` — Mirrors the RS3 Photo Booth flow. Produces a player identity object containing `id`, `stats`, and `modelPath`. Uses `RSMVController`, `EntityLimb`, and `HiScoreLimb`.
- `NecromancyHandler.ts` — Implements necromancy stack mechanics from `necromancy_logic.json` via `LogicBrainLimb`. Manages `NecromancyState` (`necrosisStacks`, `residualSouls`, `adrenaline`, `commandCooldowns`) and computes ability behavior such as Finger of Death / Touch of Death / Soul Sap.

Notes:
- These are terminal gameplay logic modules, not parsers or routers.
- They rely on existing limb substrates rather than standalone IO.