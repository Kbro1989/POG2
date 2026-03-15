# 🧬 Sovereign Contributor Guide (POG2)

Welcome to the Sovereign Organism. Contributing to POG2 requires adherence to clinical standards, philosophical integrity, and a DOC-first mindset.

---

## 🚀 Sovereign Developer Must-Apply Checklist (DO NOT SKIP)

### 1. Neurological Mapping 🧬
Before writing code, identify where the new component fits in the `NeurologicalMap.ts`.
- **CNS**: High-level routing, strategy, and orchestration.
- **MEMORY**: Key-value stores, vector databases, context management.
- **SENSORY**: External probes, monitoring, vision, and shell interaction.
- **MOTOR**: Generative output, code application, and renderer operations.
- **REGISTRY**: All new limbs/engines must be registered in [NeurologicalMap.ts](src/state/NeurologicalMap.ts) AND added to the [CODEBASE_MAP.md](CODEBASE_MAP.md).

### 2. Clinical Planning 📝
Use the Kimi orchestrator to design the implementation.
- Create an `implementation_plan.md` in the brain.
- Define the `SovereignDomain` (CODE, SYSTEM, VISION, etc.).
- Ensure the decision path follows **Ternary Routing** (Yin/Yang/Yao).

### 3. Real Implementation (NO MOCKS) 🛠️
Implement the logic against real substrates.
- No stubbed APIs.
- Mandatory `Result<T>` pattern for all fallible calls.
- Strict type safety (Zero TSC errors).
- **Trauma-Informed Logic**: Follow safety rules (Circuit Breaker, Reasoning Traces) in [ARCHITECTURE.md](ARCHITECTURE.md#%F0%9F%9B%A1%EF%B8%8F-trauma-informed-development-rules).

### 4. Neurological Auditing 🔬
Every new node MUST be auditable.
- Add a functional probe to `NodeTester.ts`.
- Expose a `healthCheck()` or `ping()` method on the component.
- Verify status via the `/health` command in the POG2 shell.

### 5. Clinical Verification ✅
- Run `npm run build` to verify neurological integrity.
- Verify the feedback loop via the `Renderer`.
- Update the `walkthrough.md` with real-world proof of functionality.

---

## 📝 Contributor TODO List

1.  [x] **Neurological Mapping**: Update `NeurologicalMap.ts` for all new nodes.
2.  [x] **CLI DOC Parity**: Document all new flags in `cli.ts` and ensure humanized CLI DOC (Distributed Orchestration Cognition) aligns with substrate intent.
3.  [ ] **Federation Preparation**: Align local-first logic for Phase 2 cloud augmentation.
4.  [x] **Model Anchoring**: Version lock Ollama/Qwen models in `SovereignConfig.ts`.
5.  [x] **Engine Deduplication**: Audit for overlapping logic between `MemoryConsolidationEngine` and `PipelineController`.
6.  [x] **Peer Review Sync**: Link clinical research data to `POG2_KNOWLEDGEBASE.md`.
7.  [x] **Metabolic Monitoring**: Add `healthCheck()` methods to all specialized limbs and engines.
8.  [x] **Visual Roadmapping**: Update `ARCHITECTURE.md` diagrams when structural paths change.
9.  [ ] **Pipeline Continuity**: Ensure Cinematic Mode run-continuity (Scene 1 -> 2 -> 3).
10. [x] **Clinical Auditing**: Run `npm run lint` and `ClinicalAuditTool` before every PR.

---

## 🛠️ CLI Reference (Sovereign Commands)

The POG2 CLI uses **Commander** for top-level commands and a **conversational REPL** with slash-commands for deep interaction.

### Top-Level Commands
- `pog2 init`: Initialize or repair Sovereign Context files (`.pog2.md`, `.rules.md`, `.manifest.md`).
- `pog2 process <intent>`: Execute a single task managed by Kimi. (`-y` for auto-proceed).
- `pog2 think <intent>`: Trigger a metabolic reflection cycle (I Ching thinking).
- `pog2 dispatch <capabilityId> <payload>`: Directly invoke an AI capability.
- `pog2 health`: Deep clinical audit (Alias for `system health`). (`--json` for raw data).
- `pog2 personality`: Display AI personality archetypes.
- `pog2 consolidate`: Trigger the Subconscious Memory Processor.
- `pog2 system status`: hierarchical routing diagnostics (`-r` for visual tree).
- `pog2 system audit <target>`: Scan a file or directory for Sovereign Law violations.
- `pog2 system capabilities`: Deep scan for available engines and limbs.
- `pog2 vs open [path]`: Open a Sovereign Workspace in VS Code.
- `pog2 gutenberg ingest <id>`: Download and store a book in the library.
- `pog2 pipeline run <bookId>`: Run a full creative story-to-media pipeline.

### REPL Slash Commands
Invoke these inside the conversational shell:
- `/help`: Show all shortcuts.
- `/status`: Show system mode, workspace, and model cooldowns.
- `/capabilities`: Discover latent substrate engines.
- `/registry`: List all registered substrate tools.
- `/vision`: Trigger spatial observation / eye capture.
- `/shadow`: Consult global architectural maps.
- `/memetics`: Research from browser history kernels.
- `/syntropy`: Harmonize external metadata (.claude/.gemini).
- `/pull [model]`: Directly pull an Ollama model.
- `/vs`: Open current workspace in VS Code.
- `/exit`: Power down the Sovereign Organism.

---

## 🤖 AI Model Standards (DOC Context)

Current anchor models for POG2's Distributed Orchestration Cognition:
- **Reasoning (Master)**: Kimi v2.5 / DeepSeek-R1 (Local Fallback)
- **Execution (Executive)**: Qwen 2.5 Coder (14B)
- **Reflex (Reactive)**: VibeThinker 1.5B (Autopoietic Seed)

*VibeThinker must not be modified by external project scripts.*

---
*Failure to follow this guide is a violation of Sovereign Law.* 🧬⚖️
