# src/ui

Sovereign CLI output and world-state manifestation/rendering pipeline.

- `Renderer.ts` — Terminal renderer with banner, status helpers, output listeners, and path normalization.
- `ManifestationEngine.ts` — Orchestrates world-state assembly: spatial sync, HUD mounting, and final state pulse.
- `HUDRegistry.ts` — Operational HUD descriptor registry.
- `DashboardHeartbeat.ts` — Periodic heartbeat mechanism for dashboard liveness.
- `CapabilityBridge.ts` — Bridge between sovereign capabilities and renderer/output surface.
- `Renderer.js` — Legacy JS copy of the renderer shim.

Run / test: wired into CLI bootstrap and manifestation flows.
