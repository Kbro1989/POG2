import pino from 'pino';
import { type Result, type EngineOutput, YaoState } from './core/models.js';
import { SovereignDomain, DOMAIN_ADJACENCY } from './types/SovereignDomain.js';

const logger = pino({ name: 'ToolRegistry', base: { hostname: 'POG2' } });

export interface ToolDefinition {
    name: string;
    description: string;
    humanDescription?: string;      // High-level explanation for non-specialists
    jargonDescription?: string;     // Technical, low-level explanation
    idealYaoState?: YaoState;       // Preferred metabolic state for execution
    domain: SovereignDomain;
    category?: 'core' | 'filesystem' | 'network' | 'ai' | 'mcp' | 'sensory' | 'forge' | 'literary' | 'creative' | 'vscode';
    parameters: Record<string, unknown>;
    execute: (args: Record<string, unknown>) => Promise<Result<EngineOutput>>;
}

/**
 * ToolRegistry â€” Sovereign capability substrate with domain scoping.
 * Phase 18: Refined tool organization and category-based filtering.
 */
export class ToolRegistry {
    private readonly tools: Map<string, ToolDefinition> = new Map();

    /**
     * Register a tool with the sovereign substrate.
     */
    register(tool: ToolDefinition): void {
        this.tools.set(tool.name, tool);
        logger.debug({ tool: tool.name, domain: tool.domain, category: tool.category }, 'Tool registered');
    }

    /**
     * Retrieve a tool by name (case-insensitive and format-agnostic).
     */
    getTool(name: string): ToolDefinition | undefined {
        const exact = this.tools.get(name);
        if (exact) return exact;

        const normalized = name.toLowerCase().replace(/[_-\s]/g, '');
        for (const [key, tool] of this.tools.entries()) {
            if (key.toLowerCase().replace(/[_-\s]/g, '') === normalized) {
                return tool;
            }
        }
        return undefined;
    }

    /**
     * Get all registered tool definitions.
     */
    getDefinitions(): ToolDefinition[] {
        return Array.from(this.tools.values());
    }

    /**
     * Get tools scoped to a specific domain (including adjacent domains).
     */
    getToolsForDomain(domain: SovereignDomain): ToolDefinition[] {
        const allowedDomains = DOMAIN_ADJACENCY[domain];
        if (!allowedDomains) {
            logger.warn({ domain }, 'No adjacency mapping found for domain');
            return [];
        }
        return this.getDefinitions().filter(t => allowedDomains.has(t.domain));
    }

    /**
     * Get tools by category.
     */
    getToolsByCategory(category: string): ToolDefinition[] {
        return this.getDefinitions().filter(t => t.category === category);
    }

    /**
     * Get formatted definitions for ALL tools (unscoped).
     */
    getFormattedDefinitions(): string {
        return this.getDefinitions()
            .map(t => `- ${t.name} [${t.domain}${t.category ? `:${t.category}` : ''}]: ${t.description}`)
            .join('\n');
    }

    /**
     * Get formatted definitions scoped to a domain for LLM context.
     */
    getFormattedDefinitionsForDomain(domain: SovereignDomain): string {
        return this.getToolsForDomain(domain)
            .map(t => `- ${t.name}: ${t.description}. Params: ${JSON.stringify(t.parameters)}`)
            .join('\n');
    }

    /**
     * Get the domain for a specific tool.
     */
    getToolDomain(toolName: string): SovereignDomain | undefined {
        return this.getTool(toolName)?.domain;
    }

    /**
     * Get all registered tool names.
     */
    getToolNames(): string[] {
        return Array.from(this.tools.keys());
    }
}
