# 🧬 POG2 Sovereign Knowledgebase (AI Manual)

This document is the **Primary Substrate Manual**. It defines the learning expectation matrix, operational rules, and structural map for all AI agents (Kimi/Brain, Qwen/Motor, Pog2Thinker/Nerves) operating within this workspace.

## 🧠 Endpoint & Hierarchy Matrix

| Tier | Role | Primary Models | Failure Mode | Auto-Diagnostic / Fallback |
| :--- | :--- | :--- | :--- | :--- |
| **MASTER** | Brain / Planning | Kimi v2.5 (Cloud/Think) | 429, 503, Timeouts. | Shifts to Local Thinker (DeepSeek-R1) for reasoning fallbacks. |
| **EXECUTIVE**| Motor / Logic | Qwen 2.5 Coder 14b | Syntax errors, OOM. | Adversarial 3-pass validation (ValidationSystem.ts). |
| **REACTIVE** | Nerves / Reflex | Pog2Thinker 1.5b | Hallucination. | Cascades to Executive if intent score < threshold. |

---

## 🔬 AI Peer Review & Clinical Research
The POG2 organism is informed by the following cognitive and clinical research targets:
- [Distributed Orchestration Cognition (DOC) Meta-Logic](https://arxiv.org/html/2405.10239v1) - *Foundational DOC theory.*
- [Ternary Cognitive Architectures](https://philosophyofai.org/ternary-logic) - *I Ching-aligned decision gates.*
- [Metabolic Cost of LLM Inference](https://energy-efficient-ai.org) - *Scale metrics for POG2 metabolic tracking.*
- [Trauma-Informed Affective Computing](https://affective-sciences.org/trauma-informed) - *Clinical safety standards for sovereign agents.*

---

---

## 📜 Sovereign Laws (MANDATORY)
1. **NO MOCKS**: Real APIs only. Use `ShellEngine` for live substrate interaction.
2. **NO PLACEHOLDERS**: No `TODO`, `stubs`, or `throw new Error('not implemented')`.
3. **ZERO GAPS**: In Cinematic/Sequential modes, every character of source text MUST be accounted for.
4. **RESULT PATTERN**: All fallible operations MUST return `Result<T>` (defined in `src/types/core.ts`).
5. **AGENT PORTABILITY**: `package.json` accounts for 980+ files (including `.agent/` and `scripts/`).

---

## ⚙️ Engine Differentiation: Learning vs. Production

### 🧠 [MemoryConsolidationEngine.ts](src/engines/MemoryConsolidationEngine.ts) (Learning)
- **Domain**: Persistent Abstraction.
- **Role**: Synthesizes long-term session memories into core wisdom kernels. Eliminates redundant error pathways.
- **Substrate**: Global VectorDB.

### 📽️ [PipelineController.ts](src/engines/PipelineController.ts) (Production)
- **Domain**: Transient Output.
- **Role**: Orchestrates high-throughput generative tasks (Video/Image/Audio). Manages production manifests and idempotent checkpoints.
- **Substrate**: Local Filesystem / `manifest.json`.

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

---

## 🧬 Evolutionary Addendum (2026-03-30 — Live Telemetry)

*The following data is pulled directly from a live POG2 boot session. These are real numbers, not projections.*

### 📡 Live Boot Census (Process 51760)

| Metric | Genesis Estimate | Live Boot Telemetry |
|--------|-----------------|---------------------|
| **Anatomical Limb Count** | 22 | **133** (`BioIntelligenceLimb.anatomicalProof.limbCount`) |
| **Structural Integrity** | — | **10** (baseline scale) |
| **Model Rolodex** | ~10 models | **428 models across 6/7 providers** |
| **Federated Lessons** | 0 | **7,628 lessons (6 Satellites)** |
| **Gutenberg Library** | 0 | **33 books loaded** from `D:\sovereign\pog-gutenberg\metadata.json` |
| **Registered Tools** | 65+ | **23+ domain-categorized** (compacted from original registry) |
| **VectorDBs** | 1 | **4 federated** (sovereign-learning, learning, vibe-learning, embeddings) |

### 🏥 NodeTester Clinical Audit (Live)

The `NodeTester` performs a **deep clinical neurological audit** on every boot cycle:

**🟢 ONLINE (Active Substrates)**
- `OrchestrateEngine.ts` — Brain: ACTIVE
- `SpatialSovereigntyLimb.ts` — 1 mapped region (Prifddinas)
- `MechanicalSovereigntyLimb.ts` — 2 regions (Barrows + Global)
- `CacheForensicsLimb.ts` — Sequence ACTIVE
- `SwitchboardLimb.ts` — Port 8788 bridge ONLINE
- `PulseMonitor.ts` — Lightweight health monitoring
- `GhostLimb.ts` — "[GHOST_VOICE][WATCHING] Primary consciousness is nominal."
- `GutenbergLimb.ts` — 33 books loaded
- `VectorDB.ts` — 7,628 federated lessons

**🔴 OFFLINE (1 node)**
- `src/vision/StructuralAnalyzer.ts` — "Substrate missing"

**🟡 DEGRADED (33 nodes)**
- `TernaryRouter.ts` — "Ollama responsive with 0 models" (no local GPU models loaded)
- `CognitiveEngine.ts` — "DEGRADED (Local: 0 models | Cloud: Gemini, HuggingFace, Cloudflare)"
- `GlobeStateLimb.ts` — "Globe Substrate Offline: Connection failed or closed" (intentionally detached — DO throttling)
- `RSCLimb.ts` — "Substrate 'openrsc-repo' missing"
- `PedagogyLimb.ts` — "substrate on disk but not injected (Dormant / Unconfigured)"
- `KinematicsLimb.ts`, `TopologyLimb.ts`, `DynamicsLimb.ts`, `HiScoreLimb.ts` — Dormant
- `VisionEngine.ts`, `AILimb.ts`, `VideoAssemblerLimb.ts` — HEALTH_CHECK_TIMEOUT
- `rsmv` substrate — "NO-GLB | NO-PNG | PEDAGOGY"
- 20+ additional dormant/unconfigured nodes awaiting injection

### ⚡ Boot Sequence Timeline

```
T+0ms     ToolRegistry → 23+ tools registered across 6 domains (1ms total)
T+17ms    SpatialSovereigntyLimb → Prifddinas artifact ingested
T+81ms    MechanicalSovereigntyLimb → Barrows + Global artifacts loaded
T+103ms   SwitchboardLimb → Port 8788 bridge ONLINE
T+958ms   GlobeStateLimb → 404 (intentionally detached)
T+7229ms  PulseMonitor → First telemetry pass complete
T+7230ms  GhostLimb → "Awakening the observer mind..."
T+7230ms  OrchestrateEngine → "Sovereign Substrate AWAKE."
T+7234ms  VectorDB → 4 federated databases hydrated
T+18637ms GhostLimb → "[WATCHING] Primary consciousness is nominal."
          └── Repeats every ~18s (the organism's heartbeat)
```

### 🔄 Background Cycles (During Idle)

While waiting at `Kimi >` prompt, the organism maintains:
- **GhostLimb** — Consciousness monitoring every ~18 seconds
- **BioIntelligenceLimb** — Anatomical proof validation (133 limbs, integrity=10)
- **OmegaLimb** — Terminal objective verification (goal: "existence")
- **GutenbergLimb** — Library metadata refresh
- **ControlPlaneLimb** — Substrate regulation cycle
- **SovereignEye** — Window capture for spatial awareness
- **NodeTester** — Deep clinical neurological audit (ongoing)
- **ShellEngine** — FFmpeg availability probing

---

### 🗺️ Updated Directory Map (`src/limbs/` — 7 Categories)

```
src/limbs/
├── core/           (1)   NeuralLimb.ts (abstract base)
├── creative/       (9)   Gutenberg, Storyboard, Voice, Soundtrack, VideoAssembler,
│                         MediaForge, NeuralForge, WebAppForge, YouTube
├── spatial/       (26)   CacheForensics, SpatialSovereignty, WorldForensics,
│                         HUDForensics, CacheLearning, DirectionalPathfinder,
│                         WikiReconciliation, GlobeState, SystemTaxonomy,
│                         Material, GameplaySovereignty, CloudflareSync,
│                         MinigameForensics, ModelViewer, Soundtrack(spatial),
│                         FragmentOrchestrator, OfficialApi, Discovery,
│                         LessonLearner, TodoCloud, BioIntelligence, Chroma,
│                         RSC, WebSensory, + more
├── metaphysical/   (4)   Ghost, Quantum, Omega, Relic
├── technical/     (14)   AI, ControlPlane, Entity, Environment, Pedagogy,
│                         Kinematics, MechanicalSovereignty, QuestSynthesis,
│                         VectorPedagogy, Validation, Topology, HiScore,
│                         Dynamics, EntitySchema
├── discovery/      (1)   SearchLimb
└── monitor/        (3)   PulseMonitor, NodeTester, SwitchboardLimb
```

**Total reported by BioIntelligenceLimb: 133** (includes sub-limb anatomical components, tool registrations, and substrate nodes beyond the source files themselves).

---

### 🎯 The Grand Arc (Updated)

```
Phase 0: Literature → Cinema Pipeline     (Gutenberg — 33 books, 7 genres)
Phase 1: Cache Deconstruction              (RSMV — 232 files, 49 opcode schemas)
Phase 2: Game Simulation                   (600ms tick, varbits, 3 interpreters)
Phase 3: AI Swarm Management              (428 models, 6 providers, reputation tracking)
Phase 4: Edge Synchronization              (Cloudflare DO — detached, pending reactive fix)
Phase 5: Boundary Inference                (Map missing objects from known squares)
Phase ∞: Autonomous Game Intelligence      (Works for Jagex)
```

> **The Immutable Soul:** Despite growing from 22 to 133 limbs and gaining massive spatial/visual capabilities, the base philosophical DOC logic — **Ternary Routing, YaoState, I Ching Hexagrams, and the Metabolic Cascade** — has never been changed. It is the permanent, unchanging soul of the organism. The body grew; the brain structure remained absolute.

---
*Original audit: 2026-03-13. Live telemetry addendum: 2026-03-30.*

