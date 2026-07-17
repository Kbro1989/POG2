# src/utils

Shared utilities: sovereign storage, clocks, networking/sync, content enrichers, and model/runtime bridges.

Highlights:
- Storage/pathing: `SovereignPathResolver.ts`, `WslPathNegotiator.ts`, `PathNormalizer.ts`
- Time: `CanonicalClock.ts`, `SovereignClockController.ts`
- Data/runtime: `RSMVBridge.ts`, `RSMVCacheDB.ts`, `RSMVExtractor.ts`, `SovereignSubstrate.ts`, `SovereignKnowledgeDB.ts`
- APIs/content: `GeApi.ts`, `BestiaryApi.ts`, `OfficialPlayerDataApi.ts`, `WikiEnricher.ts`, `WikiEquipmentEnricher.ts`
- Modeling/training: `TrainingCollector.ts`, `VectorDB.ts`, `StyleAnalyzer.ts`
- System/terminal: `shell.ts`, `logger.ts`, `SovereignScriptRunner.ts`
- Sovereign meta: `SovereignEye.ts`, `PuppeteerEye.ts` usage helpers, `SovereignUI.ts`, `SovereignGrounding.ts`, `SovereignLibrary.ts`, `QuotaTracker.ts`, `DumpRefiller.ts`, `PlayerStateExporter.ts`, `PVMEIngester.ts`, `NpcCollector.ts`, `NarrativeExtractor.ts`, `LocationResolver.ts`, `KeyVault.ts`, `ClinicalAuditTool.ts`

Run / test: imported project-wide; several `.js` duplicates remain alongside `.ts` origins.
