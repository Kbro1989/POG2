# src/routing

Central nervous system for model routing, dispatch, state modeling, and workforce orchestration.

Heavy files:
- `TernaryRouter.ts` — Primary complexity/router. Classifies prompts into Yang/YinYang/Yin plus specializations, manages model roster sync, sovereign knock validation, cooldowns, evolutionary sweep/proposed mutations, FPRAG/routed decisions, and fallback override behavior.
- `HexagramManager.ts` — I-Ching state machine. Manages 6-line context cards, moving-line detection from kernel diagnostics, transitional topology (`primary/nuclear/future` hexagrams), decision matrix mapping Yao states to directives, GhostSplat pulse broadcasting, and strategic-state analysis via `ModelClient`.
- `FireInjectionRouter.ts` — Composed security/access gate primitive. Runs user-override, sovereign-knock hexagram/chroma/nonce/anatomy checks, HexagramBridge skill resolution, `DomainLocker` dispatch, capability checks, ternary classification, and route decision compilation into an audit report.
- `DomainLocker.ts` — Wait/pass domain context manager. Classifies active domain, provides dispatch verdicts, logs transitions, and enforces no hard-block behavior for Kimi orchestration.
- `TaskScheduler.ts` — Priority queue orchestrator with provider concurrency limits, wait-time tracking, queue congestion warnings, and absolute-timeout expansion for high-priority tasks.
- `WorkforceManifest.ts` — Worker roster of 18 specialized sovereign workers mapping model IDs/config keys to domains, tools, system prompts, memory namespaces, tiers, and rate limits.
- `GlobeReconciliationKernel.ts` — World-belief reconciliation. Ingests CNS `WorldDelta` mutations, loads `ms_x_y` cache chunks, and produces tile-level consensus states with uncertainty detection.
- `VibeMapper.ts` — Derives agent vibe from fragment logic/emotional pool/npc-object intents and pushes somatic intent cards into `HexagramManager`.
- `AttentionRouter.ts` — Salience/urgency overlay on `TernaryRouter`. Accumulates anomaly/urgency/negative-valence signals and escalates routing tier to Master when effective salience is high.
- `types.ts` — Shared routing types: `RoutingContext`, `RoutingDecision`, `RoutingStrategy`, `TerminalStrategy`.

Notes:
- Top-level routing files are core orchestration surfaces; strategies live in `src/routing/strategies`, evolution components in `src/routing/evolution`.
- Heavy modules intertwine gameplay substrate state with meta-cognition rather than stateless forwarding only.