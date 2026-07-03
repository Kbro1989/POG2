# POG2 Security Chain — Authoritative Index of Gates

This document is the read-me-first for every validation gate in the
POG2 substrate. It exists because the gates are spread across six
files (and counting), and the relationship between them is not
visible from any single file's source.

If you are adding a new gate, tightening an existing one, or
debugging why a tool/knock was rejected, start here.

---

## The four gates

POG2's validation surface is four parallel gates. **They do not
consult each other** — a request must independently clear each one
it is exposed to. Composition of gates is a future work item.

| # | Gate | File | Validates | Authority | Bypass behavior |
|---|------|------|-----------|-----------|-----------------|
| 1 | SovereignKnock | `src/routing/TernaryRouter.ts:236` | Caller identity (hex alignment, chroma, nonce, anatomy) | `TernaryRouter.sovereignKnock()` returns `ConcealmentState` | WARN log per stage when its dep limb is not wired |
| 2 | DomainLocker | `src/routing/DomainLocker.ts:156` | Tool jurisdiction (active domain ↔ tool's mapped domain) | `DispatchVerdict { action: 'PASS' \| 'WAIT' }` | `WAIT` returned, not block; Kimi dispatches to worker |
| 3 | SovereignDefinitionEngine | `src/engines/SovereignDefinitionEngine.ts:30` | Prompt semantics (Sovereign / Foreign / Novel / Adversarial) | `DefinitionResult { isValid, invariant, confidence, category }` | LLM call failure → `err(...)`; Adversarial → `isValid = false` |
| 4 | Hexagram activeLimbs | `src/core/HexagramDefinitions.ts:40` | Which limb categories the engine exposes in the current hexagram state | `HexagramDefinition.activeLimbs: LimbCategory[]` | Read at orchestration time; non-matching limbs are hidden from the LLM |

---

## The Handshake Triad (SovereignKnock stages 2-4)

Stages 2, 3, and 4 of `SovereignKnock` each depend on a different
limb being **wired** into the `TernaryRouter` via its setter. If the
setter has not been called, the corresponding stage is **bypassed
with a WARN log**, not failed. This is deliberate: a fresh
substrate that has not yet wired its limbs should still be able to
boot and process internal calls.

The three deps and their setters:

| Stage | Dep | Setter | File | Default behavior when unset |
|-------|-----|--------|------|----------------------------|
| 2 (chroma) | `ChromaLimb` | `router.setChromaLimb(limb)` | `src/limbs/spatial/ChromaLimb.ts` | Bypass with WARN |
| 3 (nonce) | `MemoryConsolidationEngine` | `router.setMemoryConsolidationEngine(engine)` | `src/engines/MemoryConsolidationEngine.ts` | Bypass with WARN |
| 4 (anatomy) | `BioIntelligenceLimb` | `router.setBioIntelligence(limb)` | `src/limbs/spatial/BioIntelligenceLimb.ts` | Bypass with WARN |

The current bootstrap path (see `NEUROLOGICAL_MAP.md`) does not
call any of these setters, so today all three stages are bypassed
in production. The WARN logs surface this so the gap is visible
rather than silent.

**As of 2026-06-21 the MCP server boot path (`src/mcpserver.ts`)
IS wired:** ChromaLimb + BioIntelligenceLimb before
`engine.initialize()`, and MemoryConsolidationEngine (using the
engine's own instance) right after. The CLI bootstrap path
(`src/cli.ts`) is still unwired — that's the next tightening.

**Stage 1 (hex alignment) does not have a dep — it consults the
router's own `hexagram` field directly.** The router is constructed
with a `HexagramManager`, so stage 1 always has authority.

---

## How a foreign tool is gated

End-to-end path for a foreign skill registering and executing:

1. **Caller builds a knock** with `iChingSequence: hexagramManager.getCurrentSequence()` and (after the tightening) `currentHexagramId: hexagramManager.getNumericId()`.
2. **`ToolRegistry.registerForeignTool(tool)`** wraps the tool's `execute` (line 75) to consult:
   - **Gate 1 (SovereignKnock)**: if `flags.isForeign`, calls `router.sovereignKnock(knock)`. Failure → `err(...)` returned without invoking the tool.
   - **Gate 2 (DomainLocker)**: if a `domainLocker` is wired, calls `domainLocker.dispatchCheck(tool.name)`. `WAIT` is logged but does not block (the underlying execute still runs); `PASS` runs the tool.
3. **`SkillsLimb.registerSkillAsTool(skill)`** runs an immune audit (lines 326-337) before the tool reaches the registry: `GhostLimb.adversarialAudit`, `ClinicalAuditTool.schemaScan`, `OmegaLimb.verifyAlignment`, `InvariantCompiler.structuralProof`. Failure here blocks registration entirely. (This is the pre-knock audit, conceptually — Gate 5 if you count it.)
4. **At orchestration time**, the active hexagram's `activeLimbs` field filters which tool categories the engine surfaces to the LLM (Gate 4).

A tool that clears gates 1 and 2 is registered and runnable. Gate
3 (def engine) runs separately when the engine is asked to define
a prompt. Gate 4 (activeLimbs) runs at LLM context build time.

---

## State injection posture

The `SovereignKnock.iChingSequence` field accepts a `string[]` of
length 6, but the runtime substrate computes its own state from
`HexagramManager.lines` (a `ContextCard[]` per line). The two are
**not** required to match today. The `currentHexagramId` field
(added 2026-06-21 tightening) anchors the protocol to the
`HEXAGRAM_REGISTRY` 64-entry canonical list.

If state injections arrive in `iChingSequence`, they do not reach
the substrate's `lines` array and therefore do not change the
hexagram state. The `currentHexagramId` field is the authoritative
identity — King Wen glyphs and binary digits in `iChingSequence`
are display data only.

---

## Reading order for newcomers

1. `NEUROLOGICAL_MAP.md` — the runtime anatomy and bootstrap order.
2. `CODEBASE_MAP.md` — the file inventory and one-line descriptions.
3. This document — the gate composition (not visible from either map alone).
4. `SKILLSLIMB_ASSIMILATION_MAP.md` — the command/skill slot mapping for Hermes-side consumers.

---

## Future work

- **Composed gates**: make the SovereignKnock aware of the active `SovereignDomain` and reject knocks that cross an inactive adjacency in the active hexagram's `activeLimbs`.
- **Posture semantics**: `'is'` and `'isif'` are now reachable via `knock.requestedPosture`, but their downstream effects on `RSCLimb.concealmentState` and the broader substrate are not yet wired.
- **Setter wiring at bootstrap**: the three setters (`setChromaLimb`, `setBioIntelligence`, `setMemoryConsolidationEngine`) are not called anywhere. The `NEUROLOGICAL_MAP.md` bootstrap order should be updated to wire them.
