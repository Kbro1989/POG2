# src/sovereign

Sovereignty rules loading and hexagram-based permission logic.

- `Pog2Integration.ts` — Loads/caches `hermes-agent/config/sovereign_rules.yaml`, exposes typed inference/activation/audit/escape-hatch clauses.
- `Pog2HexagramBridge.ts` — Turns `Pog2Integration` + `HexagramManager` + `DomainLocker` into `ALLOW|WAIT|BLOCK` permission verdicts; honors the YAML user-override escape hatch.

Run / test: exercised from boot path and tool dispatch; no standalone CLI in this folder.
