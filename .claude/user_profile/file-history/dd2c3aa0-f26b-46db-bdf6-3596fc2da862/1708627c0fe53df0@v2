# End-to-End MCP and Environment Synchronization Plan

## Context
The POG2 substrate relies on a distributed configuration system where `.env` files provide the core secrets and `POG2-mcp.json` defines the MCP server topology. Recent changes introduced a `hello-claude-` prefix to MCP server keys. An audit has revealed a critical discrepancy in the `CLOUDFLARE_ACCOUNT_ID` between the "Absolute Source of Truth" (`.env`) and the MCP configuration. Furthermore, the `POG2-mcp.json` file contains escaped quotes that complicate standard JSON parsing and edits.

The goal is to harmonize these configurations to ensure that MCP tool namespacing is consistent and that all servers are initialized with the correct credentials.

## Critical Files
- `D:\pog2\.env` (Source of Truth for credentials)
- `D:\pog2\POG2-mcp.json` (MCP server definitions)
- `D:\pog2\src\engines\MCPEngine.ts` (Configuration loader and tool registrar)
- `D:\pog2\src\config\SovereignConfig.ts` (Environment variable manager)

## Implementation Approach

### 1. Credential Synchronization
The `CLOUDFLARE_ACCOUNT_ID` in `POG2-mcp.json` does not match the one in `.env`. 
- **Action**: Update `POG2-mcp.json` to use the value from `.env` (`6872653edcee9c791787c1b783173793`).

### 2. Tool Namespace Audit
Renaming servers to `hello-claude-X` changes the generated tool names from `mcp_X_tool` to `mcp_hello-claude-X_tool`.
- **Action**: Search the codebase for any hardcoded references to `mcp_GitKraken_`, `mcp_Cloudflare_`, or `mcp_Ollama_` to ensure no existing orchestration logic is broken.

### 3. JSON Normalization
`POG2-mcp.json` currently uses escaped quotes (e.g., `\"mcpServers\"`), which is non-standard for a `.json` file and likely represents a stringified JSON object saved as a file.
- **Action**: While the user requested precision edits, I will verify if the system expects this escaped format. Since `MCPEngine.ts` uses `JSON.parse(readFileSync(configPath, 'utf8'))`, standard JSON (unescaped) is the expected format. I will normalize the file to standard JSON to prevent future parsing errors.

### 4. End-to-End Variable Validation
Ensure all environment variables required by MCP servers in `POG2-mcp.json` are present in `.env` to avoid relying on brittle overrides within the JSON.

## Verification Plan
1. **Manual Verification**: Run `cat POG2-mcp.json` and `.env` side-by-side to confirm account IDs match.
2. **Functional Verification**: 
   - Start the POG2 orchestrator.
   - Use the `mcp_client_status` tool (or similar) to verify that the MCP servers are connected.
   - Call a tool from each renamed server (GitKraken, Cloudflare, Ollama) to confirm the new `mcp_hello-claude-` namespace is functioning.
3. **Log Audit**: Check `POG2_LOG_PRETTY=1` output for any `MCP Bridge` connection errors during initialization.
