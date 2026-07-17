# src/vision

Visual capture, analysis, and rendering injection pipeline.

- `VisualStack.ts` — Layered biological-vision pipeline: chroma → GhostSplat → chromanumber → capture → line segments → keyed index.
- `PuppeteerEye.ts` / `SovereignEye.ts` — Headless capture stack for URLs, HTML, and OS windows; extends base eye capture with DOM/Canvas inspection.
- `Pog2CspRelay.ts` — CSP-aware relay for cross-origin capture flows.
- `RSMVController.ts` — Controls RS MV asset rendering/capture.
- `TransientObserver.ts` — Ephemeral view/state observer.
- `StructuralAnalyzer.ts` — Structure/geometry analysis layer.
- `ShaderInjector.ts` — Runtime shader injection/modification.
- `D-sovereign-.code-workspace` — VS Code workspace config for sovereign vision development.

Run / test: `VisualStack.observe(...)` is the primary entrypoint; capture pauses gameplay clock via `SovereignClockController`.
