# 🧬 POG2 Sovereign Knowledgebase (AI Manual)

This document is the **Primary Substrate Manual**. It defines the learning expectation matrix, operational rules, and structural map for all AI agents (Kimi/Brain, Qwen/Motor, Pog2Thinker/Nerves) operating within this workspace.

## 🧠 Endpoint & Hierarchy Matrix

| Tier | Role | Primary Models | Failure Mode | Auto-Diagnostic / Fallback |
| :--- | :--- | :--- | :--- | :--- |
| **MASTER** | Brain / Planning | Kimi v2.5 (Cloud/Think) | 429, 503, Timeouts. | Shifts to Local Thinker (DeepSeek-R1) for reasoning fallbacks. |
| **EXECUTIVE**| Motor / Logic | Qwen 2.5 Coder 14b | Syntax errors, OOM. | Adversarial 3-pass validation (ValidationSystem.ts). |
| **REACTIVE** | Nerves / Reflex | Pog2Thinker 1.5b | Hallucination. | Cascades to Executive if intent score < threshold. |

---

## 📜 Sovereign Laws (MANDATORY)
1. **NO MOCKS**: Real APIs only. Use `ShellEngine` for live substrate interaction.
2. **NO PLACEHOLDERS**: No `TODO`, `stubs`, or `throw new Error('not implemented')`.
3. **ZERO GAPS**: In Cinematic/Sequential modes, every character of source text MUST be accounted for.
4. **RESULT PATTERN**: All fallible operations MUST return `Result<T>` (defined in `src/types/core.ts`).
5. **AGENT PORTABILITY**: `package.json` accounts for 980+ files (including `.agent/` and `scripts/`).

---

## 🗺️ Global Directory Map (`\files`)

### 📁 Root Configuration
- `package.json`: Accounts for all structural folders (.agent, .agents, scripts, substrate-v2).
- `tsconfig.json`: Inclusion scope includes `src/` and `scripts/` with generalized `rootDir`.
- `.rules.md`: Clinical rules for code and system behavior.
- `.manifest.md`: AI-readable state of active limbs and heart rate.
- `.env`: Operational secrets and dynamic Neural Model endpoints.

### 📁 `src/` (Substrate Core & Utilities)
*The fundamental nervous system connecting the engines and limbs.*
- `cli.ts`: Primary sovereign command-line interface.
- `ToolRegistry.ts`: Central registry for tools/MCP actions.
- `api/`: Model routing & multi-modal capability mapping (`ModelRolodex.ts`, `Dispatcher.ts`, `CloudflareModelRegistry.ts`, `StaticModelRegistry.ts`, `IntentMap.ts`, `CapabilityRegistry.ts`).
- `clients/`: Network layers (`ModelClient.ts`).
- `config/`: System configuration mapping (`SovereignConfig.ts`).
- `constants/`: Architectural schemas (`AnatomyRegistry.ts`, `KineticRegistry.ts`, `ModelRegistry.ts`).
- `core/`: Fundamental taxonomy & definitions (`models.ts`, `ArchitectureDigest.ts`, `HexagramDefinitions.ts`, `ServiceDiscovery.ts`, `SovereignEye.ts`).
- `learning/`: Persistent memory layout for historical training data.
- `monitor/`: Substrate pulse and visual diagnostic wiring (`PulseMonitor.ts`, `NodeTester.ts`, `ClinicalLogger.ts`, `SwitchboardLimb.ts`).
- `prompts/`: Base neural templates (`SystemPrompts.ts`).
- `routing/`: Deep decision paths (`TernaryRouter.ts`, `HexagramManager.ts`, `DomainLocker.ts`, `WorkforceManifest.ts`) and classification `strategies/`.
- `services/`: External API bridges (`CloudflareServices.ts`, `GoogleServices.ts`).
- `state/`: Persistent and active memory representation (`NeurologicalMap.ts`, `StateManager.ts`).
- `types/`: Type definitions boundary (`SovereignDomain.ts`, `diagnostic.ts`, `pipeline.ts`, `result_test.ts`).
- `ui/`: Terminal rendering layers (`Renderer.ts`).
- `utils/`: Operational support functions (`VectorDB.ts`, `SmartEdit.ts`, `EndpointHealer.ts`, `ClinicalAuditTool.ts`, `PathNormalizer.ts`, `SovereignIgnoreManager.ts`, `RSMVExtractor.ts`, etc.).

### 📁 `src/engines/` (Cognitive Substrate)
*30 specialized engines powering the sovereign intelligence.*
- `ASTWatcher.ts`, `ArchitecturalValidator.ts`: Structural & syntax integrity.
- `ChromanumberEngine.ts`: SDXL image generation substrate.
- `CodeEngine.ts`, `CompletionEngine.ts`, `GenerateEngine.ts`: Source creation suite.
- `CognitiveEngine.ts`, `MetaCognitionEngine.ts`, `MetabolicEngine.ts`: Advanced reflection & load-balancing.
- `ContextBuilder.ts`, `MemeticEngine.ts`, `EmbedEngine.ts`: Semantic semantic memory arrays.
- `IntentVerifier.ts`, `ValidationSystem.ts`: Adversarial loops & logic gates.
- `MCPEngine.ts`: External capability bridging.
- `MemoryConsolidationEngine.ts`, `SelfHealingEngine.ts`: Biological survival & auto-correction.
- `OrchestrateEngine.ts`: Primary Brain loop (handling 65+ Tools & `/spawn`).
- `PipelineController.ts`: Cinematic Mode step orchestrator.
- `ShellEngine.ts`, `ShellLibrary.ts`: Real system execution & Win32 delegation.
- `SpatialVisionEngine.ts`, `VisionEngine.ts`: Multimodal optical analysis.
- `VSCodeEngine.ts`: IDE workflow integration.
- *Also features*: `DiscoveryEngine.ts`, `MultiModelExecutor.ts`, `ShadowEngine.ts`, `SyntropyEngine.ts`, `TodoEngine.ts`, `WebSearchEngine.ts`.

### 📁 `src/limbs/` (22 Sovereign Limbs)
*The 5-Core Anatomical Structure of the POG2 Substrate.*

**Creative Core (9 Limbs) - `src/limbs/creative/`**
- `GutenbergLimb.ts`: Literary ingestion & style analysis.
- `MediaForgeLimb.ts`: Asset generation coordination.
- `NeuralForgeLimb.ts`: Substrate self-reflection and prompt alchemy.
- `SoundtrackLimb.ts`: Adaptive procedural score generation.
- `StoryboardLimb.ts`: Sequential narrative visualization.
- `VideoAssemblerLimb.ts`: Cinematic FFmpeg stitching.
- `VoiceLimb.ts`: Prosody-aware narration.
- `WebAppForgeLimb.ts`: Full-stack project scaffolding.
- `YouTubeLimb.ts`: Publishing and distribution.

**Spatial Core (4 Limbs) - `src/limbs/spatial/`**
- `BioIntelligenceLimb.ts`: Anatomical proofs and heuristic feedback loops.
- `ChromaLimb.ts`: Spatial/Visual Chromanumber Intelligence (Sequence generation).
- `RSCLimb.ts`: RSC Bridge and TCP connectivity endpoint.
- `WebSensoryLimb.ts`: Browser-based perception context loop.

**Metaphysical Core (4 Limbs) - `src/limbs/metaphysical/`**
- `GhostLimb.ts`: The Observer Mind. Assumes control in catatonic state (48hr airgap resilience). Dynamic Local Thinker fallback (DeepSeek-R1).
- `OmegaLimb.ts`: Terminal objective verification.
- `QuantumLimb.ts`: Probabilistic execution / multi-path collapse.
- `RelicLimb.ts`: Archival / legacy integration (30s TCP key rotation persistence).

**Technical Core (4 Limbs) - `src/limbs/technical/`**
- `AILimb.ts`: Low-level ModelClient encapsulation interface.
- `ControlPlaneLimb.ts`: Sovereign CLI and shell task delegation interface.
- `EntityLimb.ts`: NPC intelligence and identity persistence formatting.
- `EnvironmentLimb.ts`: Weather, state, and room awareness generation.

**Core (1 Limb) - `src/limbs/core/`**
- `NeuralLimb.ts`: The abstract base limb class that enforces cognitive uniformity across all branches.

---
*Operational Audit: 65+ Tools | 30 Engines | 22 Limbs | 16 Support Modules | ~56 Configuration Settings*
