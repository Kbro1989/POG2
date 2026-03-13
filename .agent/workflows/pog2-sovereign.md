---
description: POG2 Sovereign Development Workflow
---

# 🚀 POG2 Sovereign Development Workflow

This workflow guides the implementation of new features and logic handlers within the POG2 ecosystem.

## 1. Neurological Mapping 🧬
Before writing code, identify where the new component fits in the `NeurologicalMap.ts`.
- **CNS**: High-level routing, strategy, and orchestration.
- **MEMORY**: Key-value stores, vector databases, context management.
- **SENSORY**: External probes, monitoring, vision, and shell interaction.
- **MOTOR**: Generative output, code application, and renderer operations.

## 2. Clinical Planning 📝
Use the Kimi orchestrator to design the implementation.
- Create an `implementation_plan.md` in the brain.
- Define the `SovereignDomain` (CODE, SYSTEM, VISION, etc.).
- Ensure the decision path follows **Ternary Routing** (Yin/Yang/Yao).

## 3. Real Implementation (NO MOCKS) 🛠️
Implement the logic against real substrates.
- No stubbed APIs.
- Mandatory `Result<T>` pattern for all fallible calls.
- Strict type safety (Zero TSC errors).

## 4. Neurological Auditing 🔬
Every new node MUST be auditable.
- Add a functional probe to `NodeTester.ts`.
- Expose a `healthCheck()` or `ping()` method on the component.
- Verify status via the `/health` command in the POG2 shell.

## 5. Clinical Verification ✅
- Run `npm run build` to verify neurological integrity.
- Verify the feedback loop via the `Renderer`.
- Update the `walkthrough.md` with real-world proof of functionality.

---

*Follow this loop to ensure the survival and evolution of the Sovereign Organism.* 🧬⚡
