# src/routing/strategies

Pluggable routing strategy implementations and their shared contracts.

Files:
- `types.ts` — Defines `RoutingDecision`, `RoutingContext`, `RoutingStrategy`, and `TerminalStrategy`.
- `TernaryClassifierStrategy.ts` — Splits prompt length into `deep` vs `local` tiers and picks a model by priority band.
- `OverrideStrategy.ts` — Keyword match via `IntentMap`; overrides selection when intent signatures are detected.
- `FallbackStrategy.ts` — Prefers the first available model containing `qwen`; returns `null` if none found.
- `DefaultStrategy.ts` — Terminal fallback strategy picking the first available model, defaulting to `deepseek-r1:8b`.
- `CompositeStrategy.ts` — Chains multiple `RoutingStrategy` instances with one terminal fallback; non-terminal strategies are first-match, terminal is always executed.
- `AnalyticalStrategy.ts` — Selects the highest-priority available model for non-Yin complexity; skips Yin tasks.

Notes:
- `.js` twins may not exist for these strategies; this folder currently only contains `.ts` implementations.
- These are consumed by higher-level routing layers and do not mutate substrate state.