---
name: diagnostic_healer
description: Investigates DEGRADED or VETOED system states, retrieves relevant VS Code editor context, and formulates a healing proposal.
---

## Description
This skill acts as a native runner for the Sovereign Head. When the `NodeTester` or `ClinicalAuditTool` flags a biological limb as `DEGRADED`, or the `HexagramManager` encounters a `VETO`, this runner engages. It cross-references the failing node with the active VS Code workspace state to formulate a structural repair plan, handing the diagnosis back to the Head Agent for the Hexagram Gate decision.

## Instructions
1. Run the `diagnostic_runner.ts` script to query `NodeTester` and `VSCodeEngine`.
2. Analyze the combined telemetry (which files are DEGRADED and what the user has open in the editor).
3. Draft a precise algorithmic repair patch (e.g. "Add a `healthCheck()` method returning `{ online: true }` before the final brace of `TernaryRouter.ts`").
4. **DO NOT** edit the files directly. Pass the diagnosis and repair back to the Head Agent so it can log the decision through the Hexagram protocol.
