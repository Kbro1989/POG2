# Skillslimb Assimilation Mapping

Target: `skillslimb.ts` functional knowledge profile for POG2 sovereign substrate.
Format: `.md`, authored in the POG2 workspace and referenced from Hermes skill management.

## Command → Skill Slot Assignments

POG2 shell/path commands:
- `ollama list` / `ollama run`
- `gcloud`, `wrangler`
- `git status`, `git push`, `git pull`
- `npm install`
- `powershell -Command ...`

Hermes mapping slots:
- **ollama** → `skillslimb.ts` `OllamaSubstrate` / `KnowledgeIngestor`
- **gcloud** → `CloudClientSubstrate`
- **wrangler** → `CloudflareSubstrate`
- **git** → `VersioningSubstrate`
- **npm** → `DependencySubstrate`

## YaoState → Routing Slot Assignments

- OldYang → `HighMetabolismAction`
- YoungYang → `StandardExecutionPath`
- OldYin → `RetreatPath`
- YoungYin → `ReceptivePath`
- Changing → `TransitionalPath`

Each routing slot should be a quasi-pure and referential Web ONLY policy node if possible.
