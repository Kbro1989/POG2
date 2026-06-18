// Import necessary types and utilities
import { type Result, type EngineOutput, type YaoState, err } from './core/models.js';
import { SovereignDomain, DOMAIN_ADJACENCY } from './types/SovereignDomain.js';
import { createLogger } from "./utils/logger.js";
import { createHash } from 'crypto';
import { performance } from "perf_hooks";
import { DomainLocker } from './routing/DomainLocker.js';

const logger = createLogger('ToolRegistry');

/**
 * Defines the structure for a sovereign tool, including its metadata, domain,
 * and execution parameters. All properties are readonly to ensure immutability
 * once a tool definition is created.
 */
export interface ToolDefinition {
    readonly name: string;
    readonly description: string;
    readonly humanDescription?: string;      // High-level explanation for non-specialists
    readonly jargonDescription?: string;     // Technical, low-level explanation
    readonly idealYaoState?: YaoState;       // Preferred metabolic state for execution
    readonly domain: SovereignDomain;
    readonly category?: 'motor' | 'forge' | 'core';
    readonly isForeign?: boolean;            // Flag indicating this is an assimilated skill from an external source
    readonly minTier?: 'Master' | 'Executive' | 'Reactive'; // Minimum tier required
    readonly requiresConsensus?: boolean;    // Force multi-model for this tool
    readonly backingLimb?: string;            // Explicit limb routing override
    readonly proof?: string;
    readonly parameters: Readonly<Record<string, unknown>>; // Parameters are part of the definition and should be immutable
    readonly execute: (args: Readonly<Record<string, unknown>>) => Promise<Result<EngineOutput>>; // The execution function itself is part of the definition
}

/**
 * ToolRegistry — Sovereign capability substrate with domain scoping.
 * Phase 18: Refined tool organization and category-based filtering.
 * Manages the registration, retrieval, and filtering of ToolDefinitions.
 */
export class ToolRegistry {
    private readonly tools: Map<string, ToolDefinition> = new Map();
    private domainLocker?: DomainLocker;
    private ternaryRouter?: any; // Assume accessible via context or injection
    private hexagramManager?: any;

    public setDomainLocker(dl: DomainLocker): void {
        this.domainLocker = dl;
    }

    public setTernaryRouter(tr: any): void {
        this.ternaryRouter = tr;
    }

    public setHexagramManager(hm: any): void {
        this.hexagramManager = hm;
    }

    private computeStructuralProof(tool: ToolDefinition): string {
        const data = {
            name: tool.name,
            description: tool.description,
            domain: tool.domain,
            category: tool.category,
            parameters: tool.parameters,
            humanDescription: tool.humanDescription,
            jargonDescription: tool.jargonDescription,
            idealYaoState: tool.idealYaoState,
            minTier: tool.minTier,
            requiresConsensus: tool.requiresConsensus,
            backingLimb: tool.backingLimb
        };

        return `sha256:${createHash('sha256').update(JSON.stringify(data)).digest('hex')}`;
    }

    private wrapWithSecurity(tool: ToolDefinition, flags: { isForeign: boolean }): ToolDefinition {
        const originalExecute = tool.execute;
        
        const wrappedExecute = async (args: Readonly<Record<string, unknown>>): Promise<Result<EngineOutput>> => {
            // 1. DomainLocker gate
            if (this.domainLocker) {
                const domainCheck = this.domainLocker.dispatchCheck(tool.name);
                if (domainCheck.action === 'WAIT') {
                    logger.warn({ tool: tool.name, domain: tool.domain, activeDomain: domainCheck.activeDomain }, 'Cross-domain tool execution: dispatch wait expected');
                }
            }
            
            // 2. SovereignKnock for foreign tools
            if (flags.isForeign && this.ternaryRouter) {
                const structuralProof = this.computeStructuralProof(tool);
                const knock = await this.ternaryRouter.sovereignKnock({
                    iChingSequence: this.hexagramManager?.getCurrentSequence() ?? [],
                    chromaticSoul: (this.hexagramManager?.getCurrentSequence() ?? []).join('-') || 'foreign-skill',
                    temporalFingerprint: `${Date.now()}-${tool.name}`,
                    anatomicalProof: { limbCount: 33, structuralIntegrity: 10 },
                    structuralProof
                });
                if (!knock.ok) {
                    logger.warn({
                        tool: tool.name,
                        domain: tool.domain,
                        structuralProof,
                        error: knock.error?.message ?? knock.error
                    }, 'Foreign tool failed SovereignKnock authentication');
                    return err(new Error(`Tool ${tool.name} failed SovereignKnock authentication`));
                }
            }
            
            // 3. Causality logging
            // CNSCausalityLedger.getInstance().record(...) // Assuming singleton exists
            
            // 4. Execute
            try {
                const result = await originalExecute(args);
                return result;
            } catch (e: any) {
                // Apply stun lock on failure if foreign
                if (flags.isForeign) {
                    // this.applyStunLock(tool.name);
                }
                throw e;
            }
        };

        return { ...tool, execute: wrappedExecute };
    }

    /**
     * Register a tool with the sovereign substrate.
     * @param tool The ToolDefinition to register.
     */
    public register(tool: ToolDefinition): void {
        const securedTool = this.wrapWithSecurity(tool, { isForeign: false });
        this.tools.set(securedTool.name, securedTool);
        logger.debug({ tool: securedTool.name, domain: securedTool.domain, category: securedTool.category }, 'Tool registered with security wrapper');
    }

    /**
     * Assimilate a tool from an external skill boundary (e.g. skills.sh).
     * Enforces the isForeign flag for cognitive immunology tracking.
     * @param tool The ToolDefinition to assimilate.
     */
    public assimilateExternalSkill(tool: ToolDefinition): void {
        const securedTool = this.wrapWithSecurity({ ...tool, isForeign: true }, { isForeign: true });
        this.tools.set(securedTool.name, securedTool);
        logger.warn({ tool: securedTool.name, domain: securedTool.domain, category: securedTool.category }, 'Foreign tool assimilated with security wrapping');
    }

    /**
     * Retrieve a tool by name (case-insensitive and format-agnostic).
     * Normalizes the input name and registered tool names for robust lookup.
     * @param name The name of the tool to retrieve.
     * @returns The ToolDefinition if found, otherwise undefined.
     */
    public getTool(name: string): ToolDefinition | undefined {
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
     * @returns An array of all registered ToolDefinitions.
     */
    public getDefinitions(): ToolDefinition[] {
        return Array.from(this.tools.values());
    }

    /**
     * Get tools scoped to a specific domain, including tools from adjacent domains
     * as defined by DOMAIN_ADJACENCY.
     * @param domain The primary domain for which to retrieve tools.
     * @returns An array of ToolDefinitions relevant to the specified domain and its adjacencies.
     */
    public getToolsForDomain(domain: SovereignDomain): ToolDefinition[] {
        const allowedDomains = DOMAIN_ADJACENCY[domain];
        if (!allowedDomains) {
            logger.warn({ domain }, 'No adjacency mapping found for domain. Returning empty array.');
            return [];
        }
        return this.getDefinitions().filter((t: ToolDefinition) => allowedDomains.has(t.domain));
    }

    /**
     * Get tools by a specific category.
     * @param category The category string to filter tools by.
     * @returns An array of ToolDefinitions belonging to the specified category.
     */
    public getToolsByCategory(category: string): ToolDefinition[] {
        return this.getDefinitions().filter((t: ToolDefinition) => t.category === category);
    }

    /**
     * Get formatted definitions for ALL tools (unscoped), suitable for human readability.
     * @returns A string containing a newline-separated list of formatted tool descriptions.
     */
    public getFormattedDefinitions(): string {
        return this.getDefinitions()
            .map((t: ToolDefinition) => `- ${t.name} [${t.domain}${t.category ? `:${t.category}` : ''}]: ${t.description}`)
            .join('\n');
    }

    /**
     * Get formatted definitions scoped to a domain for LLM context.
     * Includes tool name, description, and JSON-stringified parameters.
     * @param domain The domain to scope the formatted definitions to.
     * @returns A string containing a newline-separated list of formatted tool descriptions for LLM consumption.
     */
    public getFormattedDefinitionsForDomain(domain: SovereignDomain): string {
        return this.getToolsForDomain(domain)
            .map((t: ToolDefinition) => `- ${t.name}: ${t.description}. Params: ${JSON.stringify(t.parameters)}`)
            .join('\n');
    }

    /**
     * Get formatted definitions filtered by limb categories (motor/forge/core).
     * Used by OrchestrateEngine to scope tool visibility based on active hexagram state.
     * @param categories The active limb categories from the current HexagramDefinition.
     * @returns A string containing a newline-separated list of formatted tool descriptions.
     */
    public getFormattedDefinitionsForCategories(categories: ReadonlyArray<'motor' | 'forge' | 'core'>): string {
        return this.getDefinitions()
            .filter((t: ToolDefinition) => !t.category || categories.includes(t.category))
            .map((t: ToolDefinition) => `- ${t.name} [${t.domain}:${t.category || 'uncategorized'}]: ${t.description}`)
            .join('\n');
    }

    /**
     * Get the domain for a specific tool.
     * @param toolName The name of the tool.
     * @returns The SovereignDomain of the tool if found, otherwise undefined.
     */
    public getToolDomain(toolName: string): SovereignDomain | undefined {
        return this.getTool(toolName)?.domain;
    }

    /**
     * Get the backing limb for a tool, either explicit or inferred.
     */
    public getBackingLimb(toolName: string): string | undefined {
        const tool = this.getTool(toolName);
        if (tool?.backingLimb) {
            return tool.backingLimb;
        }
        
        // Infer backingLimb from MCP namespaces (e.g., 'gitkraken/git_blame' -> 'GitkrakenLimb')
        if (toolName.includes('/')) {
            const namespace = toolName.split('/')[0];
            return namespace.charAt(0).toUpperCase() + namespace.slice(1) + 'Limb';
        }

        return undefined;
    }

    /**
     * Get all registered tool names.
     * @returns An array of strings, each representing the name of a registered tool.
     */
    public getToolNames(): string[] {
        return Array.from(this.tools.keys());
    }

    public healthCheck(): { online: boolean; details: string } {
        return { online: true, details: "ToolRegistry active and verified." };
    }
}

