---
description: 
---

# POG2 Substrate Knowledgebase

This document serves as the permanent learning expectation matrix for the Sovereign Brain regarding core endpoints and their behaviors.

## Endpoint Expectation Matrix

| Endpoint / Substrate | Primary Role | Failure Mode | Auto-Diagnostic / Fallback | Learning Expectation |
| :--- | :--- | :--- | :--- | :--- |
| **Kimi (Ollama/Local)** | Primary execution & orchestration. Tells local sub-agents what to do. | Service down, OOM, timeouts, dry-runs. | Activates strict **61-minute cooldown timer**. Falls over to Kimi (HuggingFace) immediately. | Assume local Kimi will run dry for 1-hour chunks. |
| **Kimi (HuggingFace)** | Lifeline Orchestrator while local Ollama cools down. | 429 Too Many Requests, 500 Server Error. | Activates **61-minute HF cooldown**, routing back to local Kimi to prevent full blackout. | Do not use for sub-tasks. Reserved exclusively for Orchestration failover. |
| **Ollama (Sub-Agents)** | Deep execution scripts (DeepSeek/Yi-Coder logic loops). | Local compute starvation (notoriously "snail slow"). | No fallback API; uses a **massive 60-minute wait-per-action (`AbortSignal`) threshold**. | DO NOT interrupt local sub-agents. Let them cook. They will eventually complete. |
| **Gemini (Cloud)** | Heavy lifting, massive context windows. | 503 Service Unavailable, invalid API Key. | Automatically invokes `gcloud auth print-access-token` for Bearer token fallback. | If API key fails, assume local gcloud identity is the source of truth. |
| **Cloudflare Wrangler**| Deployment & CF resource manipulation. | Command fails, unauthenticated, script missing. | Extracts `whoami` and `npx wrangler --help` and returns to Orchestrator. | Orchestrator should analyze the `help` dump and rewrite the `wrangler.toml` or correct the syntax. |

## Operational Rules for Agents
1. **Strict Orchestrator Hierarchy**: Kimi (Local or HF) always figures out the plan. Other local Ollama models act purely as sub-agents carrying out tasks.
2. **Global Diagnostic Shells**: If *any* CLI tool (`git`, `npm`, `python`, `powershell`) fails, grab `--help` and environment context. Never crash blindly.
4. **Preserve State**: Always clean up DB handles and `exec` processes so subsequent retries aren't blocked by locks.

## Global Directory Map (`\POG2-interactive\files`)

### Root Level
- `POG2_KNOWLEDGEBASE.md` - Core rulebook documenting sub-agent wait times, Kimi router failures, and this map.
- `package.json` / `tsconfig.json` - Node project manifests and TypeScript compiler settings.
- `POG2-test-loop/` - Execution sandbox for testing validation loops cleanly.
- `substrate-v2/` - Advanced implementation directory carrying V2 logic paths.
- `test_dispatch/` - Testing sub-system for prompt routing and dispatches.

### `src/` (Core Application)
- `cli.ts` - Main CLI entry point binding terminal inputs to the Orchestrator.
- `ToolRegistry.ts` - Catalog connecting functional abilities to AI prompt endpoints.
- **`clients/`**
  - `ModelClient.ts` - Raw HTTP fetch logic executing Ollama, Kimi, Hugging Face, and Gemini calls. Hardcoded with **60-minute wait boundaries** and rattelimit interceptors.
- **`config/`**
  - `SovereignConfig.ts` - Loads ENV properties, endpoints, default temperatures, and base paths.
- **`routing/`**
  - `TernaryRouter.ts` - AI triage classifier. Determines task complexity (`Yang`, `Yin`, `Orchestrator`). This manages the **61-minute hard failover loops** between Ollama & HuggingFace Kimi.
- **`state/`**
  - `StateManager.ts` - Stores local memory context throughout ongoing inference sessions.
- **`types/`**
  - `core.ts` - Core Typescript interfaces including the universal `Result` Monad primitive pattern.
- **`ui/`**
  - `Renderer.ts` - Command line interface aesthetics; creates terminal spinners and formatted response logs.
- **`utils/`**
  - `CodeExtractor.ts` / `JsonExtractor.ts` - Regex utility functions for plucking valid code/json from raw AI output strings.

### `src/engines/` (Substrate Limbs)
*Engines represent actual physical/digital capabilities executed by Kimi or Sub-Agents.*
- `MultiModelExecutor.ts` - The brain orchestrating multiple local Ollama sub-agents in parallel on the same compute.
- `OrchestrateEngine.ts` - The primary brain loop directing tools, validating outputs, and running step-by-step logic.
- `ShellLibrary.ts` & `ShellEngine.ts` - Bridging agentic intents into global CLI environments (`git`, `powershell`, `python`, `npm`, `wrangler`). Implements native fallback context if raw actions panic.
- `CodeEngine.ts`, `CompletionEngine.ts`, `GenerateEngine.ts` - Logic generation and code scaffolding models.
- `EmbedEngine.ts` - Deep searching and semantic matching using sqlite embeddings. 
- `SpatialVisionEngine.ts`, `VisionEngine.ts` - For tasks classified as Vision, these handle image/screen parsing.
- `VSCodeEngine.ts` - IDE bridging.
- `WebSearchEngine.ts` - Search API connectors for real time retrieval.
- `TodoEngine.ts` - Simple list parsing and management.
