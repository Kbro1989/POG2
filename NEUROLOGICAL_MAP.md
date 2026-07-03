# POG2 Neurological Map — Authoritative Biological Substrate

Source: user-provided TypeScript enum + interfaces + `NEUROLOGICAL_MAP`.
This file is the single source of truth for NeuralCategory taxonomy, node
roles, docDomains, metabolic costs, and bootstrap ordering.

## Categories

- CNS: Central Nervous System
- PNS: Peripheral Nervous System (limbs)
- SENSORY: Perception
- MEMORY: Hippocampus/learning
- IMMUNE: Validation/repair
- METABOLIC: Connective/structural
- GAMEPLAY: Gameplay domain

## Bootstrap / handshake order (highest-to-lowest metabolic cost)

Prefrontal / control:
- OrchestrateEngine (CNS, 20)
- PipelineController (CNS, 25)
- CNSGodheadPulseVolley (CNS, 20)
- HexagramManager (CNS, 5-10)
- HexagramDefinitions (METABOLIC, 2)
- SovereignDefinitionEngine (CNS, 10) — semantic-singularity gate; classifies intent as Sovereign / Foreign / Novel / Adversarial via LLM call. See `SECURITY_CHAIN.md` Gate 3.
- SkillsLimb (CNS, 20) — lives at `src/limbs/system/SkillsLimb.ts` (PNS-style folder, but CNS-classified function). Assimilates foreign skills into the ToolRegistry. See `SKILLSLIMB_ASSIMILATION_MAP.md` for slot assignments.

Routing / signal:
- TernaryRouter (CNS, 15)
- WorkforceManifest (METABOLIC, 5)
- DomainLocker (METABOLIC, 5)
- DefaultStrategy / AnalyticalStrategy / CompositeStrategy (METABOLIC)

Lims / PNS:
- ShellEngine (PNS, 10)
- GenerateEngine (PNS, 20)
- CodeEngine (PNS, 15)
- WebSearchEngine (PNS, 15)
- MCPEngine (PNS, 10)
- MultiModelExecutor (PNS, 30)
- ChromanumberEngine (PNS, 40)
- MediaForgeLimb (PNS, 40)

Sensory:
- VisionEngine (SENSORY, 25)
- SpatialVisionEngine (SENSORY, 20)
- SovereignEye (SENSORY, 5)
- PulseMonitor (SENSORY, 2)
- NodeTester (SENSORY, 10)

Memory:
- VectorDB (MEMORY, 10)
- EmbedEngine (MEMORY, 15)
- TrainingCollector (MEMORY, 5)
- MemoryConsolidationEngine (MEMORY, 20)
- GlobeStateLimb / EntityLimb / RelicLimb (MEMORY)

Immune:
- ValidationSystem (IMMUNE, 10)
- IntentVerifier (IMMUNE, 15)
- SelfHealingEngine (IMMUNE, 20)
- ClinicalAuditTool (IMMUNE, 15)
- EndpointHealer (IMMUNE, 10)
- ArchitecturalValidator / ASTWatcher (IMMUNE)

Metabolic:
- Config / Path / SovereignPathResolver / DBMaintenance / EventBus

## Notes for Hermes handshake

Hermes should route through:
1. `src/cli.ts` (entry)
2. `src/engines/OrchestrateEngine.ts` (control)
3. `src/routing/HexagramManager.ts` (state)
4. Any `docDomain: 'SYSTEM' | 'MEMORY' | 'META'` node first.

## Handshake Triad (SovereignKnock deps)

`TernaryRouter.sovereignKnock` validates against three limbs that
must be wired via their setters after construction. If unset, the
corresponding stage is bypassed with a WARN log (deliberate —
internal calls should still work in a freshly-booted substrate).

- **Stage 2 (chroma)**: `router.setChromaLimb(limb)` → `src/limbs/spatial/ChromaLimb.ts`
- **Stage 3 (nonce)**: `router.setMemoryConsolidationEngine(engine)` → `src/engines/MemoryConsolidationEngine.ts`
- **Stage 4 (anatomy)**: `router.setBioIntelligence(limb)` → `src/limbs/spatial/BioIntelligenceLimb.ts`

See `SECURITY_CHAIN.md` for the full gate composition. The current
bootstrap path does not call any of these setters, so all three
stages are bypassed in production.
