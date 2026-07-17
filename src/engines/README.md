# src/engines

Top-level application and subsystem engines for POG2. These implementations coordinate shell access, vision/MCP integration, task management, validation, ingestion, memory, and orchestration.

## Contents

- `OrchestrateEngine.ts` — Central orchestrator/brain wiring. Heavy aggregator that instantiates most other engines, limbs, and substrates under one domain-locking model-client router.
- `ShellEngine.ts` — Real command-execution substrate on Windows with ternary safety gating and telemetry.
- `ShellLibrary.ts` — Higher-level shell wrappers around `ShellEngine` for gcloud, wrangler, git, npm, ollama, etc.
- `VisionEngine.ts` — Multimodal observation substrate using `SovereignEye` and vision-model calls.
- `SpatialVisionEngine.ts` — Spatial-aware vision singleton for screen capture + spatial-map analysis.
- `VisionActuationHarness.ts` — Actuation layer that turns vision output into renderer/system actions.
- `WebSearchEngine.ts` — Web search/discovery substrate.
- `MCPEngine.ts` — MCP integration/status engine.
- `SovereignDefinitionEngine.ts` — Definition-time authority/provenance for sovereign entities.
- `SovereignIngestionEngine.ts` — Feedback-loop ingestion with metabolic constraints and hexagram-governed protocols.
- `MemoryConsolidationEngine.ts` — Memory consolidation engine.
- `AvatarCompositionEngine.ts` — Avatar composition substrate.
- `TemporalSynchronizer.ts` — Temporal clock/authority synchronization utility.
- `TodoEngine.ts` — Stateful todo checklist substrate with optional cloud sync (`TodoCloudLimb`).
- `VSCodeEngine.ts` — VSCode-oriented tool/automation engine.
- `ValidationSystem.ts` — Validation subsystem.
- `SyntropyEngine.ts` — Syntropy subsystem.
