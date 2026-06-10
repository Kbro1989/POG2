---
name: fetch-to-head
description: Fetch RS3 cache data via UniversalSovereignSynthesizer and pin the results to the HexagramManager head.
---

# 🧠 /fetch-to-head

This skill bridges the **Sovereign Sensory Array** (raw cache extraction) directly to the **Sovereign Head** (HexagramManager). It allows an agent to launder raw binary truth into the AI's active cognitive state, enabling reasoning over specific spatial regions.

## 📡 Sovereign Sensory Array (I/O Map)

The la-Sovereign brain is fed by the following pipeline:
- **In (Raw)**: `UniversalSovereignSynthesizer` $\rightarrow$ Extracts truth from the 11GB Live Cache.
- **In (Logic)**: `rsmv/opdecoder` $\rightarrow$ Decodes binary opcodes into JSON logic.
- **Sovereign Bridge**: `SovereignBridge.ts` $\rightarrow$ Streams real-time telemetry to the 3D head.
- **The Brain**: `HexagramManager` $\rightarrow$ Pins synthesized data into 6 cognitive slots (The Hexagram).
- **Out**: `ModelClient` $\rightarrow$ Translates the current Hexagram state into model temperature, aesthetics, and strategy.

## 🛠 Run: Fetch to Head

This is the programmatic path to update the AI's current context with real-world game data.

### Prerequisites
- **RS3 Cache**: Must be present at `C:\\ProgramData\\Jagex\\RuneScape`.
- **Runtimes**: `tsx` must be installed.

### Agent Execution Path
Run the driver with the target region coordinates (`rx`, `ry`):

```bash
tsx .claude/skills/fetch-to-head/driver.ts <rx> <ry>
```

**Example:**
```bash
tsx .claude/skills/fetch-to-head/driver.ts 50 50
```

### Driver Workflow
1. **Initializes Simulation**: Boots `HexagramManager` in simulation mode to bypass VectorDB requirements.
2. **Synthesizes Region**: Invokes `UniversalSovereignSynthesizer.synthesizeRegion(rx, ry)` to perform a 1:1 clinical extraction.
3. **Pins to Head**:
   - **Line 1 (Foundation)**: Pins the region summary and entity count.
   - **Line 3 (Transition)**: Pins the primary entity of interest found in the region.
   - **Line 6 (Culmination)**: Records the metabolic state of the ingestion.
4. **Outputs State**: Returns the full `formatForPrompt()` output, which the agent should then use as the basis for subsequent reasoning.

## ⚠️ Gotchas
- **Cache Path**: The synthesizer is hard-coded to `C:\\ProgramData\\Jagex\\RuneScape`. If the cache is elsewhere, the driver will fail.
- **Output Directory**: Synthesis writes logic files to `pog-vibe-interactive/files/data/substrate`. Ensure the driver has write permissions to this path.
- **Coordinate Alignment**: Remember that the Sovereign uses a 66x64 padded grid; the driver handles the -1 offset automatically.

## 🔍 Troubleshooting
- **"Could not locate synthesized logic file"**: This usually means the `UniversalSovereignSynthesizer` failed to write to the disk or the relative path to `pog-vibe-interactive` is broken in the current environment. Check the `SovereignSovereignSynthesizer.ts` `OUTPUT_DIR` definition.
- **"Sovereign la-Sovereign brain not initialized"**: Ensure `HexagramManager.initializeSimulation()` is called before `getInstance()`.
