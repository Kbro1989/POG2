# 🧬 POG2 Sovereign Knowledgebase (AI Manual)

This document is the **Primary Substrate Manual**. It defines the learning expectation matrix, operational rules, and structural map for all AI agents (Kimi/Brain, Qwen/Motor, Pog2Thinker/Nerves) operating within this workspace.

## 🧠 Endpoint & Hierarchy Matrix

| Tier | Role | Primary Models | Failure Mode | Auto-Diagnostic / Fallback |
| :--- | :--- | :--- | :--- | :--- |
| **MASTER** | Brain / Planning | Kimi v2.5 (Cloud/Think) | 429, 503, Timeouts. | Shifts to Local Executive for fallback logic. |
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

### 📁 `src/engines/` (Cognitive Substrate)
*30 specialized engines powering the sovereign intelligence.*
- `ASTWatcher.ts`, `ArchitecturalValidator.ts`, `ArchitectureDigest.ts`: Structural integrity.
- `ChromanumberEngine.ts`: SDXL image generation substrate.
- `CodeEngine.ts`, `CompletionEngine.ts`, `GenerateEngine.ts`: Creation suite.
- `CognitiveEngine.ts`, `MetaCognitionEngine.ts`, `MetabolicEngine.ts`: Reflection.
- `ContextBuilder.ts`, `MemeticEngine.ts`, `EmbedEngine.ts`: Semantic memory.
- `IntentVerifier.ts`, `ValidationSystem.ts`: Adversarial loops.
- `MCPEngine.ts`: Capability bridging.
- `MemoryConsolidationEngine.ts`, `SelfHealingEngine.ts`: Survival.
- `OrchestrateEngine.ts`: Brain loop (65+ Tools).
- `PipelineController.ts`: Cinematic Mode orchestrator.
- `ShellEngine.ts`, `ShellLibrary.ts`: Real system execution.
- `SpatialVisionEngine.ts`, `VisionEngine.ts`: Multimodal analysis.
- `VSCodeEngine.ts`: IDE integration.

### 📁 `src/limbs/creative/` (Expressive Pipeline)
*The storyboarding and cinematic output stack.*
- `GutenbergLimb.ts`: Literary ingestion & style analysis.
- `StoryboardLimb.ts`: Sequential narrative visualization.
- `VoiceLimb.ts`: Prosody-aware narration.
- `SoundtrackLimb.ts`: Adaptive procedural score generation.
- `VideoAssemblerLimb.ts`: Cinematic FFmpeg stitching.
- `WebAppForgeLimb.ts`: Full-stack project scaffolding.

---
*Operational Audit: 65+ Tools | 30 Engines | 8 Limbs | ~56 Configuration Settings*
