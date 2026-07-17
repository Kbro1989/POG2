# src/routing/evolution

Routing self-improvement components: outcome scoring and mutation proposal.

Files:
- `OutcomeScorer.ts` — Grades completed interactions in `0.0..1.0` range. Validates syntax for code/JSON blocks, applies heuristic penalties for refusal/error text, and optionally delegates semantic matching to a judge model.
- `StrategyAdvisor.ts` — Consumes recent interaction history plus `OutcomeScore`s, aggregates by model, and proposes `StrategyMutation`s demoting underperforming models when failure rate >20% after 5+ samples or avg score <0.6.
- `StrategyAdvisor.js` — JS twin of `StrategyAdvisor.ts`.
- `OutcomeScorer.js` — JS twin of `OutcomeScorer.ts`.

Notes:
- These are the “experience/economy” layer for routing, feeding via `TernaryRouter.evolutionarySweep` and `applyMutation`.