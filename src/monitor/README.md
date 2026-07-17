# src/monitor

Biological health, telemetry, diagnostics, and logging substrates.

Files:
- `PulseMonitor.ts` — System heartbeat/substrate monitor. Registers with `CanonicalClock`, runs telemetry passes, falls back to lightweight `NodeTester` limb audits, manages disk/memory health checks, neural node enumeration via `tasklist`, TSC boundary verification, and airgap validation. Extends `EventEmitter`.
- `ClinicalLogger.ts` — JSON-line clinical log writer under `logs/neurological_audit.log` with 100MB rotation and `ClockAuthorityRegistry` timestamps.
- `NodeTester.ts` — Neurological diagnostic scanner for nodes mapped in `NeurologicalMap`. Probes by category (`CNS`, `PNS`, `SENSORY`, `MEMORY`, `IMMUNE`, `METABOLIC`), runs registry health checks, audits AI providers, and updates `SubstrateResolver` state.
- `SwitchboardLimb.ts` — External HTTP/WebSocket bridge server serving dashboards, action bars, enriched wiki/cache data, mapsquare `ms_x_y.json` collisions, CSP relay mounts, and admin command queues.
- `TelemetryOverlay.ts` — Small console overlay that renders active intercepted beta/mock script IDs.
- `NodeTester.js` — JS twin of `NodeTester.ts`.
- `PulseMonitor.js` — JS twin of `PulseMonitor.ts`.
- `ClinicalLogger.js` — JS twin of `ClinicalLogger.ts`.

Notes:
- `.js` files are compiled counterparts alongside TS sources.
- `SwitchboardLimb.ts` is the largest file and primary external ingress.