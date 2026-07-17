# src/types

Shared type contracts across sovereign, domain, routing, and system layers.

- `SovereignDomain.ts` / `.js` — Domain enum, tool->domain map, and domain adjacency matrix for cross-execution rules.
- `diagnostic.ts` / `.js` — Result/error shapes for disk, process, and compiler diagnostics.
- `pipeline.ts`, `spatial.ts`, `result_test.ts` — Pipeline result shapes, spatial coordinate types, and test harness result helpers.
- `src_rsmv.d.ts` — Ambient typings for extracted RS MV assets.

Run / test: imported across codebase; no standalone entrypoint.
