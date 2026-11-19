# POG2 — Sovereign Intelligence Platform

> **Ternary Routing · Binary Absolutes · NO MOCKS · Real Implementations**

**POG2 (Pick of Gods)** is a sovereign, multi-limb computational intelligence platform built around local-first inference, distributed orchestration, semantic memory, adaptive routing, and direct substrate interaction.

The architecture combines command-line intelligence, AI orchestration, creative pipelines, code generation, semantic indexing, spatial intelligence, and distributed services into an interconnected technological ecosystem.

- **Architecture:** Multi-limb distributed pipeline
- **Primary implementation:** TypeScript / HTML
- **Infrastructure:** Local execution, Cloudflare, and external model providers
- **Routing:** Ternary decision architecture
- **Development philosophy:** Sovereignty, reproducibility, and real implementations

---

# Part I — POG2-CLI

## Sovereign Command Line Intelligence

POG2-CLI provides the command-line interface to the POG2 intelligence architecture.

It supports task orchestration, model selection, code generation, semantic analysis, vector indexing, completion, and direct system operations.

## Installation

Clone and install globally:

```bash
git clone <repo>
cd POG2-cli
npm install
npm run install-global
```

Alternatively, install through npm:

```bash
npm install -g pog2-cli
```

## System Requirements

- **Storage:** Approximately 2TB of dedicated high-speed storage is required for full-scale operations, including audiobook generation, video assembly, and asset caching.
- **Buffer:** An additional 1TB+ buffer zone is highly recommended to prevent neurological substrate fragmentation.

These are the supplied full-scale capacity targets, not minimum installation requirements.

## Configuration

On first run, configuration is bootstrapped at:

`~/.POG2-cli/config.json`

Configure the primary cloud API key:

```bash
# Set your primary cloud API key (HuggingFace / Kimi)
pog2 config set primaryCloudApiKey YOUR_KEY

# Or through the environment
export PRIMARY_CLOUD_API_KEY=YOUR_KEY

# Inspect current configuration
pog2 config get

# Override models
pog2 config set planningModel kimi-k2.6:cloud
pog2 config set codingModel qwen2.5-coder:14b-instruct-q5_K_M
```

**Model-version compatibility note:** Earlier documentation specifies `kimi-k2.5:cloud`; subsequent revisions specify `kimi-k2.6:cloud`. Confirm the installed provider/model identifier before deployment.

## Routing: Ternary Logic

The TernaryRouter classifies tasks into three routing tiers:

| Tier | Score | Model | Use case |
|---|---:|---|---|
| **Yang** | ≥4 | Cloud (Kimi K2.5/K2.6) | Architecture, complex refactors |
| **YinYang** | 1–3 | Flash / Strong Local | Feature implementation, review |
| **Yin** | <1 | Local (Ollama) | Explanations, formatting |

The routing architecture balances computational complexity, model capability, resource availability, and sovereignty.

## Command Reference

### `pog2 process` — Orchestration

Kimi-led task orchestration and tool selection.

```bash
# Initialize a high-performance web project
pog2 process "Initialize a new web project with a focus on high performance"

# Analyze a screenshot
pog2 process "Analyze the screenshot at ./ui.png and suggest fixes"

# Execute system operations
pog2 process "Clean up all .log files in the current directory"
```

### Engine Namespace

| Engine namespace | Role | Responsibility |
|---|---|---|
| **Orchestrate** | Brain | Kimi-led decision mapping and selection across 65+ registered tools |
| **Creative** | Cinema | Cinematic Mode: gapless 1→2→3 sequential storyboarding and video assembly |
| **Forge** | Creator | Recursive file scaffolding, codebase generation, and adversarial validation |
| **Code / Analyser** | Judge | Semantic diffs, automated bug fixing, and multi-pass architectural reviews |
| **Sovereign Shell** | Executor | Direct substrate interaction (FFmpeg, Git, NPM, Wrangler) with zero mocks |
| **Memory / Nexus** | Storage | Ternary memory loops: long-term vector indexing versus short-term proprioception |

## Configuration & Sovereignty

POG2 carries approximately **56 fine-tuned settings** for metabolic control, model tiering, and failover logic.

```bash
# Audit the current sovereign state
pog2 system status
pog2 system audit

# Adjust metabolic intensity
# 0: OldYang
# 1: YoungYin
# 2: YoungYang
# 3: OldYin

pog2 config set contextWindow 32768
pog2 config set temperature 0.9
```

The four metabolic states are a separate configuration dimension from the three task-routing tiers.

## Creative Directive: Cinematic Mode

The Sovereign Directive enables full-book cinematic generation from the 70,000+ Gutenberg-title collection.

The pipeline uses sequential scene processing, storyboarding, voice, soundtrack, and video assembly.

```bash
# Run the gapless sequential pipeline
pog2 pipeline run 26184 --scenes all --personality "clinical"
```

## Code Generation — `pog2 gen`

```bash
# Generate from scratch
pog2 gen code "Create a rate limiter with token bucket algorithm" -l ts

# Improve an existing file
pog2 gen code "Add proper error handling" --file src/api.ts --improve

# Adversarial three-pass validation
pog2 gen code "Implement OAuth2 flow" --adversarial

# Generate JSDoc
pog2 gen doc src/MyService.ts

# Generate real, no-mock tests
pog2 gen test src/MyService.ts -o src/MyService.test.ts

# Refactor to sovereign standards
pog2 gen refactor src/legacy.ts
```

## Code Analysis & Transformation — `pog2 code`

```bash
# Adversarial code review
pog2 code review src/Orchestrator.ts --strict

# Deep semantic explanation
pog2 code explain src/Router.ts

# Explain a specific section
pog2 code explain src/Router.ts --section 45:120

# Autonomous TypeScript/lint repair
pog2 code fix src/broken.ts

# Preview changes without applying them
pog2 code fix src/broken.ts --dry-run

# Semantic diff
pog2 code diff old/Service.ts new/Service.ts
```

## Semantic Indexing — `pog2 embed`

Local vector indexing and semantic search.

Default database:

`~/.POG2-cli/embeddings.db`

```bash
# Index a directory
pog2 embed index ./src --project my-project

# Semantic search
pog2 embed search "ternary routing decision logic" --project my-project -k 5

# Compare file similarity
pog2 embed similarity src/RouterA.ts src/RouterB.ts
```

## Code Completion — `pog2 complete`

```bash
# Completion at cursor position (line 42, column 16)
pog2 complete cursor src/engine.ts 42 16 --count 3

# Fill TODO/stub implementations
pog2 complete fill src/incomplete.ts

# Preview completion
pog2 complete fill src/incomplete.ts --dry-run

# Continue an incomplete file
pog2 complete continue src/partial.ts --lines 100
```

## System Status — `pog2 status`

```bash
pog2 status
```

Displays active mode, workspace, session metrics, and configured models.

## Sovereign Laws

These principles define the intended standards for generated output:

1. **NO MOCKS** — Real APIs only. No `jest.fn()`, no fake data.
2. **NO PLACEHOLDERS** — No TODOs, stubs, or `throw new Error('not implemented')`.
3. **OPTIMAL CHOICES** — No `any` types, readonly by default, `Result<T>` for fallible operations.
4. **REALITY CHECK** — `existsSync()` before reading files; explicit error paths everywhere.

## Local Models — Ollama

POG2-CLI automatically detects available Ollama models and routes tasks appropriately.

Recommended local models:

```bash
# Yin / YinYang tier
ollama pull qwen2.5-coder:7b-instruct-q4_K_M

# YinYang tier
ollama pull qwen2.5-coder:14b

# Embeddings
ollama pull qwen3-embedding:latest
```

## POG2-CLI Project Structure

```text
src/
├── cli.ts                          # Entry point, Commander program
├── ToolRegistry.ts                 # 65+ registered tools
├── api/ai/                         # AI dispatching & model registries
├── clients/ModelClient.ts          # Unified model client (Ollama, Cloud, CF)
├── config/SovereignConfig.ts       # ~56 configurable settings
├── constants/                      # AnatomyRegistry, KineticRegistry, ModelRegistry
├── core/                           # models.ts, HexagramDefinitions, TaskClassifier
├── engines/                        # OrchestrateEngine, PipelineController, CodeEngine, etc.
├── limbs/
│   ├── core/NeuralLimb.ts          # Base limb abstraction
│   ├── creative/                   # Gutenberg, Storyboard, Voice, Soundtrack, VideoAssembler
│   ├── discovery/SearchLimb.ts     # Web search
│   ├── metaphysical/               # Ghost, Quantum, Omega, Relic
│   ├── spatial/                    # BioIntelligence, Chroma, RSC, WebSensory
│   └── technical/                  # AI, ControlPlane, Entity, Environment
├── monitor/                        # NodeTester, PulseMonitor, SwitchboardLimb
├── routing/                        # TernaryRouter, HexagramManager, DomainLocker
├── state/                          # StateManager, NeurologicalMap
├── types/                          # SovereignDomain, pipeline types
├── ui/Renderer.ts                  # CLI output formatting
└── utils/                          # VectorDB, PathNormalizer, TrainingCollector, etc.
```

---

# Part II — POG2 Sovereign Platform

## Distributed Multi-Limb Architecture

The **POG2 Sovereign Platform** is the main orchestration hub for the 27-limb distributed pipeline.

The root repository contains architectural documentation, cache forensics tooling, and the platform manifest.

The platform extends beyond the CLI, encompassing distributed execution, specialized intelligence limbs, system monitoring, external integrations, and persistent knowledge structures.

## Key Documentation

| File | Purpose |
|---|---|
| `ARCHITECTURE.md` | System architecture overview |
| `CODEBASE_MAP.md` | Full codebase map (29KB) |
| `OrchestrateEngine.md` | Orchestration engine specification (237KB) |
| `SOVEREIGN_THESIS.md` | Sovereign Stack design thesis |
| `EXTERIOR_HANDSHAKES.md` | External system integration contracts |
| `SECURITY_CHAIN.md` | Zero-trust security chain |
| `POG2_KNOWLEDGEBASE.md` | Platform knowledge base |
| `NEUROLOGICAL_MAP.md` | Limb/neuron topology map |

## Cache Forensics Tooling

Root-level TypeScript tools provide extraction and analysis of RuneScape 3 cache structures.

| Tool | Purpose |
|---|---|
| `cache_item_forensics.ts` | RS3 item cache extraction and analysis |
| `cache_npc_forensics.ts` | RS3 NPC cache extraction |
| `cache_quest_forensics.ts` | Quest data extraction from RS3 cache |
| `cache_equipment_mapper.ts` | Equipment cache mapping |
| `cache_name_search.ts` | Cache entity name search |
| `cache_enum_scanner.ts` | Opcode enum discovery |

## Platform Directory Structure

```text
atlas/          # World spatial data
cache/          # Cache ingestion outputs
data/           # Platform data files
diagnostic/     # Diagnostic outputs
generated/      # Build artifacts
mediator/       # Mediator service
memory/         # Memory/knowledge store
src/            # Main source
```

## Platform Scale & Architecture

| Metric | Documented value |
|---|---:|
| Distributed limbs | 27 |
| Registered tools (CLI namespace) | 65+ |
| Platform tools | 89 |
| Model Rolodex | 389 |
| Circuit-breaker fallback | 4 tiers |
| RS3 cache entities | 229,000 |
| NPCs | 32,512 |
| Items | 59,984 |
| Objects | 136,000 |

The platform's documented cache population comprises:

- 32,512 NPCs
- 59,984 items
- Approximately 136,000 objects

Total: approximately 229,000 cache entities.

These metrics describe different architectural scopes and should not be collapsed into a single tool or model count.

## Platform Configuration

Configuration artifacts include:

```text
.metabolic-whitelist.json
.pog2-config.json.example
POG2-mcp.json
```

These support platform configuration, metabolic controls, and MCP integration.

---

# Part III — Architectural Principles

## Sovereignty

POG2 is designed around control of its execution environment, model selection, memory, and external interfaces.

The local-first architecture uses Ollama for local inference, with cloud providers available as higher-capability resources when routing requirements justify them.

## Ternary Decision Architecture

The three routing states provide a decision framework:

- **Yin:** Local, lightweight, resource-conscious execution.
- **YinYang:** Intermediate execution and adaptive model selection.
- **Yang:** Higher-capability cloud execution.

Binary absolutes govern implementation standards, while ternary logic governs task classification and routing.

## Multi-Limb Intelligence

The limb architecture separates capabilities into specialized subsystems rather than treating every operation as one monolithic model interaction.

The documented subsystems include:

- Creative intelligence
- Technical intelligence
- Spatial intelligence
- Metaphysical intelligence
- Discovery and search
- Memory and semantic indexing
- Orchestration and execution
- Monitoring and control

## Memory & Nexus

Memory/Nexus provides the conceptual separation between:

- Long-term vector indexing.
- Short-term proprioception.
- Persistent knowledge structures.
- State and neurological mapping.

## Direct Substrate Interaction

The Sovereign Shell provides direct access to execution substrates and external tools, including:

- FFmpeg
- Git
- NPM
- Wrangler

The intended standard is real execution rather than simulated tool responses.

---

# Development Philosophy

POG2 follows four core implementation requirements:

1. Real implementations over demonstrations.
2. Explicit error handling over silent failure.
3. Local sovereignty with cloud capability when needed.
4. Interconnected systems over isolated applications.

**NO MOCKS. NO PLACEHOLDERS. NO SILENT SUBSTITUTIONS.**

The objective is an extensible intelligence ecosystem in which specialized components share state, exchange information, and contribute to a larger orchestration architecture.
