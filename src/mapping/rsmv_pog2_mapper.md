# RSMV to POG2 Assimilation Map

This file tracks the usage of `rsmv` script runner functions and their native POG2 counterparts.

| RSMV Script | Runner Dependency | POG2 Native Equivalent | Status |
| :--- | :--- | :--- | :--- |
| `extractfiles.ts` | `ScriptOutput`, `ScriptFS` | `SovereignScriptRunner` | In Progress |
| `testdecode.ts` | `ScriptOutput`, `ScriptFS` | `SovereignScriptRunner` | Pending |
| `scrapeavatars.ts` | `CLIScriptFS`, `ScriptFS`, `ScriptOutput` | `SovereignScriptRunner` | Pending |
| `quickchatlookup.ts` | `CLIScriptOutput`, `ScriptFS`, `ScriptOutput` | `SovereignScriptRunner` | Pending |
| `indexoverview.ts` | `CLIScriptOutput`, `ScriptFS`, `ScriptOutput` | `SovereignScriptRunner` | Pending |
| `filehistory.ts` | `ScriptFS`, `ScriptOutput` | `SovereignScriptRunner` | Pending |
| `cluecoords.ts` | `ScriptFS`, `ScriptOutput` | `SovereignScriptRunner` | Pending |
| `cachediff.ts` | `ScriptFS`, `ScriptOutput` | `SovereignScriptRunner` | Pending |
| `dump_script.ts` | `opdecoder` | `POG2 Native Cache Reader` | Pending |

## Objectives
1. Identify all scripts using `CLIScriptFS` or `CLIScriptOutput`.
2. Refactor these to `SovereignScriptRunner` (to be created).
3. Ensure native cache interaction via `JagexCacheReader`.
4. Register as tools in `ToolRegistry`.
