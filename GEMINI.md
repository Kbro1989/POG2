# GEMINI.md — POG2 Sovereign Command Line Intelligence

## Project Overview

POG2 is a highly sophisticated "Sovereign Command Line Intelligence" system designed with a biological nervous system architecture. It operates as an interactive CLI agent that brings the power of Gemini (and other models) directly into the terminal, specialized for software engineering, reverse engineering (specifically RS3 game cache), and autonomous content generation.

### Core Architecture: DOC (Distributed Orchestration Cognition)

- **Biological Inspiration:** Organized into **Limbs** (executors) and **Engines** (processing centers).
- **Ternary Routing:** Tasks are classified into three tiers (Yang, YinYang, Yin) and routed to appropriate models (Cloud vs. Local).
- **Binary Absolutes:** Enforces strict success/failure states.
- **Sovereign Laws:**
  1. **NO MOCKS:** Real APIs and implementations only.
  2. **NO PLACEHOLDERS:** No TODOs or stubs in generated code.
  3. **TSC TIGHT:** Strict TypeScript compliance.
  4. **CLINICAL LOGGING:** All cognitive states are traceable.

### Key Components

- **OrchestrateEngine:** The "Brain" (Kimi-led) that maps decisions across 65+ registered tools.
- **Limb System:** Categorized into spatial, technical, creative, metaphysical, and sensory domains.
- **rsmv Substrate:** A deep integration for RS3 game cache forensics, decoding, and 3D visualization.
- **Cinematic Pipeline:** Autonomous story-to-media generation (storyboard -> image -> voice -> video).

## Building and Running

### Installation

```bash
npm install
npm run build
npm run install-global # To use 'pog2' command globally
```

### Key Commands

- `pog2 process "task"`: Execute a task managed by the Orchestrator.
- `pog2 system status`: Audit the current sovereign state and model routing.
- `pog2 system health`: Deep clinical audit of all neurological nodes.
- `pog2 atlas hud <id>`: Decompile and audit a game interface.
- `pog2 pipeline run <bookId>`: Run the autonomous cinematic generation pipeline.
- `pog2 rsmv --view <modelId>`: View a 3D model from the cache.

### Development Scripts (package.json)

- `npm run build`: Compile TypeScript.
- `npm run dev`: Run CLI in development mode using `tsx`.
- `npm run typecheck`: Strict type checking with `tsc`.
- `npm run lint`: Linting with ESLint.

## Development Conventions

### Coding Standards

- **Strict Typing:** Always use explicit types; avoid `any`.
- **Readonly by Default:** Prefer immutability.
- **Result Type:** Use `Result<T>` for fallible operations to ensure explicit error handling.
- **Clinical Logging:** Use the `pino` logger for all internal states.

### Architectural Rules

- **Domain Isolation:** Follow the domain-scoped tool access defined in `ToolRegistry.ts`.
- **Hexagram Manager:** All high-level decisions must be routed through `HexagramManager.ts` to maintain archetypal integrity.
- **Adversarial Reflection:** Use the `GhostLimb` for auditing results and providing adversarial feedback.

### Testing & Validation

- **No Mocks:** Tests must use real implementations and substrates.
- **Empirical Reproduction:** For bugs, always confirm the failure state empirically before applying a fix.
- **Clinical Audit:** Use `pog2 system audit <path>` to check for Sovereign Law violations.

## Workspace Structure

- `src/cli.ts`: Main entry point and command registrations.
- `src/ToolRegistry.ts`: Central hub for all sovereign tools.
- `src/engines/`: Core logic engines (Orchestrate, Code, Embed, etc.).
- `src/limbs/`: Specialized executors (Spatial, Technical, Creative, etc.).
- `src/rsmv/`: RS3 Cache decoding and rsmv integration.
- `src/core/models.ts`: Fundamental type definitions and archetypes.
- `memory/`: Local VectorDB and pedagogical storage.
