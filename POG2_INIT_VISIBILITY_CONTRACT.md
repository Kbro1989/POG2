# POG2 Init / Visibility Contract

## Mechanism note

- POG2 boots through `src/cli.ts`.
- Orchestrator load flows through `OrchestrateEngine.ts`.
- Memory/knowledge signals are routed through `POG2_KNOWLEDGEBASE.md` and `manifest.md`.

## Manifest resource / init needs

1. Functional knowledge: `POG2_FUNCTIONAL_KNOWLEDGE.md`
2. Tether mechanics: `POG2_FUNCTIONAL_TETHER_MECHANICS.md`
3. Skillslimb mapping: `SKILLSLIMB_ASSIMILATION_MAP.md`
4. Dual-support policy: `POG2_DUAL_SUPPORT_POLICY.md`

## Why these docs need visibility

These files define command routing, YaoState slots, and POG2-to-Hermes bridge state. If init manifests only enumerate game-world data and ignore directory/subject knowledge:

- Hermes handoff fails at handshake routing.
- Antigravity workflow parser loses decision-path context.
- `skillslimb` assimilation becomes write-only noise.

## Init / manifest directive

Any later runtime scaffold must ensure functionally relevant docs are treated as legitimate init sources, not touched-off through the compile bridge unless explicitly marked.

## Pending constructor

Pending host-side `.dme`/build bridge, no direct `.dme` path or `byondpath` edit is applied here.
