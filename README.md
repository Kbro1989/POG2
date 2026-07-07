# POG2 — Sovereign Platform

> TypeScript · HTML · Cloudflare · Multi-limb Architecture

The **POG2 Sovereign Platform** — main orchestration hub for the 27-limb distributed pipeline.
Root contains architectural documentation, cache forensics tooling, and the platform manifest.

## Key Documentation

| File | Purpose |
|---|---|
| `ARCHITECTURE.md` | System architecture overview |
| `CODEBASE_MAP.md` | Full codebase map (29KB) |
| `OrchestrateEngine.md` | Orchestration engine spec (237KB) |
| `SOVEREIGN_THESIS.md` | Sovereign Stack design thesis |
| `EXTERIOR_HANDSHAKES.md` | External system integration contracts |
| `SECURITY_CHAIN.md` | Zero-trust security chain |
| `POG2_KNOWLEDGEBASE.md` | Platform knowledge base |
| `NEUROLOGICAL_MAP.md` | Limb/neuron topology map |

## Cache Forensics Tooling (root-level TypeScript)

| Tool | Purpose |
|---|---|
| `cache_item_forensics.ts` | RS3 item cache extraction + analysis |
| `cache_npc_forensics.ts` | RS3 NPC cache extraction |
| `cache_quest_forensics.ts` | Quest data extraction from RS3 cache |
| `cache_equipment_mapper.ts` | Equipment cache mapping |
| `cache_name_search.ts` | Cache entity name search |
| `cache_enum_scanner.ts` | Opcode enum discovery |

## Directory Structure

```
atlas/          # World spatial data
cache/          # Cache ingestion outputs
data/           # Platform data files
diagnostic/     # Diagnostic outputs
generated/      # Build artifacts
mediator/       # Mediator service
memory/         # Memory/knowledge store
src/            # Main source
```

## Limb Count: 27

89 tools across 7 domains · 389 models in Rolodex · 4-tier circuit breaker fallback
229,000 cache entities (32,512 NPCs · 59,984 items · 136k objects)

## Config

`.metabolic-whitelist.json` · `.pog2-config.json.example` · `POG2-mcp.json`
