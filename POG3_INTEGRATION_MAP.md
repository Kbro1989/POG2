# POG3 Integration Map

Merged project surface: `king wen | openjarvis | open-design | megatron-lm | chromanumber | kimi.exe | voicebox`.
Jarvis is the current host. King Wen is the deterministic cognition layer; Voicebox is the emotional quantum collapse/expansion voice module; Megatron is the training substrate.
All paths below are exact. Unknowns are marked `EXACT PATH GAP` instead of invented.

## 1. King Wen Quantum Conscious

- Source of truth: `C:\Users\krist\Desktop\KING-WEN-I-CHING-IMMUTABLE-TABLES` (`king-wen-quantum-conscious`, read-only)
- Live worker: `https://kingwen-oracle.kristain33rs.workers.dev`
- Local expand server: `http://127.0.0.1:8765/expand` (if running)
- OpenJarvis ingest:
  - emotion: `C:\Users\krist\Desktop\OpenJarvis\src\openjarvis\emotion\kingwen.py`
  - CLI consult: `C:\Users\krist\Desktop\OpenJarvis\src\openjarvis\cli\_oracle_speak.py`
- Emission contract:
  - `hexagram_id`
  - `ternary_str`
  - `phase_temporal`
  - `porosity` (0..1)
  - `yao` labels: `young/old/present` for yin/yao/yang
  - `emotional_deltas`
  - `inject_site`
  - `consensus_vector` (5-axis)
  - `emotional_input` slider
- Dependency rule: do not ingest expanded 64 sparse states for downstream training. Use collapsed 512 resolved states from `collapse_full_128(emotional_input)`.

## 2. OpenJarvis

- Root: `C:\Users\krist\Desktop\OpenJarvis`
- Root contents confirmed:
  - directories: `.git`, `.github`, `.hermes`, `.openjarvis`, `.pytest_cache`, `.venv`, `~`, `assets`, `cloudflare`, `configs`, `data`, `deploy`, `desktop`, `docs`, `emotion`, `examples`, `frontend`, `MagicMock`, `rust`, `scratch`, `scripts`, `skills`, `src`, `tests`, `tools`
  - files: `.gitignore`, `.pre-commit-config.yaml`, `CHANGELOG.md`, `CODE_OF_CONDUCT.md`, `consult-capture.body`, `consult-capture.headers`, `CONTRIBUTING.md`, `gen_expansion.py`, `jarvis-capture-returns.json`, `jarvis-system-avatar-research.md`, `king_wen_codebasemap.md`, `LICENSE`, `Makefile`, `membrane-path.html`, `mkdocs.yml`, `ollama_docs_complete_tree.txt`, `ollama_launch_specs.txt`, `ollama_multi_service_routing_guide.txt`, `openjarvis_windows_already_installed.txt`, `pyproject.toml`, `README.md`, `REVIEW.md`, `test_store.py`, `tmp_kingwen_debug_console.py`, `tmp_kingwen_smoke_agent_tails.py`, `tmp_kingwen_tail_probe.py`, `uv.lock`, `verify_oracle_worker.py`
- Baseline reference: `C:\Users\krist\Desktop\OpenJarvas` (docs/audit sidecar only)
- Audited baseline: `C:\Users\krist\Desktop\OpenJarvas-original`
- Key surfaces:
  - emotion: `src/openjarvis/emotion/kingwen.py`
  - voice adapter: `src/openjarvis/speech/cartesia_adapter.py`
  - dual-path TTS: `src/openjarvis/speech/cartesia_tts.py`
  - oracle CLI: `src/openjarvis/cli/_oracle_speak.py`
  - dashboard CLI: `src/openjarvis/cli/_oracle_dashboard.py`
  - audio DSP: `src/openjarvis/cli/audio_dsp.py`
  - persona/system prompt: `src/openjarvis/core/env_integration.py`
- Deployment:
  - `deploy/` contains Docker/runtime artifacts
  - `cloudflare/` contains Worker/runtime bindings
  - `frontend/` contains web/Electron surfaces
- Reception contract:
  - `KINGWEN_VOICE_COMPLETE` event includes `compliance`, `porosity`, `vector_truth`, `dsp_fidelity`, `voice_id`, `session_id`
  - Sidecar persists scalar score to `kingwen_voice_rewards` in TraceStore SQLite
  - Chat/do router in `_oracle_speak.py` returns scenes with `voiceWeight/coherence/chaos/whimsy/darkTone`

## 3. Open Design

- Working tree: `C:\Users\krist\Desktop\open-design`
- Stack: pnpm monorepo, Next.js 16 web app, Electron desktop shell, local daemon
- Runtime options:
  - Docker Desktop: `C:\Program Files\Docker\Docker\Docker Desktop.exe`
  - Native: `windows-native-runtime` / `windows-local-server-proxy`
  - Daemon bridge: Hermes <-> Open Design via `open-design-bridge` skill
- Known issue: corepack enable can fail with EPERM under Program Files on this host; prefer workspace-local pnpm or absolute Docker CLI path.

## 4. Megatron-LM

- Review/fork: `C:\Users\krist\Desktop\Megatron-LM-review`
- Current training data: `C:\Users\krist\Desktop\Megatron-LM-review\kingwen_train_data`
- CPU probe path verified on this host with WSL `.venv` containing `torch==cpu`
- Contracts:
  - dataset: `runtime/kingwen_dataset.py` (not yet present)
  - labels: porosity-weighted `sample_weight`
  - capture stream: pre/post slider
  - ingestion: ternary interaction records from 512 resolved states
- Dependency rule: no fabricate/copy of training data. All samples must trace to real `collapse_full_128` outputs or worker `/consult` payloads.

## 5. ChromaNumber

- Root: `/c/Users/krist/Desktop/Color-by-number-main/Color-by-number-main`
- Stack: React + Vite + Cloudflare Workers + D1/InstantDB/OpenAuth templates
- Deployed endpoints:
  - API worker: `chromanumber-api/src/index.ts`
  - Auth worker: `chromanumber-auth/src/index.ts`
  - Realtime worker: `chromanumber-realtime/src/server/index.ts`
- Key surfaces for POG3 borrowing:
  - image processing: `services/imageProcessor.ts` — K-Means quantization, flood-fill connected components, small-region merge, border detection, spatial indexing for region hit-tests
  - types: `types.ts` — `PaletteColor`, `Region`, `ProcessedImage`, `ToolConfig`
  - theme engine: `utils/colorThemes.ts` — RGB/HSL conversion, theme mutations
  - AI service: `chromanumber-api/src/services/AIService.ts` — Workers AI primary path with Gemini fallback
  - frontend canvas: `components/ColoringCanvas.tsx` — layer caching, delta fill updates, zoom/pan, spatial grid culling
- POG3 role: eyes. Borrow surfaces for AI vision, color parsing, line-segment map/key, and color tools.
- Borrow contract for POG3 modules:
  - Do not import the whole app; extract only `imageProcessor.ts` and `types.ts` into target repo.
  - Replace `ImageData`/canvas dependencies with programmatic equivalents when integrating into non-browser runtimes.
  - Preserve deterministic region IDs; they map to inject sites.

## 6. Kimi.exe / Kimi Relay

- CLI: `C:\Users\krist\.kimi-code\bin\kimi.exe`
- Config: `C:\Users\krist\.kimi-code\config.toml`
- Auth: device-code `/login OAuth` or provider `api_key/base_url`
- Live relay worker: `https://kimi-relay-host.kristain33rs.workers.dev`
  - Bindings: `KIMI_SESSION` DO, `KIMI_CACHE` KV `c39fc2ed3ced4b988224861476ca8def`, `KIMI_HISTORY` D1 `kimi-relay-history`, `KIMI_ASSETS` R2
- Current blocker: Kimi Code `/coding/v1` returns 401 with current credentials. Cloudflare AI `/chat` is primary; Kimi wrapper is fallback-only.
- Local frontend: http://localhost:8080/KIMI-modified.html

## 7. Voicebox

- Repo: `pick-of-gods/voicebox`
- Local copy: `C:\Users\krist\Desktop\open-design\voicebox\`
- Role in POG3: emotional quantum collapse and expansion module per thought, receiving deterministic King Wen state and emitting voice artifacts.
- Emission contract from Voicebox:
  - `voice_id`
  - `backend`
  - `model`
  - `audio` bytes
  - `audit`
  - `compliance` gate result
  - `violations` list
- Reception contract into Voicebox:
  - vector: `voiceWeight, coherence, chaos, whimsy, darkTone`
  - `porosity`
  - `trajectory`
  - `agree_temporal`
  - `text`

## Cross-System Data Contracts

### Deterministic thought flow

```
King Wen immutable tables
    -> collapse_full_128(emotional_input)
    -> OpenJarvis consult payload
    -> Voicebox emotional collapse/expansion
    -> Cartesia / OpenAI / local TTS
    -> OpenJarvis KINGWEN_VOICE_COMPLETE
    -> TraceStore sidecar
    -> Open Design dashboard/Electron shell
    -> Megatron training corpus
```

### Voice vector flow

- Internal: continuous 5-axis vector
- API boundary: discrete tags only
- Speed: `base_speed=0.0` Cartesia, formula `trajectory_delta + emotional_velocity * 0.1`
- Compliance: pre-DSP gate enforces `X-Kingwen-Compliance=compliant|reject`

### Training corpus flow

- Source: real collapse output / worker `/consult` payloads / `collapse_full_128_output.json`
- Shape: pre-slider 64 hexagrams + post-slider 512 resolved states + yao vocabulary + porosity
- Storage: `C:\Users\krist\Desktop\Megatron-LM-review\kingwen_train_data`
- Kanban: isolated artifact schema drives automated training, smoke tests, and bypass derivation

## Known Gaps

- Chromanumber exact source path
- Voicebox repo version/branch alignment with deterministic input schema
- Megatron runtime `runtime/kingwen_dataset.py` not yet present
- Local expand server process state on this host; worker `/consult` is the current deterministic path
