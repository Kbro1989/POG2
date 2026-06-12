# POG2 Sovereign Cognitive Federation - Project Instructions

This project is not merely an orchestration framework; it is an engine for **sovereign cognitive federation**. Our development philosophy prioritizes epistemic integrity, domain-calibrated trust, and constitutional continuity over generic MCP orchestration.

## Core Directives

1.  **Epistemic Trust Over Efficiency:** All tool executions and model inferences must be filtered through a trust ledger (`accurateFor` / `unreliableFor` metrics).
2.  **Experiential Density:** System cognition depends on vector-based memory. All interactions, state transitions, and pedagogical synthesis must be vectorized and stored in the VectorDB. Memory must never be `null`.
3.  **Constitutional Cognition:** Self-modification mechanisms are strictly forbidden until causality tracing, state rollback, and trust-weighted moral-axis verification are fully implemented.
4.  **Asymmetric Cognitive Permeability:** We maintain 1-way seeding (consuming external insights) while preserving sovereign interiority (preventing recursive infection or authority inversion).

## Strategic Priorities (Development Roadmap)

1.  **VectorDB Population:** Prioritize the ingestion of pedagogical datasets (instruction pairs) into the `EmbedEngine` to establish contextual continuity.
2.  **Rolodex Trust Calibration:** Implement the trust-weighting ledger for all models. Routing is governed by domain fidelity, not speed or cost.
3.  **Cognitive Event Bus:** Implement a shared temporal clock and event bus to propagate state changes, ensuring causal lineage across fragmented cognitive modules.
4.  **MCP Diplomatic Registry:** Extend `MCPEngine.ts` to handle external AI callbacks, treating all incoming signals as foreign diplomatic traffic requiring immune-system validation.
5.  **Constitutional Autopoiesis:** Implement rigorous safety-checks (divination, snapshotting, law verification) *before* any self-modifying gate is triggered.

## Architectural Conventions

*   **Memory Injection:** All `getPlan()` calls MUST inject semantic context from the VectorDB. `memoryInjection` must never return null in operational state.
*   **Tool Routing:** Routing logic must use the `TernaryRouter` (or equivalent) rather than direct retry loops to prevent deterministic collapse spirals.
*   **Communication:** WebSocket bridge traffic must use the `8789` port and adhere to the diplomatic handshake protocol established in `SovereignBridge.ts`.
