# 🗂 POG2 Full Codebase Map (Sovereign Registry)

This registry provides absolute GitHub links to all neurological substrates within the POG2 organism.

> **Last Audited**: 2026-03-16 | **Total Files**: 105 TypeScript substrates

---

## 📂 Root (`src/`)
*Entry points and standalone scripts.*

- [cli.ts](https://github.com/Kbro1989/POG2/blob/main/src/cli.ts)
- [db_test.ts](https://github.com/Kbro1989/POG2/blob/main/src/db_test.ts)
- [test_vision_pipeline.ts](https://github.com/Kbro1989/POG2/blob/main/src/test_vision_pipeline.ts)
- [ToolRegistry.ts](https://github.com/Kbro1989/POG2/blob/main/src/ToolRegistry.ts)
- [verify_advanced_audio.ts](https://github.com/Kbro1989/POG2/blob/main/src/verify_advanced_audio.ts)

---

## 📂 API & AI Layer (`src/api/ai/`)
*Model discovery, capability mapping, and dispatch substrate.*

- [CapabilityRegistry.ts](https://github.com/Kbro1989/POG2/blob/main/src/api/ai/CapabilityRegistry.ts)
- [CloudflareModelRegistry.ts](https://github.com/Kbro1989/POG2/blob/main/src/api/ai/CloudflareModelRegistry.ts)
- [Dispatcher.ts](https://github.com/Kbro1989/POG2/blob/main/src/api/ai/Dispatcher.ts)
- [IntentMap.ts](https://github.com/Kbro1989/POG2/blob/main/src/api/ai/IntentMap.ts)
- [ModelRolodex.ts](https://github.com/Kbro1989/POG2/blob/main/src/api/ai/ModelRolodex.ts)
- [StaticModelRegistry.ts](https://github.com/Kbro1989/POG2/blob/main/src/api/ai/StaticModelRegistry.ts)

---

## 📂 Clients (`src/clients/`)
*Direct neural substrate callers. Real `fetch` calls only.*

- [ModelClient.ts](https://github.com/Kbro1989/POG2/blob/main/src/clients/ModelClient.ts)

---

## 📂 Configuration (`src/config/`)
*Sovereign configuration and environment variable mapping.*

- [SovereignConfig.ts](https://github.com/Kbro1989/POG2/blob/main/src/config/SovereignConfig.ts)

---

## 📂 Constants (`src/constants/`)
*Immutable registries for anatomy, kinetics, and model catalogs.*

- [AnatomyRegistry.ts](https://github.com/Kbro1989/POG2/blob/main/src/constants/AnatomyRegistry.ts)
- [KineticRegistry.ts](https://github.com/Kbro1989/POG2/blob/main/src/constants/KineticRegistry.ts)
- [ModelRegistry.ts](https://github.com/Kbro1989/POG2/blob/main/src/constants/ModelRegistry.ts)

---

## 📂 Core Types & Definitions (`src/core/`)
*Foundational types, hexagram definitions, and architectural digests.*

- [ArchitectureDigest.ts](https://github.com/Kbro1989/POG2/blob/main/src/core/ArchitectureDigest.ts)
- [HexagramDefinitions.ts](https://github.com/Kbro1989/POG2/blob/main/src/core/HexagramDefinitions.ts)
- [models.ts](https://github.com/Kbro1989/POG2/blob/main/src/core/models.ts)
- [ServiceDiscovery.ts](https://github.com/Kbro1989/POG2/blob/main/src/core/ServiceDiscovery.ts)
- [SovereignEye.ts](https://github.com/Kbro1989/POG2/blob/main/src/core/SovereignEye.ts)

---

## 📂 Cognitive Engines (`src/engines/`)
*The 30 specialized processing centers of the Sovereign Mind.*

<details>
<summary>View Engine Registry (30 files)</summary>

- [ArchitecturalValidator.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/ArchitecturalValidator.ts)
- [ASTWatcher.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/ASTWatcher.ts)
- [ChromanumberEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/ChromanumberEngine.ts)
- [CodeEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/CodeEngine.ts)
- [CognitiveEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/CognitiveEngine.ts)
- [CompletionEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/CompletionEngine.ts)
- [ContextBuilder.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/ContextBuilder.ts)
- [DiscoveryEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/DiscoveryEngine.ts)
- [EmbedEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/EmbedEngine.ts)
- [GenerateEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/GenerateEngine.ts)
- [IntentVerifier.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/IntentVerifier.ts)
- [MCPEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/MCPEngine.ts)
- [MemeticEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/MemeticEngine.ts)
- [MemoryConsolidationEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/MemoryConsolidationEngine.ts)
- [MetabolicEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/MetabolicEngine.ts)
- [MetaCognitionEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/MetaCognitionEngine.ts)
- [MultiModelExecutor.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/MultiModelExecutor.ts)
- [OrchestrateEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/OrchestrateEngine.ts)
- [PipelineController.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/PipelineController.ts)
- [SelfHealingEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/SelfHealingEngine.ts)
- [ShadowEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/ShadowEngine.ts)
- [ShellEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/ShellEngine.ts)
- [ShellLibrary.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/ShellLibrary.ts)
- [SpatialVisionEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/SpatialVisionEngine.ts)
- [SyntropyEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/SyntropyEngine.ts)
- [TodoEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/TodoEngine.ts)
- [ValidationSystem.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/ValidationSystem.ts)
- [VisionEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/VisionEngine.ts)
- [WebSearchEngine.ts](https://github.com/Kbro1989/POG2/blob/main/src/engines/WebSearchEngine.ts)

</details>

---

## 📂 Vision & Pedagogy (`src/vision/`)
*Transient observation and analysis of high-fidelity substrates.*

- [StructuralAnalyzer.ts](https://github.com/Kbro1989/POG2/blob/main/src/vision/StructuralAnalyzer.ts)
- [TransientObserver.ts](https://github.com/Kbro1989/POG2/blob/main/src/vision/TransientObserver.ts)

---

## 📂 Sovereign Limbs (`src/limbs/`)
*The 23 limbs connecting thought to substrate action.*

### 🧬 Base Substrate (`core/`)
- [NeuralLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/core/NeuralLimb.ts)

### 🎨 Creative Core (`creative/`)
- [GutenbergLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/creative/GutenbergLimb.ts)
- [MediaForgeLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/creative/MediaForgeLimb.ts)
- [NeuralForgeLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/creative/NeuralForgeLimb.ts)
- [SoundtrackLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/creative/SoundtrackLimb.ts)
- [StoryboardLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/creative/StoryboardLimb.ts)
- [VideoAssemblerLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/creative/VideoAssemblerLimb.ts)
- [VoiceLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/creative/VoiceLimb.ts)
- [WebAppForgeLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/creative/WebAppForgeLimb.ts)
- [YouTubeLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/creative/YouTubeLimb.ts)

### 🌌 Metaphysical Core (`metaphysical/`)
- [GhostLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/metaphysical/GhostLimb.ts)
- [OmegaLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/metaphysical/OmegaLimb.ts)
- [QuantumLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/metaphysical/QuantumLimb.ts)
- [RelicLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/metaphysical/RelicLimb.ts)

### 🧿 Spatial Core (`spatial/`)
- [BioIntelligenceLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/spatial/BioIntelligenceLimb.ts)
- [ChromaLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/spatial/ChromaLimb.ts)
- [GlobeStateLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/spatial/GlobeStateLimb.ts)
- [RSCLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/spatial/RSCLimb.ts)
- [WebSensoryLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/spatial/WebSensoryLimb.ts)

### ⚙️ Technical Core (`technical/`)
- [AILimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/technical/AILimb.ts)
- [ControlPlaneLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/technical/ControlPlaneLimb.ts)
- [EntityLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/technical/EntityLimb.ts)
- [EnvironmentLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/limbs/technical/EnvironmentLimb.ts)

---

## 📂 Routing (`src/routing/`)
*Ternary decision-making, hexagram state, and evolutionary feedback.*

### Core
- [DomainLocker.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/DomainLocker.ts)
- [HexagramManager.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/HexagramManager.ts)
- [TaskScheduler.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/TaskScheduler.ts)
- [TernaryRouter.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/TernaryRouter.ts)
- [types.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/types.ts)
- [WorkforceManifest.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/WorkforceManifest.ts)

### 🧬 Evolution (`evolution/`)
- [OutcomeScorer.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/evolution/OutcomeScorer.ts)
- [StrategyAdvisor.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/evolution/StrategyAdvisor.ts)

### 🎯 Strategies (`strategies/`)
- [AnalyticalStrategy.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/strategies/AnalyticalStrategy.ts)
- [CompositeStrategy.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/strategies/CompositeStrategy.ts)
- [DefaultStrategy.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/strategies/DefaultStrategy.ts)
- [FallbackStrategy.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/strategies/FallbackStrategy.ts)
- [OverrideStrategy.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/strategies/OverrideStrategy.ts)
- [TernaryClassifierStrategy.ts](https://github.com/Kbro1989/POG2/blob/main/src/routing/strategies/TernaryClassifierStrategy.ts)

---

## 📂 Monitor (`src/monitor/`)
*Biological heartbeat, clinical logging, and node testing.*

- [ClinicalLogger.ts](https://github.com/Kbro1989/POG2/blob/main/src/monitor/ClinicalLogger.ts)
- [NodeTester.ts](https://github.com/Kbro1989/POG2/blob/main/src/monitor/NodeTester.ts)
- [PulseMonitor.ts](https://github.com/Kbro1989/POG2/blob/main/src/monitor/PulseMonitor.ts)
- [SwitchboardLimb.ts](https://github.com/Kbro1989/POG2/blob/main/src/monitor/SwitchboardLimb.ts)

---

## 📂 Prompts (`src/prompts/`)
*System prompt templates for sovereign law enforcement.*

- [SystemPrompts.ts](https://github.com/Kbro1989/POG2/blob/main/src/prompts/SystemPrompts.ts)

---

## 📂 Scripts (`src/scripts/`)
*Diagnostic probes and stress testing utilities.*

- [cascadeDiagnostic.ts](https://github.com/Kbro1989/POG2/blob/main/src/scripts/cascadeDiagnostic.ts)
- [evolutionDiagnostic.ts](https://github.com/Kbro1989/POG2/blob/main/src/scripts/evolutionDiagnostic.ts)
- [stressTest.ts](https://github.com/Kbro1989/POG2/blob/main/src/scripts/stressTest.ts)

---

## 📂 Services (`src/services/`)
*Cloud provider integrations.*

- [CloudflareServices.ts](https://github.com/Kbro1989/POG2/blob/main/src/services/CloudflareServices.ts)
- [GoogleServices.ts](https://github.com/Kbro1989/POG2/blob/main/src/services/GoogleServices.ts)

---

## 📂 State (`src/state/`)
*Neurological map and state management.*

- [NeurologicalMap.ts](https://github.com/Kbro1989/POG2/blob/main/src/state/NeurologicalMap.ts)
- [StateManager.ts](https://github.com/Kbro1989/POG2/blob/main/src/state/StateManager.ts)

---

## 📂 Types (`src/types/`)
*Type definitions and domain contracts.*

- [diagnostic.ts](https://github.com/Kbro1989/POG2/blob/main/src/types/diagnostic.ts)
- [pipeline.ts](https://github.com/Kbro1989/POG2/blob/main/src/types/pipeline.ts)
- [result_test.ts](https://github.com/Kbro1989/POG2/blob/main/src/types/result_test.ts)
- [SovereignDomain.ts](https://github.com/Kbro1989/POG2/blob/main/src/types/SovereignDomain.ts)

---

## 📂 UI (`src/ui/`)
*Terminal rendering and interactive output.*

- [Renderer.ts](https://github.com/Kbro1989/POG2/blob/main/src/ui/Renderer.ts)

---

## 📂 Utilities (`src/utils/`)
*Critical substrate utilities for extraction, memory, and path resolution.*

<details>
<summary>View Utility Registry (22 files)</summary>

- [ClinicalAuditTool.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/ClinicalAuditTool.ts)
- [CodeExtractor.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/CodeExtractor.ts)
- [CognitiveTranslator.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/CognitiveTranslator.ts)
- [DBMaintenance.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/DBMaintenance.ts)
- [EndpointHealer.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/EndpointHealer.ts)
- [JsonExtractor.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/JsonExtractor.ts)
- [KeyVault.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/KeyVault.ts)
- [logger.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/logger.ts)
- [NarrativeExtractor.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/NarrativeExtractor.ts)
- [PathNormalizer.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/PathNormalizer.ts)
- [QuotaTracker.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/QuotaTracker.ts)
- [RSMVExtractor.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/RSMVExtractor.ts)
- [shell.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/shell.ts)
- [SmartEdit.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/SmartEdit.ts)
- [SovereignEye.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/SovereignEye.ts)
- [SovereignIgnoreManager.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/SovereignIgnoreManager.ts)
- [SovereignLibrary.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/SovereignLibrary.ts)
- [SovereignPathResolver.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/SovereignPathResolver.ts)
- [SovereignProprioception.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/SovereignProprioception.ts)
- [SovereignUI.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/SovereignUI.ts)
- [StyleAnalyzer.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/StyleAnalyzer.ts)
- [VectorDB.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/VectorDB.ts)
- [WikiEnricher.ts](https://github.com/Kbro1989/POG2/blob/main/src/utils/WikiEnricher.ts)

</details>

---

## 📂 External Core Substrates (`tmp/`)
*Local repository clones and critical external dependencies woven into the cognitive runtime.*

- [skillbert/rsmv](tmp_rsmv_inspect/) (RuneScape 3 Model Viewer + Cache Subsystem)

---
*Audited: 2026-03-16 | 105 TypeScript substrates across 17 folders + 1 External Substrate.*
