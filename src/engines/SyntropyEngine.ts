import { readFileSync, existsSync, readdirSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import type { SovereignConfig } from '../config/SovereignConfig.js';
import type { Result } from '../core/models.js';
import { ok, err } from '../core/models.js';
import { getSovereignRoot, PathTier } from '../utils/SovereignPathResolver.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('SyntropyEngine');

export interface ClaudeHistoryEntry {
    display: string;
    timestamp: number;
    project?: string;
    sessionId?: string;
}

export interface GuestPersona {
    name: string;
    description: string;
    instructions: string;
    model?: string;
}

export interface ExternalExtension {
    name: string;
    path: string;
    type: 'mcp' | 'custom';
}

/**
 * SyntropyEngine
 * 
 * Harmonizes metadata from external AI environments (.claude, .gemini).
 * Transforms "dead" metadata into active Sovereign context.
 */
export class SyntropyEngine {
    private readonly claudeDir: string;
    private readonly geminiExtensionsDir: string;
    private readonly vscodeDir: string;

    constructor(private readonly config: SovereignConfig) {
        // Phase 107.5: Use SovereignRoot (Default to Home tier which is now project-relative)
        const root = getSovereignRoot(PathTier.Home);
        this.claudeDir = join(root, 'guest', '.claude');
        this.geminiExtensionsDir = join(root, 'guest', '.gemini', 'extensions');
        this.vscodeDir = join(root, 'guest', '.vscode');

        // Fallback checks and directory creation handled by resolver normally, 
        // but we ensure these specific guest paths exist.
        if (!existsSync(this.claudeDir)) mkdirSync(this.claudeDir, { recursive: true });
        if (!existsSync(this.geminiExtensionsDir)) mkdirSync(this.geminiExtensionsDir, { recursive: true });
        if (!existsSync(this.vscodeDir)) mkdirSync(this.vscodeDir, { recursive: true });

        logger.info({ claude: this.claudeDir, gemini: this.geminiExtensionsDir, vscode: this.vscodeDir }, 'SyntropyEngine initialized');
    }

    /**
     * ingestClaudeHistory - Parses the history.jsonl file for memetic continuity.
     */
    async ingestClaudeHistory(limit: number = 20): Promise<Result<ClaudeHistoryEntry[]>> {
        const historyPath = join(this.claudeDir, 'history.jsonl');
        if (!existsSync(historyPath)) {
            return err(new Error());
        }

        try {
            const content = readFileSync(historyPath, 'utf8');
            const lines = content.split('\n').filter(l => l.trim());
            const history = lines
                .map(l => JSON.parse(l) as ClaudeHistoryEntry)
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limit);

            return ok(history);
        } catch (e) {
            return err(new Error());
        }
    }

    /**
     * listGuestPersonas - Discovers agent definitions in .claude/agents.
     */
    async listGuestPersonas(): Promise<Result<GuestPersona[]>> {
        const agentsDir = join(this.claudeDir, 'agents');
        if (!existsSync(agentsDir)) {
            return err(new Error());
        }

        try {
            const files = readdirSync(agentsDir).filter(f => f.endsWith('.md'));
            const personas: GuestPersona[] = [];

            for (const file of files) {
                const content = readFileSync(join(agentsDir, file), 'utf8');
                const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

                if (frontmatterMatch) {
                    const yaml = frontmatterMatch[1];
                    const nameMatch = yaml.match(/name:\s*(.*)/);
                    const descMatch = yaml.match(/description:\s*(.*)/);
                    const modelMatch = yaml.match(/model:\s*(.*)/);

                    personas.push({
                        name: nameMatch ? nameMatch[1].trim() : file.replace('.md', ''),
                        description: descMatch ? descMatch[1].trim() : '',
                        instructions: content.replace(frontmatterMatch[0], '').trim(),
                        model: modelMatch ? modelMatch[1].trim() : undefined
                    });
                }
            }

            return ok(personas);
        } catch (e) {
            return err(new Error());
        }
    }

    /**
     * discoverExtensions - Maps .gemini/extensions to MCP substrates.
     */
    async discoverExtensions(): Promise<Result<ExternalExtension[]>> {
        if (!existsSync(this.geminiExtensionsDir)) {
            return err(new Error());
        }

        try {
            const items = readdirSync(this.geminiExtensionsDir, { withFileTypes: true });
            const extensions: ExternalExtension[] = items
                .filter(i => i.isDirectory())
                .map(i => ({
                    name: i.name,
                    path: join(this.geminiExtensionsDir, i.name),
                    type: 'mcp' // Assuming MCP based on structure
                }));

            return ok(extensions);
        } catch (e) {
            return err(new Error());
        }
    }

    /**
     * ingestTodos - Reads the latest session todos.
     */
    async ingestTodos(): Promise<Result<any[]>> {
        const todosDir = join(this.claudeDir, 'todos');
        if (!existsSync(todosDir)) {
            return err(new Error());
        }

        try {
            const files = readdirSync(todosDir).filter(f => f.endsWith('.json'));
            let allTodos: any[] = [];

            for (const file of files) {
                const content = JSON.parse(readFileSync(join(todosDir, file), 'utf8'));
                if (Array.isArray(content)) {
                    allTodos = allTodos.concat(content);
                }
            }

            return ok(allTodos);
        } catch (e) {
            return err(new Error());
        }
    }

    /**
     * discoverVscodeExtensions - Parses VS Code extensions.json to map active tools.
     */
    async discoverVscodeExtensions(): Promise<Result<any[]>> {
        const vscodeExtPath = join(this.vscodeDir, 'extensions', 'extensions.json');
        if (!existsSync(vscodeExtPath)) {
            logger.warn(`VS Code extensions.json not found at ${vscodeExtPath}`);
            return err(new Error());
        }

        try {
            const content = JSON.parse(readFileSync(vscodeExtPath, 'utf8'));
            return ok(content);
        } catch (e) {
            logger.error(e, 'Failed to parse VS Code extensions');
            return err(new Error());
        }
    }

    /**
     * ingestVscodeArgv - Reads argv.json for runtime flags.
     */
    async ingestVscodeArgv(): Promise<Result<any>> {
        const argvPath = join(this.vscodeDir, 'argv.json');
        if (!existsSync(argvPath)) {
            logger.warn(`VS Code argv.json not found at ${argvPath}`);
            return err(new Error());
        }

        try {
            const content = readFileSync(argvPath, 'utf8').replace(/\/\/.*$/gm, '');
            return ok(JSON.parse(content));
        } catch (e) {
            logger.error(e, 'Failed to parse VS Code argv');
            return err(new Error());
        }
    }

    /**
     * mapIdeSynergy - Synthesizes a summary of IDE Presence.
     */
    async mapIdeSynergy(): Promise<Result<string>> {
        const res = await this.discoverVscodeExtensions();
        if (!res.ok) return res as any;

        const extensions = (res.value as any[]).filter(e => e && e.identifier && e.identifier.id);

        const aiTools = [...new Set(extensions
            .filter((e: any) => e.identifier.id.toLowerCase().includes('copilot') ||
                e.identifier.id.toLowerCase().includes('gemini') ||
                e.identifier.id.toLowerCase().includes('continue'))
            .map((e: any) => e.identifier.id.split('.').pop()))];

        const cloudTools = [...new Set(extensions
            .filter((e: any) => e.identifier.id.toLowerCase().includes('cloudflare') ||
                e.identifier.id.toLowerCase().includes('azure') ||
                e.identifier.id.toLowerCase().includes('googlecloud'))
            .map((e: any) => e.identifier.id.split('.').pop()))];

        return ok(`AI Stack: ${aiTools.join(', ') || 'None detected'} | Cloud Stack: ${cloudTools.join(', ') || 'None detected'}`);
    }

    public healthCheck(): { online: boolean; details: string } {
        const claudeExists = existsSync(this.claudeDir);
        const geminiExists = existsSync(this.geminiExtensionsDir);
        const vscodeExists = existsSync(this.vscodeDir);

        return {
            online: claudeExists || geminiExists || vscodeExists,
            details: `Substrates: Claude(${claudeExists}), Gemini(${geminiExists}), VSCode(${vscodeExists})`
        };
    }
}
