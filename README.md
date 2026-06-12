# POG2-CLI — Sovereign Command Line Intelligence

> Ternary routing · Binary absolutes · NO MOCKS · Real implementations

## Installation

```bash
# Clone and install globally
git clone <repo>
cd POG2-cli
npm install
npm run install-global
```

Or via npm:
```bash
npm install -g pog2-cli
```

## System Requirements

- **Storage**: ~2TB of dedicated high-speed storage is required for full-scale operations (audiobook generation, video assembly, asset caching).
- **Buffer**: An additional 1TB+ buffer zone is highly recommended to prevent neurological substrate fragmentation.

## Configuration

On first run, a config is bootstrapped at `~/.POG2-cli/config.json`.

```bash
# Set your primary cloud API key (HuggingFace / Kimi)
pog2 config set primaryCloudApiKey YOUR_KEY

# Or via environment
export PRIMARY_CLOUD_API_KEY=YOUR_KEY

# Check current config
pog2 config get

# Override models
pog2 config set planningModel kimi-k2.6:cloud
pog2 config set codingModel qwen2.5-coder:14b-instruct-q5_K_M
```

## Routing: Ternary Logic

The router classifies every task into one of three tiers:

| Tier | Score | Model | Use Case |
|------|-------|-------|----------|
| **Yang** | ≥4 | Cloud (Kimi K2.6) | Architecture, complex refactors |
| **YinYang** | 1–3 | Flash / Strong Local | Feature impl, review |
| **Yin** | <1 | Local (Ollama) | Explanations, formatting |

## Commands

### `pog2 process` — Orchestration (Kimi)

```bash
# Execute a task managed by Kimi (Orchestrator)
pog2 process "Initialize a new web project with a focus on high performance"

# Complex analysis across files
pog2 process "Analyze the screenshot at ./ui.png and suggest fixes"

# System operations via the brain
pog2 process "Clean up all .log files in the current directory"
```

| Engine Namespace | Role | Responsibility |
| :--- | :--- | :--- |
| **Orchestrate** | **Brain** | Kimi-led decision mapping & selection across **65+ registered tools**. |
| **Creative** | **Cinema** | **Cinematic Mode**: Gapless 1->2->3 sequential storyboarding and video assembly. |
| **Forge** | **Creator** | Recursive file scaffolding, codebase generation, and adversarial validation. |
| **Code / Analyser**| **Judge** | Semantic diffs, automated bug fixing, and multi-pass architectural reviews. |
| **Sovereign Shell** | **Executor** | Direct substrate interaction (FFmpeg, Git, NPM, Wrangler) with zero mocks. |
| **Memory / Nexus** | **Storage** | Ternary memory loops: Long-term Vector Indexing vs. Short-term Proprioception. |

## ⚙️ Configuration & Sovereignty

POG2 carries **~56 fine-tuned settings** for metabolic control, model tiering, and failover logic.

```bash
# Audit the current sovereign state
pog2 system status
pog2 system audit

# Adjust metabolic intensity (0: OldYang, 1: YoungYin, 2: YoungYang, 3: OldYin)
pog2 config set contextWindow 32768
pog2 config set temperature 0.9
```

## 🎬 Creative Directive: Cinematic Mode

The "Sovereign Directive" allows for full-book cinematic generation from any of the 70,000+ Gutenberg titles.

```bash
# Run the gapless, sequential pipeline on a manual or novel
pog2 pipeline run 26184 --scenes all --personality "clinical"
```

## Sovereign Laws

```bash
# Generate from scratch
pog2 gen code "Create a rate limiter with token bucket algorithm" -l ts

# Improve existing file
pog2 gen code "Add proper error handling" --file src/api.ts --improve

# With adversarial 3-pass validation
pog2 gen code "Implement OAuth2 flow" --adversarial

# Generate JSDoc for a file
pog2 gen doc src/MyService.ts

# Generate real (no-mock) tests
pog2 gen test src/MyService.ts -o src/MyService.test.ts

# Refactor to sovereign standards
pog2 gen refactor src/legacy.ts
```

### `pog2 code` — Analysis & Transformation

```bash
# Adversarial code review (ternary severity scoring)
pog2 code review src/Orchestrator.ts --strict

# Deep semantic explanation
pog2 code explain src/Router.ts
pog2 code explain src/Router.ts --section 45:120  # specific lines

# Fix TypeScript/lint errors autonomously
pog2 code fix src/broken.ts
pog2 code fix src/broken.ts --dry-run  # preview only

# Semantic diff between two files
pog2 code diff old/Service.ts new/Service.ts
```

### `pog2 embed` — Semantic Indexing & Search

```bash
# Index a directory into local VectorDB (~/.POG2-cli/embeddings.db)
pog2 embed index ./src --project my-project

# Semantic search
pog2 embed search "ternary routing decision logic" --project my-project -k 5

# Similarity between two files
pog2 embed similarity src/RouterA.ts src/RouterB.ts
```

### `pog2 complete` — Code Completion

```bash
# Completion at cursor position (line 42, column 16)
pog2 complete cursor src/engine.ts 42 16 --count 3

# Fill in all TODO/stub implementations
pog2 complete fill src/incomplete.ts
pog2 complete fill src/incomplete.ts --dry-run

# Continue an incomplete file
pog2 complete continue src/partial.ts --lines 100
```

### `pog2 status`

```bash
pog2 status
# Shows active mode, workspace, session metrics, and configured models
```

## Sovereign Laws

These are enforced in every generated output:

1. **NO MOCKS** — Real APIs only. No `jest.fn()`, no fake data
2. **NO PLACEHOLDERS** — No TODO, stubs, or `throw new Error('not implemented')`
3. **OPTIMAL CHOICES** — No `any` types, readonly by default, `Result<T>` for fallible ops
4. **REALITY CHECK** — `existsSync()` before reading files, explicit error paths everywhere

## Local Models (Ollama)

`pog2-cli` automatically detects available Ollama models and routes appropriately:

```bash
# Recommended local models
ollama pull qwen2.5-coder:7b-instruct-q4_K_M  # Yin/YinYang tier
ollama pull qwen2.5-coder:14b                   # YinYang tier
ollama pull qwen3-embedding:latest              # Embeddings
```

## Project Structure

```
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
