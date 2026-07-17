# src/engines/core

CNS/core truth-state machinery underpinning POG2. These engines operate on epistemic transition, causal history, invariant rule compilation, validation, and prediction-state dynamics.

## Contents

- `EpistemicTransitionKernel.ts` — Central truth-state controller. Manages transitions between execution → causal → interpretation → invariant stages, proof emission, volatility prediction, and spatial prediction tracking.
- `CNSCausalityLedger.ts` — Causality ledger/history for sealed causal artifacts.
- `InvariantCompiler.ts` — Compiles recurring causal patterns into structural invariant rules with governance/ISA checks; gates against shadow/chaotic learning modes.
- `TruthReconciler.ts` — Truth reconciliation substrate.
- `EpistemicValidator.ts` — Validator for truth-class state transitions.
- `CausalPatternExtractor.ts` — Extracts causal patterns from execution/causal history.
- `NecromancerBrain.ts` — Brain-level coordination for necromancy/revival logic within core substrate.
- `WaitDecisionMaker.ts` — Decision/fallback substrate for wait/delay semantics.
