# 🗂 POG2 Full Codebase Map

**Last updated**: 2026-07-06
**Style**: live-tree-first with cross-repo pointers.

This file is the working codebasemap for the local checkout.
For broader sovereign-context and file-tree indexes, use `C:\Users\krist\Desktop\POG2_GLOBAL_INDEX.md`.

---

## 📍 Live Tree Index (`Kbro1989/POG2`)

Root: `C:\Users\krist\.gemini\antigravity\scratch\POG2`

Entry points / spine:
- `src/cli.ts`
- `src/cli/CLIRouter.ts`
- `src/mcpserver.ts`
- `src/switchboard_server.ts`
- `src/bridge_server.ts`
- `src/PlayerAgent.ts`

Config / constants:
- `src/config/SovereignConfig.ts`
- `src/config/beta_constants.ts`
- `src/config/OllamaCapabilityConfig.ts`
- `src/constants/AnatomyRegistry.ts`
- `src/constants/KineticRegistry.ts`
- `src/constants/ModelRegistry.ts`

Core:
- `src/core/.` many foundation files including bootstrap, models, opcode/protocol readers, avatar/path/node registries, grounding, errors, and sovereign helpers.

AI/API:
- `src/api/ai/CapabilityRegistry.ts`
- `src/api/ai/CloudflareModelRegistry.ts`
- `src/api/ai/Dispatcher.ts`
- `src/api/ai/ExteriorGate.ts`
- `src/api/ai/IntentMap.ts`
- `src/api/ai/ModelRolodex.ts`
- `src/api/ai/OverflowShim.ts`
- `src/api/ai/StaticModelRegistry.ts`
- `src/clients/ModelClient.ts`

Engines:
- `src/engines/ArchitecturalValidator.ts`
- `src/engines/ASTWatcher.ts`
- `src/engines/AvatarCompositionEngine.ts`
- `src/engines/BlenderRenderer.ts`
- `src/engines/ChromanumberEngine.ts`
- `src/engines/CodeEngine.ts`
- `src/engines/CognitiveEngine.ts`
- `src/engines/CompletionEngine.ts`
- `src/engines/ContextBuilder.ts`
- `src/engines/DiscoveryEngine.ts`
- `src/engines/EmbedEngine.ts`
- `src/engines/ForgeEngine.ts`
- `src/engines/GenerateEngine.ts`
- `src/engines/IntentVerifier.ts`
- `src/engines/MCPEngine.ts`
- `src/engines/MemeticEngine.ts`
- `src/engines/MemoryConsolidationEngine.ts`
- `src/engines/MetabolicEngine.ts`
- `src/engines/MetaCognitionEngine.ts`
- `src/engines/MultiModelExecutor.ts`
- `src/engines/OrchestrateEngine.ts`
- `src/engines/PipelineController.ts`
- `src/engines/ReimaginationEngine.ts`
- `src/engines/SelfHealingEngine.ts`
- `src/engines/ShadowEngine.ts`
- `src/engines/ShellEngine.ts`
- `src/engines/ShellLibrary.ts`
- `src/engines/SovereignDefinitionEngine.ts`
- `src/engines/SovereignIngestionEngine.ts`
- `src/engines/SpatialVisionEngine.ts`
- `src/engines/SyntropyEngine.ts`
- `src/engines/TemporalSynchronizer.ts`
- `src/engines/TodoEngine.ts`
- `src/engines/ValidationSystem.ts`
- `src/engines/VisionActuationHarness.ts`
- `src/engines/VisionEngine.ts`
- `src/engines/VSCodeEngine.ts`
- `src/engines/WebSearchEngine.ts`
- `src/engines/core/CausalPatternExtractor.ts`
- `src/engines/core/CNSCausalityLedger.ts`
- `src/engines/core/EpistemicTransitionKernel.ts`
- `src/engines/core/EpistemicValidator.ts`
- `src/engines/core/InvariantCompiler.ts`
- `src/engines/core/NecromancerBrain.ts`
- `src/engines/core/TruthReconciler.ts`
- `src/engines/core/WaitDecisionMaker.ts`
- `src/engines/gameplay/...`
- `src/engines/spatial/ObservationEngine.ts`
- `src/engines/spatial/ExplorationEngine.ts`

Limbs:
- `src/limbs/core/NeuralLimb.ts`
- `src/limbs/core/TemporalHeartbeatLimb.ts`
- `src/limbs/system/SkillsLimb.ts`
- `src/limbs/cognitive/CognitivePermissionMatrix.ts`
- `src/limbs/combat/AdrenalineStateMachine.ts`
- `src/limbs/creative/...` media, video, voice, webapp, youtube
- `src/limbs/metaphysical/...` Ghost/Omega/Quantum/Relic
- `src/limbs/spatial/...` spatial/system limbs including forensics, cache, collision, HUD, radar, wiki reconciliation, official API, world forensics, etc.
- `src/limbs/logical/...` clue, extras, handshake, interaction, restock, sandbox, vocabulary, state persistence
- `src/limbs/pedagogy/...` combat pedagogy, ghost training, interface mapping, distiller, forensics, avatar action bar volition, sync
- `src/limbs/sensory/PerceptionLimb.ts`
- `src/limbs/technical/...` AI, control plane, entity, environment, epistemic, kinematics, logic brain, mechanical, pedagogy, quest forge/synthesis, sandbox, topology, UI, validation, vector pedagogy
- `src/limbs/vision/...` chroma validator, image processor, vision router
- `src/limbs/voice/CartesiaAdapter.ts`
- `src/limbs/world_grounding/WorldGroundingLimb.ts`

Routing:
- `src/routing/TernaryRouter.ts`
- `src/routing/HexagramManager.ts`
- `src/routing/TaskScheduler.ts`
- `src/routing/DomainLocker.ts`
- `src/routing/FireInjectionRouter.ts`
- `src/routing/AttentionRouter.ts`
- `src/routing/GlobeReconciliationKernel.ts`
- `src/routing/VibeMapper.ts`
- `src/routing/WorkforceManifest.ts`
- `src/routing/types.ts`
- `src/routing/strategies/...`
- `src/routing/evolution/...`

Services / bridges / sovereign extras:
- `src/services/CloudflareServices.ts`
- `src/services/GoogleServices.ts`
- `src/services/SovereignEntityResolver.ts`
- `src/services/SovereignPedagogyBridge.ts`
- `src/bridge/ChatTelemetryBridge.ts`
- `src/sovereign/Pog2HexagramBridge.ts`
- `src/sovereign/Pog2Integration.ts`
- `src/convergence/...`

Monitor / vision / utils:
- `src/monitor/...`
- `src/vision/...`
- `src/utils/...`
- `src/types/...`
- `src/state/...`
- `src/ui/...`

Scripts / tests / backups:
- `src/scripts/...`
- `src/scripts_backup/...`
- `src/tests/...`

Public assets:
- `public/...`

Docs in repo:
- `CODEBASE.md`
- `CODEBASE_MAP.md`
- `ARCHITECTURE.md`
- `CLAUDE.md`
- `GEMINI.md`
- `OrchestrateEngine.md`
- `POG2_KNOWLEDGEBASE.md`
- `POG2_FUNCTIONAL_KNOWLEDGE.md`
- `POG2_FUNCTIONAL_TETHER_MECHANICS.md`
- `POG2_INIT_VISIBILITY_CONTRACT.md`
- `POG2_APP_HANDSHAKE_CONTRACT.md`
- `POG2_DUAL_SUPPORT_POLICY.md`
- `RSMV_AUDIT_SUMMARY.md`
- `RSMV_DEPENDENCY_AUDIT.md`
- `RSMV_REPLACEMENT_PLAN.md`
- `SECURITY_CHAIN.md`
- `SKILLSLIMB_ASSIMILATION_MAP.md`
- `SOVEREIGN_THESIS.md`
- `WEBPACK_DEPENDENCY_ANALYSIS.md`
- `EXTERIOR_HANDSHAKES.md`
- `CONTRIBUTING.md`
- `README.md`
- `PULL_REQUIREMENTS.md`
- `PROJECT-OVERVIEW.md`
- `NEUROLOGICAL_MAP.md`
- `MEMORY_UPDATE.md`
- `allfiles.md`
- `manifest.md`
- `.manifest.md`
- `pog2.md`
- `.pog.md`
- `.pog2.md`
- `rules.md`
- `.agents/TOOL_MANIFEST.md`
- `.agents/rules/pogrules.md`
- `.agents/skills/diagnostic_healer/SKILL.md`
- `.agents/workflows/pog2-knowledgebase.md`
- `.agent/workflows/pog2-sovereign.md`
- `extra/JAGA_FORMAT_ANALYSIS.md`
- `memory/hudforensics-limb-fix.md`
- `plans/sharded-roaming-alpaca.md`
- `rsmv_inspector/GEMINI.md`
- `rsmv_inspector/readme.md`
- `rsmv_inspector/src/clientscript/readme.md`
- `rsmv_inspector/src/map/readme.md`
- `rsmv_inspector/todo.md`
- `src/mapping/rsmv_pog2_mapper.md`
- `src/utils/SovereignPathResolver.md`

---

---

## 📂 Per-Folder README Index

Root README: [`./README.md`](./README.md)

**Note**: some folders below may not exist on disk yet; their READMEs are placeholders noting absence or role expectation.

### Hidden/config

- [`.agent/`](./.agent/README.md)
- [`.agent/workflows/`](./.agent/workflows/README.md)
- [`.agents/`](./.agents/README.md)
- [`.agents/rules/`](./.agents/rules/README.md)
- [`.agents/skills/`](./.agents/skills/README.md)
- [`.agents/skills/diagnostic_healer/`](./.agents/skills/diagnostic_healer/README.md)
- [`.agents/workflows/`](./.agents/workflows/README.md)
- [`.claude/`](./.claude/README.md)
- [`.github/`](./.github/README.md)
- [`.github/commands/`](./.github/commands/README.md)
- [`.github/workflows/`](./.github/workflows/README.md)
- [`.vscode/`](./.vscode/README.md)
- [`.wrangler/`](./.wrangler/README.md)
- [`.wrangler/state/`](./.wrangler/state/README.md)

### Top-level data/assets

- [`atlas/`](./atlas/README.md)
- [`atlas/spatial/`](./atlas/spatial/README.md)
- [`atlas/spatial/unified_extract/`](./atlas/spatial/unified_extract/README.md)
- [`atlas/spatial/world_extract/`](./atlas/spatial/world_extract/README.md)
- [`cache/`](./cache/README.md)
- [`data/`](./data/README.md)
- [`data/boss_templates/`](./data/boss_templates/README.md)
- [`data/entity_instances/`](./data/entity_instances/README.md)
- [`data/pvme/`](./data/pvme/README.md)
- [`data/substrate/`](./data/substrate/README.md)
- [`diagnostic/`](./diagnostic/README.md)
- [`extra/`](./extra/README.md)
- [`extra/items/`](./extra/items/README.md)
- [`generated/`](./generated/README.md)
- [`mediator/`](./mediator/README.md)
- [`mediator/app/`](./mediator/app/README.md)
- [`memory/`](./memory/README.md)
- [`plans/`](./plans/README.md)
- [`pog2-git/`](./pog2-git/README.md)
- [`public/`](./public/README.md)
- [`public/gameplay/`](./public/gameplay/README.md)
- [`public/icons/`](./public/icons/README.md)
- [`public/models/`](./public/models/README.md)
- [`public/test_output/`](./public/test_output/README.md)
- [`public/unified/`](./public/unified/README.md)
- [`rsmv_clone/`](./rsmv_clone/README.md)
- [`rsmv_clone/src/`](./rsmv_clone/src/README.md)
- [`rsmv_inspector/`](./rsmv_inspector/README.md)
- [`rsmv_inspector/data/`](./rsmv_inspector/data/README.md)
- [`rsmv_inspector/dist_scripts/`](./rsmv_inspector/dist_scripts/README.md)
- [`rsmv_inspector/generated/`](./rsmv_inspector/generated/README.md)
- [`rsmv_inspector/opcodes/`](./rsmv_inspector/opcodes/README.md)
- [`rsmv_inspector/scratch/`](./rsmv_inspector/scratch/README.md)
- [`rsmv_inspector/src/`](./rsmv_inspector/src/README.md)
- [`rsmv_inspector/test_extract/`](./rsmv_inspector/test_extract/README.md)
- [`scratch/`](./scratch/README.md)
- [`scratch/live_extracts/`](./scratch/live_extracts/README.md)
- [`scratch/public/`](./scratch/public/README.md)
- [`scratch/staging/`](./scratch/staging/README.md)
- [`scripts/`](./scripts/README.md)
- [`web_hud/`](./web_hud/README.md)
- [`web_hud/public/`](./web_hud/public/README.md)
- [`web_hud/src/`](./web_hud/src/README.md)

### Source (`src/`)

- [`src/.scratch/`](./src/.scratch/README.md)
- [`src/api/`](./src/api/README.md)
- [`src/api/ai/`](./src/api/ai/README.md)
- [`src/bridge/`](./src/bridge/README.md)
- [`src/cli/`](./src/cli/CLIRouter.ts)
- [`src/clients/`](./src/clients/README.md)
- [`src/config/`](./src/config/README.md)
- [`src/constants/`](./src/constants/README.md)
- [`src/convergence/`](./src/convergence/README.md)
- [`src/core/`](./src/core/README.md)
- [`src/domain/chat/`](./src/domain/chat/README.md)
- [`src/durable-objects/`](./src/durable-objects/README.md)
- [`src/entities/`](./src/entities/README.md)
- [`src/entities/ai/`](./src/entities/ai/README.md)
- [`src/events/`](./src/events/README.md)
- [`src/events/processors/`](./src/events/processors/README.md)
- [`src/forensics/`](./src/forensics/README.md)
- [`src/generated/`](./src/generated/README.md)
- [`src/generated/cache-schemas/`](./src/generated/cache-schemas/README.md)
- [`src/generators/`](./src/generators/README.md)
- [`src/limbs/`](./src/limbs/README.md)
- [`src/limbs/audio/`](./src/limbs/audio/README.md)
- [`src/limbs/cognitive/`](./src/limbs/cognitive/README.md)
- [`src/limbs/combat/`](./src/limbs/combat/README.md)
- [`src/limbs/core/`](./src/limbs/core/README.md)
- [`src/limbs/creative/`](./src/limbs/creative/README.md)
- [`src/limbs/gameplay/`](./src/limbs/gameplay/README.md)
- [`src/limbs/logical/`](./src/limbs/logical/README.md)
- [`src/limbs/metaphysical/`](./src/limbs/metaphysical/README.md)
- [`src/limbs/pedagogy/`](./src/limbs/pedagogy/README.md)
- [`src/limbs/sensory/`](./src/limbs/sensory/README.md)
- [`src/limbs/spatial/`](./src/limbs/spatial/README.md)
- [`src/limbs/system/`](./src/limbs/system/README.md)
- [`src/limbs/technical/`](./src/limbs/technical/README.md)
- [`src/limbs/vision/`](./src/limbs/vision/README.md)
- [`src/limbs/voice/`](./src/limbs/voice/README.md)
- [`src/limbs/world_grounding/`](./src/limbs/world_grounding/README.md)
- [`src/logic/`](./src/logic/README.md)
- [`src/logic/handlers/`](./src/logic/handlers/README.md)
- [`src/mapping/`](./src/mapping/README.md)
- [`src/mcpserver/`](./src/mcpserver/README.md)
- [`src/monitor/`](./src/monitor/README.md)
- [`src/parsers/`](./src/parsers/README.md)
- [`src/prompts/`](./src/prompts/README.md)
- [`src/routing/`](./src/routing/README.md)
- [`src/routing/core/`](./src/routing/core/README.md)
- [`src/routing/evolution/`](./src/routing/evolution/README.md)
- [`src/routing/strategies/`](./src/routing/strategies/README.md)
- [`src/scripts/`](./src/scripts/README.md)
- [`src/scripts_backup/`](./src/scripts_backup/README.md)
- [`src/services/`](./src/services/README.md)
- [`src/sovereign/`](./src/sovereign/README.md)
- [`src/state/`](./src/state/README.md)
- [`src/substrates/`](./src/substrates/README.md)
- [`src/tests/`](./src/tests/README.md)
- [`src/tools/`](./src/tools/README.md)
- [`src/types/`](./src/types/README.md)
- [`src/ui/`](./src/ui/README.md)
- [`src/utils/`](./src/utils/README.md)
- [`src/vision/`](./src/vision/README.md)

---

## 🔗 Cross-Repo Context (`Kbro1989/POG2_GLOBAL_INDEX.md`)

Use `C:\Users\krist\Desktop\POG2_GLOBAL_INDEX.md` for the authoritative multi-repo `.md` index and broadened tree context across:
- Kbro1989/POG2
- Kbro1989/Pog2-Core
- Kbro1989/Pog2-Data
- Kbro1989/Pog2-Atlas
- Kbro1989/D-sovereign-
- Kbro1989/openrsc-vinilla
- Kbro1989/rsc-globe1-pure
- Kbro1989/rscaievolution-png
