# SovereignPathResolver

`src/utils/SovereignPathResolver.ts` is the centralized path allocator for POG2.
It keeps runtime storage and archive paths abstracted from hard-coded `D:\` references,
so the code can work across mirror backups, home installs, and project-local setups.

## Tiered path model

- `PathTier.Sovereign` (+1)
  - Primary production storage.
  - Uses `SOVEREIGN_STORAGE_ROOT` or `POG_SOVEREIGN_ROOT` when set.
  - Maps to `D:\sovereign` on Windows when available.
- `PathTier.Home` (0)
  - User-local storage in `~/.pog2-sovereign`.
  - Default when the Sovereign drive is unavailable.
- `PathTier.ProjectLocal` (-1)
  - Project-local storage in `.pog` under the current repo.
  - Used when `POG_USE_LOCAL=true` or local project isolation is required.

## Core functions

- `getPackageRoot()`
  - Finds the POG2 package install root by walking up from `src/utils`.
  - Used for application resources, templates, and exports that belong to the codebase.
- `resolvePackagePath(...segments)`
  - Resolves file paths relative to the package root.

- `getSovereignRoot(tier?)`
  - Returns the active storage root for the selected tier.
  - Bootstraps the required sovereign substrate directories on first use.
- `resolveSovereignPath(subpath, tier?)`
  - Resolves a subpath inside the sovereign root.
  - Ensures parent directories exist before returning the path.

## Specialized data paths

- `getrsmvSubstratePath()`
  - Resolves the RSMV inspector substrate.
  - Prefers `D:\pog2\rsmv_inspector`, falls back to `D:\sovereign\cache_pedagogy\rsmv_inspector` or the sovereign root.
- `getrsmvCachePath()`
  - Resolves the RuneScape cache location.
  - Uses `POG_rsmv_CACHE_DIR` if set, otherwise checks live cache defaults.
- `getOllamaModelsPath()`
  - Resolves Ollama model storage.
  - Uses `OLLAMA_MODELS_PATH` if configured.
- `getGutenbergPath()`
  - Resolves the Gutenberg library location.
  - Uses `POG_GUTENBERG_PATH` if configured.

- `getPipelineRootPath()` / `getGenerationsPath()`
  - Resolve production pipelines and generated-media roots.
- `getVectorDbPath()`
  - Resolves the sovereign vector database file.
- `getSatelliteDbPaths()`
  - Returns available auxiliary vector DBs.
- `getPipelinePath(category, folderName)`
  - Resolves a named pipeline workspace.

## Training and workspace paths

- `getTrainingInteractionsPath()`
- `getTrainingDecisionsPath()`
- `getTrainingHistoryPath()`
- `getTrainingMetricsPath()`
- `getTrainingThinkingPath()`
- `getTrainingFPRAGPath()`
- `getTrainingErrorFixesPath()`
- `getTrainingConsequencesPath()`

These resolve standardized training directories under the sovereign root.

## Other utility paths

- `getAgentSubstratePath()`
  - Resolves `.agents` or `.agent` workspace content.
- `getStaticResourcesPath()`
  - Resolves the project `resources/` folder.
- `getRscDataPath()`
  - Resolves archaeology and RSC data.

## Environment variables

- `SOVEREIGN_STORAGE_ROOT` / `POG_SOVEREIGN_ROOT`
  - Overrides the sovereign root.
- `POG_PATH_TIER`
  - Forces +1/0/-1 storage tier selection.
- `OLLAMA_MODELS_PATH`
  - Overrides the Ollama model path.
- `POG_GUTENBERG_PATH`
  - Overrides the Gutenberg library path.
- `POG_rsmv_SUBSTRATE_PATH`
  - Overrides the RSMV inspector substrate path.
- `POG_rsmv_CACHE_DIR`
  - Overrides the RuneScape cache location.
- `POG_USE_LOCAL`
  - Enables project-local `.pog` storage.

## Notes

- This resolver is the preferred place to route all `D:\` storage references in production code.
- Scripts that still contain hard-coded `D:\` strings should be migrated to use these helpers.
- Network and globe configuration should remain in `.env` via `POG2_GLOBE_ENDPOINT` and related endpoint vars.
