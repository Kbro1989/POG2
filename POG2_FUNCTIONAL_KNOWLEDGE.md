# POG2 Functional Knowledge — PNS/CNS Integration

Base usages:
- `ollama` — local inference substrate
- `antigravity` — MCP bridge and workflow host
- `cloud` — Cloudflare / Google remote endpoints

## YaoState Command Matrix

| YaoState | POG2 command usages | Routing behavior |
|----------|---------------------|------------------|
| OldYang | projective execution burst | high metabolic action — destructive commands require contract.gates.allowDestructiveCommands true |
| YoungYang | standard proactive | normal execution path |
| OldYin | retreating / unstable | diagnostics, no structural repair without explicit contract |
| YoungYin | receptive / idle | safe execution, diagnostics only |
| Changing | transitional | route through TerminalStrategy force path |

## Knock-Lock Handshake

Source: `src/tests/simulate_947_handshake.ts`

Opcode 15 — JS5 Update Handshake
Opcode 14 — Login Handshake
Result: `HandshakeResponse.SUCCESS` or failure block

Login block fields:
- magic: 10
- isaacSeeds: [4*uint32]
- uid: hex device id
- revision: latestBuildNumber
- username / password pair

Transcript path convention:
`C:/Users/Destiny/.gemini/antigravity/brain/<session>/scratch/handshake_transcript_947.json`

## Way Command Usages

Discovered in tool registry (allfiles.md + tool_list.txt):
- `shell_command` — escapes to system shell through `ShellEngine`
- `gcloud` / `wrangler` / `ollama` — cloud and local model wrappers
- `git_*` — version control from sovereign state
- `think` — recurse into master-tier reasoning
- `reflect` — post-action consolidation
- `healer_diagnose` — self-repair probe

## MCP Bridge Anomalies (known decisions)

| Server | Antigravity program error return | Decision |
|--------|--------------------------------|----------|
| GitKraken | Badger MANIFEST + CHECKSUM_MISMATCH + WAL truncate locked | Known cache corruption path; treat as degraded local git feature, not fatal |
| datacloud_* | `google: could not find default credentials` | Expected until Antigravity app login populates ADC; do not block startup |
| notebooks | `ENOENT \\?\pipe\datacloud-mcp-notebooks-antigravityide` | Known: `.antigravity-ide` node bundle not running |
| visualization | same named-pipe ENOENT | Same as notebooks |
| pog2-sovereign | context deadline exceeded (after OllamaCapabilityConfig log) | Transient timeout under probe; normalize retry/backoff |
| `pog2-sovereign` exists at `scratch/POG2/dist/mcpserver.js` | Present | Primary Hermes integration target |

## WSL Shell Addition Rationale

POG2's `ShellEngine` currently shells through ComSpec/cmd on Windows.
Adding a `wsl` command wrapper enables:
- Linux-native tooling from the sovereign substrate
- Cross-platform script portability for knowledge pipelines
- Cleaner path handling for `skillslimb.ts` generated artifacts

Proposed additions:
- `ShellEngine.executeWsl(command, distro?)`
- `ShellLibrary.wsl(args)` with optional distro default
- Env passthrough for `POG2_ACTIVE`, Hermes home, and Ollama env
