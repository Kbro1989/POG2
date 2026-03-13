import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import pino from 'pino';
import type { Result, EngineOutput, MCPToolResult, MCPContent } from '../core/models.js';
import { SovereignDomain } from '../types/SovereignDomain.js';
import type { ToolRegistry } from '../ToolRegistry.js';
import type { SovereignConfig } from '../config/SovereignConfig.js';

const logger = pino({ name: 'MCPEngine', base: { hostname: 'POG2' } });

interface MCPServerConfig {
    command: string;
    args: string[];
    env?: Record<string, string>;
}

/**
 * MCPEngine - Universal Model Context Protocol Bridge
 */
export class MCPEngine {
    private readonly clients: Map<string, Client> = new Map();

    constructor(
        private readonly config: SovereignConfig,
        private readonly registry: ToolRegistry
    ) { }

    /**
     * Discovery: Loads POG2-mcp.json and bridges all defined servers.
     */
    public async initialize(): Promise<void> {
        const configPath = join(process.cwd(), 'POG2-mcp.json');
        if (!existsSync(configPath)) {
            logger.info('No POG2-mcp.json found. MCP bridge inactive.');
            return;
        }

        try {
            const mcpConfig = JSON.parse(readFileSync(configPath, 'utf8'));
            const servers = mcpConfig.mcpServers || {};

            for (const [name, config] of Object.entries(servers)) {
                await this.connectToServer(name, config as MCPServerConfig);
            }
        } catch (e) {
            logger.error({ error: (e as Error).message }, 'Failed to initialize MCP servers');
        }
    }

    private async connectToServer(name: string, config: MCPServerConfig): Promise<void> {
        logger.info({ server: name }, 'ðŸ”Œ Engaging MCP Neural Link...');

        try {
            const transport = new StdioClientTransport({
                command: config.command,
                args: config.args || [],
                env: { ...process.env, ...config.env } as Record<string, string>
            });

            const client = new Client(
                { name: "POG2-cli", version: "1.1.2" },
                { capabilities: { tools: {} } } as Record<string, unknown>
            );

            await client.connect(transport);
            this.clients.set(name, client);

            const toolsRes = await client.listTools();
            const tools = toolsRes.tools || [];

            for (const t of tools) {
                this.registry.register({
                    name: `mcp_${name}_${t.name}`,
                    description: `[MCP:${name}] ${t.description}`,
                    domain: SovereignDomain.SYSTEM,
                    parameters: t.inputSchema as Record<string, unknown>,
                    execute: async (args): Promise<Result<EngineOutput>> => {
                        try {
                            const result = await client.callTool({
                                name: t.name,
                                arguments: args
                            }) as unknown as MCPToolResult;

                            if (result.isError) {
                                const errorText = result.content.map((c: MCPContent) => c.text || JSON.stringify(c)).join('\n');
                                return { ok: false, error: new Error(errorText) };
                            }

                            const output = result.content.map((c: MCPContent) => c.text || JSON.stringify(c)).join('\n') || 'Success';
                            return { ok: true, value: { output, data: { mcpContent: result.content } } };
                        } catch (err) {
                            return { ok: false, error: err as Error };
                        }
                    }
                });
            }

            logger.info({ server: name, tools: tools.length }, 'âœ… MCP Neural Link Synchronized');
        } catch (err) {
            logger.error({ server: name, error: (err as Error).message }, 'âŒ MCP Neural Link Failure');
        }
    }

    public async close(): Promise<void> {
        for (const [name, client] of this.clients.entries()) {
            try {
                await client.close();
                logger.debug({ server: name }, 'MCP Link offline');
            } catch (e) {
                logger.error({ server: name, error: (e as Error).message }, 'Failed to close MCP link');
            }
        }
        this.clients.clear();
    }
}
