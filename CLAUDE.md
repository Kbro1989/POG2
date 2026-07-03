# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Root project (`package.json` scripts):

- `npm run build` — `tsc` → `dist/` (CLI ships as `dist/cli.js`)
- `npm run dev` — `tsx src/cli.ts` (no build step)
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — `eslint src --ext .ts`
- `npm test` — typecheck + lint (no unit-test runner yet)
- `npm run switchboard` / `npm run bridge` — local infra servers
- `npm run audit` — PowerShell full-tree listing (Windows-only; emits `all_files_audit.txt`)
- `npm run install-global` — build + `npm install -g .` (registers `pog2` on PATH)

One-shot extraction scripts in root: `ingest-reference`, `inspect-cache`, `extract-npc`, `extract-item`, `scan-pog`, `search-npc`, `get-ids`, `get-kinematics`, `get-spotanim`.

Environment: Node ≥20, TypeScript ESNext + `nodenext` resolution. Toolchain builds are deterministic; the only constraint is GPU VRAM for inference (see VRAM Reality below).

## High-Level Architecture

POG2 is a **sovereign, hybrid local+cloud AI runtime** for OpenRSC (RuneScape Classic) forensic analysis and world-state reconstruction. Five layers, each readable independently:

1. **Core cognition** (`src/core/`): `HexagramDefinitions` (I Ching semantic pinning), `CognitiveImmunologyEmergency` (prompt-injection scan), `SovereignAvatar` (identity state machine), `SovereignPathResolver` (D-drive authority).
2. **Routing** (`src/routing/`): `TernaryRouter.ts` (Yang/YinYang/Yin complexity paths — see Sovereign Laws), `HexagramManager.ts` (8x8 I Ching state matrix), `DomainLocker.ts` (PASS/WAIT cross-domain gate — `dispatchCheck(toolName): DispatchVerdict`).
3. **AI dispatch** (`src/api/ai/`): `ModelRolodex.ts` (living model catalog with reputation + latency), `Dispatcher.ts` (Local → Enriched → Cloud), `CapabilityRegistry.ts`, `OverflowShim.ts` (VRAM-aware fallback selector — shells out to Python).
4. **Engines** (`src/engines/`): `OrchestrateEngine.ts` is the brain; spawns specialized engines (`CodeEngine`, `GenerateEngine`, `DiscoveryEngine`, `SovereignIngestionEngine`, `VisionEngine`, `BlenderRenderer`).
5. **Limbs** (`src/limbs/`): The cognitive "organs". `NeuralLimb.ts` is the base class. Specializations split across `core/`, `metaphysical/` (Ghost/Quantum/Omega), `creative/` (Gutenberg/Storyboard/Voice), `spatial/` (walkability, collision, cache forensics), `technical/` (AI, pedagogy, validation), `logical/`, `pedagogy/`, `gameplay/`.

Entry points: `src/cli.ts` (CLI bootstrap) → `OrchestrateEngine.run()`. Server side: `src/durable-objects/POG2WorldDO.ts` (Cloudflare DO holding world state) → `rsmv_inspector/` (Three.js viewer at `rsmv_inspector/src/viewer/`).

## Sovereign Laws (enforced invariants)

These are non-negotiable; do not propose changes that violate them:

1. **NO MOCKS / NO PLACEHOLDERS** — Real APIs only. No `jest.fn()`, no `throw new Error('not implemented')`. Real network calls, real `existsSync()` before reads.
2. **Ternary routing** — Every task classifies into Yang (deep, ≥4 complexity), YinYang (mid, 1–3), or Yin (reflex, <1). Defined in `RoutingComplexity` enum; consumed by `TernaryRouter.classify()`.
3. **The 61-Minute Law** — `TernaryRouter.COOLDOWN_DURATION_MS = 61 * 60 * 1000` (`src/routing/TernaryRouter.ts:109`). When local Ollama compute starves and we fall back to HuggingFace, a strict 61-minute cooldown must elapse before attempting to route back to local.
4. **Ghost Normalization** — High-stakes outputs pass through `GhostLimb` (local Ollama fallback) to prevent model drift.
5. **Cognitive Immunology** — `CognitiveImmunologyEmergency` scans every tool execution pre-flight for prompt injection / foreign directives. High/critical threats → block.
6. **Source of Truth** — `public/authentic_spawn_manifest.json` and `public/grounding_manifest.json` override memory or cache. Defined in `hermes-agent/config/sovereign_rules.yaml`.

## VRAM Reality (2026-06-20)

The runtime environment constrains model selection:

- **GPU**: NVIDIA RTX A1000 Laptop, **6144 MiB** total VRAM (6 GB).
- **Installed Ollama models** (only two): `qwen2.5-coder:7b-instruct-q4_K_M` (4.7 GB) and `gemma4:latest` (9.6 GB).
- **`gemma4:latest` doesn't fit 6 GB** — Ollama does partial CPU offload, which silently degrades latency. The "61-Minute Law" was originally for cloud cooldowns; the equivalent hardware cooldown (drop ctx or switch models) lives in `pog2/inference/overflow.py` and is invoked from `src/api/ai/OverflowShim.ts`.
- Tier config is in `.env.ollama` (`POG2_VRAM_TIER=auto`, `mini=6GB`, `puppeteer=16GB`, `pro=24GB`, `cpu=no-GPU`). `auto` reads `nvidia-smi` at probe time.
- Yang/YinYang/Orchestrator call sites in `TernaryRouter.ts` (lines ~600, 615) now use `findWorkingModelAsync` which asks OverflowShim first; the original synchronous `findWorkingModel` is preserved for the 4+ other call sites that don't need VRAM awareness.

**Don't pull new models without checking** — Ollama already half-spills gemma4 onto CPU. Adding a 14B model with full GPU offload will OOM. The tier math is in `pog2/inference/overflow.py::compute_fit()`.

## Ollama Storage Path (currently broken)

Three locations claim to be the ollama model root, **none are currently correct**:

- `.env` line 29: `OLLAMA_MODELS_PATH=C:\Users\krist\ollama-models` — **path does not exist**
- `.env.example` line 28: `OLLAMA_MODELS_PATH=D:\ollama-models` — **different dead path**
- `~/.ollama` symlink (`/mnt/c/Users/krist/.ollama → /mnt/d/Ollama`) — **symlink target is gone** (`/mnt/d/` not mounted)

Models actually live at **`/usr/share/ollama/.ollama/models/blobs/`** (the Linux/WSL ollama service default; running as user `ollama` via `/etc/systemd/system/ollama.service`). The server is reachable at `http://localhost:11434` (host `0.0.0.0:11434`). **Fix the `.env` paths and the broken symlink before assuming `ollama list` ↔ disk layout parity.**

## Hermes ↔ POG2 Integration

Hermes (`hermes-agent/`) is a vendored Python agent framework; POG2 is its TypeScript sovereign substrate. They handshake via **non-direct contact surfaces** — neither process imports the other; they share state through files + MCP. Real wiring:

- **`hermes-agent/config/sovereign_rules.yaml`** is loaded by `hermes_cli/sovereign_rules_loader.py::load_sovereign_rules()` at Hermes boot. It now has a `pog2_integration:` block (root_of_trust, inference, skill_activation, escape_hatch, audit) that Hermes reads to honor POG2 sovereignty.
- **`hermes-agent/config/mcporter.json`** registers POG2 as a discoverable MCP server: `pog2-sovereign` (stdio → `../../dist/mcpserver.js` from the `hermes-agent/config` cwd). Hermes boots POG2 on demand; POG2's MCP server exposes `HexagramManager + TernaryRouter + OrchestrateEngine + ToolRegistry` as MCP tools.
- **`src/sovereign/Pog2Integration.ts`** loads the same YAML (mirror of the Python loader) and **`src/sovereign/Pog2HexagramBridge.ts`** resolves `resolvePermission(skillId, intent, userOverride) → 'ALLOW' | 'WAIT' | 'BLOCK'` by composing `DomainLocker.dispatchCheck()` + `HexagramManager.decide()` + the YAML's `skill_activation` clause.
- **`src/config/SovereignConfig.ts`** boots the bridge during `loadConfig()` and logs `"POG2 sovereignty: bridge active"` on success.

The two systems stay physically separate. A **sovereign MCP server** (POG2) and a **sovereign MCP client** (Hermes) handshake through YAML + stdio; no shared process, no shared filesystem mounts beyond `hermes-agent/config/`.

## Configuration Surface

Config is loaded in this priority order (last wins): `DEFAULT_CONFIG` → `.env` → `.env.local` → `.env.ollama` → process env → user JSON file passed to `loadConfig(path)`. Defined in `src/config/SovereignConfig.ts`.

- **`.env`** (root) — Cloudflare/HF/Google secrets, sovereign anchor paths, YouTube creds.
- **`.env.ollama`** — Per-tier Ollama model + ctx assignment (THINK/CODE_HEAVY/CODE_MID/CODE_FAST/FAST/VISION). **Reality-checked against `ollama list`**.
- **`.env.local`** — local-only overrides (gitignored).
- **`POG2_SOVEREIGN_RULES`** env var — path to the sovereign_rules YAML; consumed by both Python and TS loaders.
- **`POG2_VRAM_TIER`** / **`POG2_PYTHON`** / **`POG2_OVERFLOW_DEBUG`** — read by `pog2/inference/overflow.py` via `OverflowShim.ts`.

## File Layout Reference

- `src/cli.ts` — entry point
- `src/engines/OrchestrateEngine.ts` — central orchestration
- `src/routing/TernaryRouter.ts` — the routing brain (cooldowns, fallbacks, ternary complexity)
- `src/api/ai/ModelRolodex.ts` — living model catalog
- `src/api/ai/OverflowShim.ts` — VRAM-aware fallback (Python-backed)
- `src/sovereign/Pog2HexagramBridge.ts` — YAML-driven permission resolver
- `src/limbs/metaphysical/GhostLimb.ts` — local-ollama normalization fallback
- `pog2/inference/overflow.py` — VRAM tier math + CLI (`python3 -m pog2.inference.overflow {probe,check,pick}`)
- `hermes-agent/hermes_cli/main.py` — Hermes CLI entry (loads sovereign_rules)
- `hermes-agent/config/sovereign_rules.yaml` — shared sovereignty contract
- `hermes-agent/config/mcporter.json` — registers POG2 as MCP server
- `rsmv_inspector/src/viewer/` — Three.js viewer
- `rsmv_inspector/opcodes/` — extracted opcode truth files
- `data/pvme/` — high-fidelity boss logic
- `public/` — authoritative anchor (manifests + vocabulary)
- `.claude/`, `.agents/` — agent rules + workflows for this repo

## Common Mistakes to Avoid

- **Don't reimplement VRAM math in TS** — call `OverflowShim.pick()`. The Python shim is calibrated against real ollama output (Q4_K_M multiplier is 0.36×, not 0.70× as the obvious table says).
- **Don't bypass DomainLocker** — `DomainLocker.dispatchCheck()` is the only sanctioned PASS/WAIT gate. New tools must register a domain mapping before they'll route.
- **Don't add to `dist/`** — it's build output. Source lives in `src/`.
- **Don't pull new Ollama models speculatively** — see VRAM Reality. The shim is *prepared* for them but won't auto-pull.
- **Don't read `.ollama` symlink literally** — it's a broken legacy link. Real storage is at `/usr/share/ollama/.ollama/models/`.
- **Don't assume `src/rsmv/` exists** — those scripts moved to `rsmv_inspector/` and root-level `*_extract.ts` files.
