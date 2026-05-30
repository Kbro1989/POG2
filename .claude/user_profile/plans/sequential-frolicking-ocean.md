# Plan: Ollama-Antigravity MCP Bridge

## Context
The goal is to create a bridge between the POG2 Sovereign engine and the Antigravity AI framework. This allows the Antigravity orchestrator (the "Brain") to treat POG2 as a powerful MCP server, giving it access to POG2's internal tools, local Ollama model selection, and specialized capabilities.

## Implementation Approach

### 1. Environment Configuration (`D:\pog2\.env`)
Expand the neural model definitions to ensure all high-performance local models are available for the bridge.
- Verify and add missing models from `ollama_list.txt` to the `.env` file.
- Add `ANTIGRAVITY_WS_PORT=8788` and `ANTIGRAVITY_API_ROOT=http://127.0.0.1:8788` for explicit connection management.

### 2. MCP Server Implementation (`D:\pog2\src\mcpserver.ts`)
Create a new MCP server that exposes POG2's internal capabilities.
- **SDK**: Use `@modelcontextprotocol/sdk`.
- **Tool Mapping**: 
    - Import `ToolRegistry` from `D:\pog2\src\ToolRegistry.ts`.
    - Dynamically generate MCP tool definitions by iterating over `ToolRegistry.allTools`.
    - Map MCP `callTool` requests to `ToolRegistry.getTool(name).execute(args)`.
- **Model Integration**:
    - Integrate with `ModelClient.ts` and `ModelRolodex.ts` so the MCP server can use the same resilient call logic and model reputation system as the rest of POG2.
- **Server Lifecycle**: Implement a standard MCP stdio or WebSocket transport to allow `language_server.exe` to connect.

### 3. Tool Registry Bridge logic
- Create a translation layer that converts POG2 `ToolDefinition` (name, description, domain, execute) $\rightarrow$ MCP `Tool` (name, description, inputSchema).
- Since POG2 tools often use `Record<string, unknown>`, implement a basic Zod-based schema generator or a generic JSON schema for the MCP bridge.

### 4. Verification Plan
- **Connectivity**: Start `mcpserver.ts` and verify the Antigravity orchestrator detects the new MCP server.
- **Tool Execution**: Execute a POG2-specific tool (e.g., a filesystem or cache search) via an Antigravity prompt.
- **Model Routing**: Verify that calling a "Reasoning" tool through the bridge correctly triggers the `POG2_PLANNING_MODEL` from `.env`.

## Critical Files
- `D:\pog2\.env`
- `D:\pog2\src\mcpserver.ts` (New)
- `D:\pog2\src\ToolRegistry.ts`
- `D:\pog2\src\clients\ModelClient.ts`
- `D:\pog2\src\api\ai\ModelRolodex.ts`
