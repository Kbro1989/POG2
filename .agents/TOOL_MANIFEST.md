# POG2 Sovereign Tool Registry Manifest

This manifest documents the authoritative tool-call interface for the POG2 cognitive substrate. External AI agents (Claude/Gemini/VS Code) must use these signatures to ensure memetic and operational continuity.

## Sovereign Limb Capabilities

### 1. Infrastructure & Deployment (Wrangler/GCloud)
- `gcloud_exec`: Execute raw Google Cloud CLI commands.
- `wrangler_deploy`: Deploy a Cloudflare worker.
- `wrangler_kv_list`: List KV namespaces.
- `wrangler_r2_list`: List R2 buckets.

### 2. Local AI & Inference (Ollama)
- `ollama_model_list`: Enumerate locally available models.
- `ollama_run`: Trigger model inference.

### 3. Intelligence Harmony (Syntropy)
- `consult_syntropy`: Query external metadata (.claude/.gemini).
- `syntropy_harmonize`: Deep-sync with external agent environments.
- `syntropy_ingest_history`: Import Claude/Gemini CLI logs.
- `syntropy_list_personas`: Discover guest AI definitions.

### 4. System Diagnostics (MCP)
- `mcp_client_status`: Check health of Model Context Protocol links.
- `service_status`: Aggregated health check of internal engines.

---
*Note: Agents must adhere to the POG-Vibe interaction rules defined in `.agents/rules/pogrules.md` when invoking these functions.*
