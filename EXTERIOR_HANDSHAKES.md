# POG2 Exterior Handshakes — MCP / Hermes / Foreign Surfaces

This document maps the **four interior gates** (see SECURITY_CHAIN.md) onto
the **exterior surfaces** POG2 exposes — MCP servers, the Hermes-POG2
sovereignty contract, and inbound calls from foreign orchestrators
(Antigravity, Claude Code, custom agents). It exists because the
gates and the surfaces live in different files and the relationship
between them is not visible from any single source.

If you are adding a new exterior surface, tightening an existing
handshake, or debugging why an inbound call was rejected or accepted,
start here.

---

## The two contracts that cross the boundary

POG2 talks to the outside world through exactly two contracts:

| # | Contract | File | Direction | Format |
|---|----------|------|-----------|--------|
| 1 | **MCP** | `src/mcpserver.ts` | Both: POG2 as MCP server (Hermes client → POG2); POG2 as MCP client (Claude Code registers POG2-MCP servers → POG2 calls them) | JSON-RPC over stdio |
| 2 | **Hermes Sovereignty YAML** | `hermes-agent/config/sovereign_rules.yaml` ←→ `src/sovereign/Pog2Integration.ts` | Hermes ↔ POG2: shared file, each process reads it | YAML parsed by both Python (`hermes_cli/sovereign_rules_loader.py`) and TypeScript (`js-yaml`) |

The other six `pog2-mcp.json` entries (GitKraken, Cloudflare, GitHub,
Linear, Terraform) are **MCP clients that POG2 talks to**. They are
configured but **not yet wired into the ToolRegistry**; POG2 can
register tools from them once SkillsLimb / ToolRegistry learns to
speak the MCP client protocol. Today they are inert.

---

## The MCP server surface (`src/mcpserver.ts`)

This is the bridge that lets external orchestrators call POG2 tools.
Two endpoints, plus one custom orchestration tool.

### Endpoint 1: `ListToolsRequestSchema` (line 75)

Maps every `ToolDefinition` in `ToolRegistry` to an MCP `Tool` schema,
plus appends the synthetic `sovereign_fan_out` tool.

```ts
// mcpserver.ts:81-91
const orchestrationTools = [
    {
      name: "sovereign_fan_out",
      description: "Spawn and orchestrate multiple sub-agents...",
      parameters: { intent, context, maxAgents }
    }
];
```

**Gate check at this endpoint: NONE.** Any MCP client that can reach
the stdio transport can enumerate every registered tool, including
foreign tools whose `isForeign=true` flag would normally require a
SovereignKnock to call. The list itself is unrestricted.

### Endpoint 2: `CallToolRequestSchema` (line 134)

Routes an inbound MCP tool call directly to `registry.getTool(name)`
and `tool.execute(args)` (line 153). This is the most exposed gate.

**Gate check at this endpoint: PARTIAL — passes through ToolRegistry's
wrapping, but only if the wrapping was applied at `register()` time.**

| Tool origin | Wrapping applied? | Gates that fire |
|-------------|-------------------|-----------------|
| Native POG2 tool (registered via `ToolRegistry.register`) | Yes — `wrapWithSecurity(tool, { isForeign: false })` (line 136) | DomainLocker.dispatchCheck() — but **only if a `domainLocker` is wired** via `setDomainLocker()` (line 44); no SovereignKnock because `isForeign=false` |
| Foreign tool (registered via `assimilateExternalSkill`) | Yes — `wrapWithSecurity({ ...tool, isForeign: true }, { isForeign: true })` (line 147) | DomainLocker.dispatchCheck() + **SovereignKnock** via `router.sovereignKnock(knock)` (line 93) |
| `sovereign_fan_out` (synthetic) | No — short-circuits before `registry.getTool()` (line 142) | **NONE** — direct passthrough to `result.content = "Fan-out initiated for intent: ${args.intent}..."` |

**So today:**
- A native tool called via MCP fires only the **DomainLocker gate**
  (and only if wired).
- A foreign tool called via MCP fires both gates, but the
  SovereignKnock stages 2-4 are bypassed with WARN if the Handshake
  Triad isn't wired (`SECURITY_CHAIN.md` §"The Handshake Triad").
- The synthetic `sovereign_fan_out` tool bypasses **both** gates. It
  is the most exposed surface in the system.

### Why MCP boot hangs at `hexagram.initialize()`

`mcpserver.ts:54` calls `await hexagram.initialize()`. This is where
the existing `dist/mcpserver.js` hangs in production. The fix is
outside this document's scope but the chain is:

```
hexagram.initialize()
  └─> HexagramManager.initialize() (src/routing/HexagramManager.ts)
       └─> VectorDB.getHexagramContext()
            └─> better-sqlite3 open at D:/sovereign/cache/hexagrams.db
                 └─> file does not exist or D:/ not mounted → ENOENT → hang
```

---

## The Hermes-POG2 sovereignty contract

Both processes read the same YAML. Neither imports the other. They
shake hands through the file.

### What Hermes enforces (Python side)

`hermes_cli/sovereign_rules_loader.py` loads the YAML at every
Hermes CLI boot and **fails closed** if the 5 required `sovereign_laws`
are absent. Hermes's own runtime then honors:

- `NO_MOCKS` / `NO_PLACEHOLDERS` — Hermes will not produce synthetic
  data; if a tool fails, the failure is recorded in `grading.json`,
  not hidden behind a stub return.
- `TYPE_SAFETY` — every JSON artifact validates against an explicit
  schema before being persisted to `iterations/`.
- `prohibited_patterns` — Hermes's static scan rejects any new code
  containing `// TODO`, `# pending`, `return true  # stub`,
  `NOT_IMPLEMENTED`, etc.

### What POG2 enforces (TypeScript side)

`src/sovereign/Pog2Integration.ts` loads the same YAML into a typed
`Pog2SovereignRules` object (cached). `Pog2HexagramBridge` consumes
the `pog2_integration:` block (lines 48-69 of the YAML) and produces
`Pog2Permission` verdicts via `resolvePermission(skillId, intent,
userOverride)`.

The five clauses in the `pog2_integration:` block map to specific
POG2 subsystems:

| Clause | Value | POG2 subsystem |
|--------|-------|----------------|
| `root_of_trust` | `POG2` | Sovereignty badge; logged at boot |
| `pog2_home` | `C:/Users/krist/.gemini/antigravity/scratch/POG2` | Used by `SovereignPathResolver` for authority checks (`PulseMonitor.authorityLocal`) |
| `inference.provider_routing` | `TernaryRouter` | All routing goes through `TernaryRouter.route()` |
| `inference.overflow_shim` | `pog2.inference.overflow` | `OverflowShim.ts` shells out to this Python module |
| `inference.vram_tier_source` | `POG2_VRAM_TIER` | Read by both Python shim and `OverflowShim.ts` |
| `inference.hard_fallback` | `ghost_limb_cpu_only` | `GhostLimb.ts` provides this when all local + cloud fail |
| `skill_activation.default_state` | `off` | `Pog2HexagramBridge` blocks unless explicit activation |
| `skill_activation.activation_requires` | `pog2_hexagram_approval` | Hexagram directive consulted in `resolvePermission` step 4 |
| `skill_activation.report_to` | `POG2.HexagramManager` | Future: bridge should report activations back to `HexagramManager` |
| `escape_hatch.user_override` | `always_wins_if_asserted` | Step 1 of `resolvePermission` short-circuits to ALLOW |
| `audit.pre_session` | `[neurological_audit, codebase_map, self_audit]` | Should run before any POG2 boot that consumes Hermes output |
| `audit.output_format` | `markdown_to_POG2_CacheLearningLimb` | **Not yet wired** — `CacheLearningLimb` would receive markdown summaries |

### Where the contract is honored (and where it isn't)

| Inbound call to POG2 | Honors `pog2_integration`? | Gate that fires |
|----------------------|----------------------------|-----------------|
| `mcpserver.ts` `CallTool` for a native tool | No — bridge is not consulted | Only DomainLocker (if wired) |
| `mcpserver.ts` `CallTool` for a foreign tool | No — bridge is not consulted | DomainLocker + SovereignKnock (bypassed stages 2-4 if triad not wired) |
| `mcpserver.ts` `CallTool` for `sovereign_fan_out` | No | NONE |
| Hermes → POG2 via any other path | Unknown | Depends on the path |
| POG2 → `OverflowShim.probe/pick/check` | **Yes** — `inference.overflow_shim` clause honored | Python shim + nvidia-smi |
| POG2 → `TernaryRouter.route()` | **Yes** — `inference.provider_routing` honored | `route()` is the router |
| POG2 → `SovereignConfig.loadConfig()` boot | **Yes** — boot calls `bootPog2Integration()` which loads the bridge | Bridge instantiation logs "POG2 sovereignty: bridge active" |

**The gap:** MCP calls do not consult the bridge. They go straight
through `ToolRegistry.wrapWithSecurity`. The `skill_activation`
clause is honored by *no* inbound surface today.

---

## The six external MCP clients (`POG2-mcp.json`)

The workspace-level MCP config registers six servers that POG2 could
talk to as a client:

| Server | Type | Wired into ToolRegistry? |
|--------|------|--------------------------|
| `pog2-hermes` | stdio → `dist/mcpserver.js` (recursive!) | This is **POG2 calling itself** — the path loops back into the same MCP server. Not a foreign client. |
| `pog2-GitKraken` | stdio → `npx -y @gitkraken/gk mcp` | No |
| `pog2-Cloudflare` | stdio → `@cloudflare/mcp-server-cloudflare` | No |
| `pog2-github` | stdio → `/mnt/c/.claude/.../github/.mcp.json` | No |
| `pog2-linear` | stdio → `/mnt/c/.claude/.../linear/.mcp.json` | No |
| `pog2-terraform` | stdio → `/mnt/c/.claude/.../terraform/.mcp.json` | No |

The `handshake` block on `pog2-hermes` (`identity: "Hermes"`,
`topic: "HERMES"`, `huntgodScope: "Hermes"`, `wslContract: true`) is
a project-specific metadata tag carried on this server only. None
of the other five servers have it. It is not read by POG2 today.

---

## Recommendations (2026-06-21)

**Status as of 2026-06-21 (this commit):** Recommendations 1-4
are now implemented. See the new `src/api/ai/ExteriorGate.ts`
module and the rewritten `src/mcpserver.ts`.

In priority order:

1. **~~Make `mcpserver.ts:CallTool` consult the bridge.~~** Done.
   `mcpserver.ts:301` now calls `gate.check({...})` before every
   `tool.execute()`. The gate composes all four interior gates
   (SovereignKnock + DomainLocker + Pog2HexagramBridge +
   activeLimbs) into a single `GateVerdict` that the MCP layer
   honors: `BLOCK`/`WAIT` returns an MCP error response with the
   per-gate report; `ALLOW` proceeds and attaches the
   `_gateReport` to the result.

2. **~~Strip or gate `sovereign_fan_out`.~~** Done. The synthetic
   tool now routes through `engine.run(args.intent)` behind the
   same gate stack. It is also filtered out of `ListTools` when
   the current hexagram's `activeLimbs` does not include a `forge`
   family limb — fan-out is a generative operation and the
   substrate should not expose it during a withdrawal/structural
   phase.

3. **~~Wire the Handshake Triad in `mcpserver.ts` boot.~~** Done.
   Stages 1-2 (ChromaLimb + BioIntelligenceLimb) wire before
   `engine.initialize()`. Stage 3 (MemoryConsolidationEngine) wires
   after, using the engine's already-bootstrapped instance
   (`engine.getMemoryConsolidationEngine()`) so the nonce map
   shares the same substrate state as the rest of the system.
   The gate-stack health check logs `MCPBridge: gate stack fully
   wired` on success.

4. **Re-route Windows python to WSL python via `wsl.exe -e`.** Done
   on 2026-06-21 (`src/api/ai/OverflowShim.ts:isWSL()` +
   `discoverPython()`). The previous shim would silently degrade when
   POG2 ran from a Windows shell because the inherited Windows
   `python3` could not see `nvidia-smi`. The new shim detects
   platform and routes through `wsl.exe -e python3` as a final
   fallback. Verified end-to-end: `probe()` returns
   `{"freeVramMb": 5594, "tier": "mini", ...}`.

5. **Read `sovereign_rules.yaml` once at MCP server boot** and log
   the active clauses. Done — `SovereignConfig.loadConfig()` does
   this on every `loadConfig(CONFIG_FILE)` call at line 357. The
   `mcpserver.ts` boot calls it before any other subsystem comes up,
   so the bridge is ready by the time the gate stack is built.

6. **Register the six external MCP clients as foreign tools.** When
   SkillsLimb grows an MCP-client assimilation path
   (see SKILLSLIMB_ASSIMILATION_MAP.md), each of those six servers
   becomes an `isForeign=true` tool that automatically inherits the
   SovereignKnock + DomainLocker wrapping from
   `assimilateExternalSkill()`.

---

## Reading order for newcomers

1. `SECURITY_CHAIN.md` — the four interior gates.
2. This document — how those gates meet MCP / Hermes / foreign clients.
3. `SKILLSLIMB_ASSIMILATION_MAP.md` — the slot map for the foreign
   tool surface (the `assimilateExternalSkill` callers).
4. `hermes-agent/config/sovereign_rules.yaml` — the actual contract
   file. Read this once; it's 71 lines.

---

## Future work

- **Composed gates**: make the MCP server's `CallTool` handler consult
  `resolvePermission` *and* the SovereignKnock *and* the active
  hexagram's `activeLimbs`. Today they are independent.
- **Handshake metadata on tool results**: when an MCP `CallTool`
  returns, attach a `gateReport` field listing which gates fired
  (and which were bypassed) so the caller can audit.
- **Operator-facing audit trail**: every `Pog2HexagramBridge`
  verdict should be persisted to `D:/sovereign/logs/pog2_bridge.jsonl`
  with skillId, intent, action, reason, timestamp. Currently logged
  to console only.