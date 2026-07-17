# src/services

Unified API/client wrappers for external substrates and sovereign integration.

- `GoogleServices.ts` — Vision, Translate, and Natural Language API clients with typed config and quota/error classification.
- `CloudflareServices.ts` — Workers AI / account bridge with `wrangler` auto-detection, token verification, and ternary auth status.
- `SovereignPedagogyBridge.ts` — Model-backed enrichment for missing manifest entities via KV caching and JSON-mode inference.
- `SovereignEntityResolver.ts` — Resolves world entities against the authentic spawn manifest and interaction vocabulary; produces HUD-ready entity data.

Run / test: imported by config/bootstrap; no standalone entrypoint.
