import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { ToolRegistry } from "./ToolRegistry.js";
import { ModelClient } from "./clients/ModelClient.js";
import { createLogger } from "./utils/logger.js";
import { TrainingCollector } from "./utils/TrainingCollector.js";
import { CompressionEngine } from "./utils/CompressionEngine.js";
import dotenv from "dotenv";

dotenv.config();

import { loadConfig } from "./config/SovereignConfig.js";
import { TernaryRouter } from "./routing/TernaryRouter.js";
import { Renderer } from "./ui/Renderer.js";
import { OrchestrateEngine } from "./engines/OrchestrateEngine.js";
import { HexagramManager } from "./routing/HexagramManager.js";
import { DomainLocker } from "./routing/DomainLocker.js";
import { getPackageRoot } from "./utils/SovereignPathResolver.js";
import { join } from "path";
import { homedir } from "os";

// ── Handshake Triad limbs (SovereignKnock stages 2/3/4) ───────────────
// Until 2026-06-21 these were never wired in the MCP server boot path,
// which meant stages 2 (chroma), 3 (nonce), and 4 (anatomy) of
// `SovereignKnock` were silently bypassed with WARN logs. This boot
// path now wires them so the four-stage auth actually runs end-to-end.
import { ChromaLimb } from "./limbs/spatial/ChromaLimb.js";
import { BioIntelligenceLimb } from "./limbs/spatial/BioIntelligenceLimb.js";
import { getPog2Bridge } from "./sovereign/Pog2HexagramBridge.js";
import { ExteriorGate, type GateVerdict, summarizeGate } from "./api/ai/ExteriorGate.js";

// Prevent standard logs from polluting stdout, which MCP relies on
const originalConsoleLog = console.log;
console.log = function(...args) { process.stderr.write(args.join(' ') + '\n'); };
console.info = console.log;

const CONFIG_DIR = join(homedir(), '.POG2-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

const logger = createLogger('MCPBridge');
const config = loadConfig(CONFIG_FILE);

// HexagramManager must be instantiated and initialized inside main()
// because TernaryRouter constructor requires it to be fully initialized.

let router: TernaryRouter;
let renderer: Renderer;
let engine: OrchestrateEngine;
let registry: ToolRegistry;
let modelClient: ModelClient;
let domainLocker: DomainLocker;
let gate: ExteriorGate;
let hexagram: HexagramManager;
const training = TrainingCollector.getInstance();
const compressor = CompressionEngine.getInstance();

/**
 * MCP Server implementation for POG2 Sovereign.
 *
 * This bridge allows external orchestrators (Hermes, Antigravity, Claude
 * Code, custom agents) to execute POG2 internal tools and leverage the
 * local Ollama model selection. Every inbound call is gated through the
 * four-gate composition in `src/api/ai/ExteriorGate.ts`:
 *
 *   1. activeLimbs (Hexagram capability)         — Gate 4
 *   2. skill_activation (YAML policy)            — Gate 3
 *   3. domain_locker (cross-domain dispatch)     — Gate 2
 *   4. sovereign_knock (4-stage authentication)  — Gate 1
 *
 * The Handshake Triad (ChromaLimb, MemoryConsolidationEngine,
 * BioIntelligenceLimb) is wired onto the router so stages 2/3/4 of
 * SovereignKnock are not bypassed with WARN. See SECURITY_CHAIN.md
 * and EXTERIOR_HANDSHAKES.md for the gate composition.
 */
async function main() {
  hexagram = new HexagramManager(null, getPackageRoot());
  await hexagram.initialize();

  router = new TernaryRouter(config);

  // ── Handshake Triad wiring (was missing in 2026-06-20 boot) ────────
  // Without these setters, sovereignKnock stages 2/3/4 silently bypass
  // with WARN. Wiring them here makes the full 4-stage auth real.
  // We wire two of the three here; MemoryConsolidationEngine is wired
  // AFTER `engine.initialize()` below because it needs VectorDB + StateManager
  // which the engine constructs during its own boot.
  const chromaLimb = new ChromaLimb(config);
  const bioIntelligence = new BioIntelligenceLimb();
  router.setChromaLimb(chromaLimb);
  router.setBioIntelligence(bioIntelligence);
  logger.info('MCPBridge: Handshake Triad stages 1-2 wired (chroma + bio). Stage 3 (nonce) wired after engine boot.');

  renderer = new Renderer();
  engine = new OrchestrateEngine(config, router, renderer);
  await engine.initialize?.();
  registry = engine.getRegistry();
  modelClient = new ModelClient(config, router);
  domainLocker = engine.getDomainLocker();

  // Stage 3 of the Handshake Triad (nonce / memory consolidation) needs
  // the engine's already-bootstrapped VectorDB + StateManager. Wire it
  // here so SovereignKnock stage 3 stops WARN-bypassing.
  const memoryConsolidation = engine.getMemoryConsolidationEngine();
  router.setMemoryConsolidationEngine(memoryConsolidation);
  logger.info('MCPBridge: Handshake Triad stage 3 (nonce) wired via engine instance');

  // The bridge must be re-initialized now that the engine has finished
  // its async boot (HexagramManager state may have shifted). We rebuild
  // a bridge snapshot with the live hexagram + domain locker.
  gate = new ExteriorGate(router, domainLocker, hexagram, getPog2Bridge());

  const gateHealth = gate.healthCheck();
  if (!gateHealth.ready) {
    logger.warn({ gates: gateHealth.gates }, 'MCPBridge: gate stack partially unwired — see SECURITY_CHAIN.md');
  } else {
    logger.info({ gates: gateHealth.gates }, 'MCPBridge: gate stack fully wired');
  }

  const server = new Server(
    {
      name: "pog2-sovereign-bridge",
      version: "1.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 1. Tool Discovery: Map POG2 ToolRegistry to MCP Tools.
  //    Filtered through the activeLimbs capability gate so foreign MCP
  //    clients only see tools the current hexagram state permits.
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    const startTime = Date.now();
    try {
      const activeLimbs = hexagram.getActiveLimbSet();
      const hexagramId = hexagram.getCurrentHexagramId();
      const allDefinitions = registry.getDefinitions();

      // Apply activeLimbs filter (Gate 4 capability). Tools without a
      // category are always listed (categorical gate is opt-in).
      const definitions = allDefinitions.filter(tool => {
        if (!tool.category) return true;
        return activeLimbs.some(name => {
          const n = name.toLowerCase();
          const cat = tool.category as string;
          if (n.includes(cat)) return true;
          if (cat === 'core' && /Neural|Cache|Substrate|Hexagram|Sovereign/i.test(name)) return true;
          return false;
        });
      });

      // The synthetic `sovereign_fan_out` tool is listed only when
      // 'forge' is in activeLimbs (fan-out is a generative operation).
      const fanOutEnabled = activeLimbs.some(n => n.toLowerCase().includes('forge'));
      const orchestrationTools = fanOutEnabled ? [
        {
          name: "sovereign_fan_out",
          description: "Spawn and orchestrate multiple sub-agents within POG2 to solve a complex task. Subject to the same gate stack as every other tool.",
          parameters: {
            intent: { type: "string", description: "The high-level goal for the sub-agents" },
            context: { type: "string", description: "Additional context or constraints" },
            maxAgents: { type: "number", description: "Maximum number of sub-agents to spawn" }
          }
        }
      ] : [];

      const response = {
        tools: [
          ...definitions.map(tool => ({
            name: tool.name,
            description: tool.description,
            inputSchema: {
              type: "object",
              properties: Object.entries(tool.parameters).reduce((acc, [key, val]) => {
                acc[key] = { type: typeof val === 'string' ? 'string' : 'any' };
                return acc;
              }, {} as Record<string, any>),
              required: Object.keys(tool.parameters),
            },
          })),
          ...orchestrationTools.map(t => ({
            name: t.name,
            description: t.description,
            inputSchema: {
              type: "object",
              properties: Object.entries(t.parameters).reduce((acc, [key, val]) => {
                acc[key] = { type: val.type };
                return acc;
              }, {} as Record<string, any>),
              required: Object.keys(t.parameters),
            }
          }))
        ],
      };

      // INTERCEPT: Record traffic
      const compressedResponse = compressor.compress(response);
      training.recordHistory('tool_used', `MCP_LIST_TOOLS`, {
        payload: compressedResponse,
        hexagramId,
        activeLimbsCount: activeLimbs.length,
        toolsTotal: allDefinitions.length,
        toolsListed: definitions.length
      });

      return response;
    } catch (error: any) {
      training.recordHistory('error', `MCP_LIST_TOOLS_FAILURE`, { error: error.message });
      throw error;
    }
  });

  // 2. Tool Execution: Gate every MCP call through ExteriorGate, then
  //    dispatch to the underlying tool. The `sovereign_fan_out` synthetic
  //    tool routes through `engine.run(intent)` so the gate stack is
  //    real, not a fake "initiated" passthrough.
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const startTime = Date.now();
    const { name, arguments: args } = request.params;

    logger.info({ tool: name, args }, 'MCP Tool Call Received');

    // ── Synthetic orchestration tool: real implementation ────────────
    if (name === "sovereign_fan_out") {
      const intent = (args as any)?.intent;
      if (typeof intent !== 'string' || intent.length === 0) {
        return {
          content: [{ type: "text", text: "sovereign_fan_out requires a non-empty 'intent' string" }],
          isError: true
        };
      }
      // Build a synthetic tool descriptor so the gate has something to
      // evaluate. The tool is marked `isForeign=true` because fan-out
      // crosses the substrate boundary into multi-agent territory.
      // `parameters` is the type-descriptor shape required by ToolDefinition.
      const syntheticTool = {
        name: 'sovereign_fan_out',
        description: 'Spawn and orchestrate multiple sub-agents within POG2',
        domain: 'synthesis' as any,
        category: 'forge' as const,
        isForeign: true,
        parameters: {
          intent: 'string' as any,
          context: 'string' as any,
          maxAgents: 'number' as any
        },
        execute: async (_args: Readonly<Record<string, unknown>>) => {
          const runRes = await engine.run(intent);
          if (runRes.ok) {
            return { ok: true, value: { fanOutResult: runRes.value } } as any;
          }
          return { ok: false, error: runRes.error } as any;
        }
      } as any;

      const gateVerdict = await gate.check({
        tool: syntheticTool,
        intent,
        userOverride: false
      });

      const verdictLog = summarizeGate(gateVerdict);
      logger.info({ verdictLog }, 'MCP fan-out gate verdict');

      if (gateVerdict.action !== 'ALLOW') {
        return {
          content: [{
            type: "text",
            text: `Pog2Gate: ${gateVerdict.action}\n${verdictLog}\nReason: ${gateVerdict.report.find(r => r.action === gateVerdict.action)?.reason ?? 'unspecified'}`
          }],
          isError: true
        };
      }

      try {
        const execRes = await syntheticTool.execute({} as any);
        const out = {
          content: [{
            type: "text",
            text: JSON.stringify({
              ...(execRes as any),
              _gateReport: gateVerdict.report
            }, null, 2)
          }]
        };
        training.recordHistory('tool_used', `MCP_FAN_OUT`, compressor.compress({
          intent, args, output: out, latencyMs: Date.now() - startTime,
          gateReport: gateVerdict.report
        }));
        return out;
      } catch (err: any) {
        training.recordHistory('error', `MCP_FAN_OUT_FAILURE`, compressor.compress({ intent, error: err.message }));
        return {
          content: [{ type: "text", text: `Execution Error: ${err.message}` }],
          isError: true
        };
      }
    }

    // ── Real tool path ──────────────────────────────────────────────
    const tool = registry.getTool(name);
    if (!tool) {
      return {
        content: [{ type: "text", text: `Tool ${name} not found in POG2 registry` }],
        isError: true
      };
    }

    // ── Composed gate check (ExteriorGate) ──────────────────────────
    const gateVerdict = await gate.check({
      tool,
      intent: typeof (args as any)?.intent === 'string' ? (args as any).intent : `MCP call to ${name}`,
      userOverride: (args as any)?.userOverride === true,
      args
    });

    const verdictLog = summarizeGate(gateVerdict);
    logger.info({ verdictLog, isForeign: gateVerdict.isForeign, hexagramId: gateVerdict.hexagramId }, 'MCP gate verdict');

    if (gateVerdict.action !== 'ALLOW') {
      const blocker = gateVerdict.report.find(r => r.action === gateVerdict.action);
      training.recordHistory('error', `MCP_BLOCK_${name.toUpperCase()}`, compressor.compress({
        tool: name, args, gateReport: gateVerdict.report, action: gateVerdict.action
      }));
      return {
        content: [{
          type: "text",
          text: `Pog2Gate: ${gateVerdict.action}\n${verdictLog}\nBlocker: ${blocker?.gate}\nReason: ${blocker?.reason ?? 'unspecified'}`
        }],
        isError: true
      };
    }

    // ── Gate cleared — execute the tool ─────────────────────────────
    try {
      const toolResult = await tool.execute(args as Readonly<Record<string, unknown>>);
      const result = {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              ...(toolResult as any),
              _gateReport: gateVerdict.report
            }, null, 2),
          },
        ],
      };

      // INTERCEPT: Route to TrainingCollector via CompressionEngine
      const interceptData = {
        tool: name,
        args,
        output: result.content,
        latencyMs: Date.now() - startTime,
        success: true,
        gateReport: gateVerdict.report
      };
      training.recordHistory(
        'tool_used',
        `MCP_CALL_${name.toUpperCase()}`,
        compressor.compress(interceptData)
      );
      return result;
    } catch (error: any) {
      logger.error({ error }, 'Tool execution failed');

      training.recordHistory(
        'error',
        `MCP_CALL_${name.toUpperCase()}_FAILURE`,
        compressor.compress({ args, error: error.message, gateReport: gateVerdict.report })
      );

      return {
        content: [
          {
            type: "text",
            text: `Execution Error: ${error.message}`,
          },
        ],
        isError: true,
      };
    }
  });

  // Start transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
  logger.info('POG2 MCP Bridge connected via stdio');
}

main().catch((error) => {
  logger.error({ error }, 'Fatal MCP Server Error');
  process.exit(1);
});
