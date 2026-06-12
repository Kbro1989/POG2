import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import type { Intent, Result, Execution, TernaryDecision, EngineOutput } from '../../core/models.js';
import { ok, err } from '../../core/models.js';
import type { NeuralLimb } from '../core/NeuralLimb.js';
import type { ToolRegistry, ToolDefinition } from '../../ToolRegistry.js';
import { SovereignDomain } from '../../types/SovereignDomain.js';
import { createLogger } from '../../utils/logger.js';

const execAsync = promisify(exec);
const logger = createLogger('SkillsLimb');

// =============================================================================
// TYPES
// =============================================================================

/** Full representation of an assimilated skill — not just a label. */
export interface AssimilatedSkill {
    /** Skill name from frontmatter */
    name: string;
    /** Skill description from frontmatter */
    description: string;
    /** The full markdown instruction body (everything below the --- frontmatter ---) */
    instructions: string;
    /** Absolute path to the skill root directory */
    skillDir: string;
    /** Paths to reference documentation files */
    referenceDocs: string[];
    /** Paths to executable scripts */
    scripts: string[];
    /** Paths to example files */
    examples: string[];
    /** All other auxiliary files (themes, schemas, assets) */
    auxiliaryFiles: string[];
    /** Raw frontmatter key-value pairs beyond name/description */
    metadata: Record<string, string>;
}

// =============================================================================
// SKILLS LIMB
// =============================================================================

/**
 * SkillsLimb: The protocol boundary for external agent skills.
 * 
 * Ingests the FULL skill — instructions, reference docs, scripts, examples —
 * not just the YAML label. Each skill becomes a real tool in the ToolRegistry
 * that can serve its instruction body and knows where its scripts live.
 */
export class SkillsLimb implements NeuralLimb {
    public id = 'SkillsLimb';
    public type = 'system' as const;
    public capabilities = ['ingest_external_skill', 'assimilate_tool', 'protocol_boundary', 'skill_query'];
    
    public preferredHexagrams = ['21', '22', '23']; // Biting Through, Grace, Splitting Apart

    private registry: ToolRegistry;
    /** In-memory catalog of every assimilated skill with full content */
    private skillCatalog: Map<string, AssimilatedSkill> = new Map();

    constructor(registry: ToolRegistry) {
        this.registry = registry;
    }

    // =========================================================================
    // NeuralLimb interface
    // =========================================================================

    public async canHandle(intent: Intent): Promise<TernaryDecision> {
        const q = intent.query?.toLowerCase() ?? '';
        if (q.includes('ingest') || q.includes('assimilate') || q.includes('add_skill') || q.includes('skill')) {
            return { logic: 1, reasoning: 'SkillsLimb handles skill ingestion and queries.' };
        }
        return { logic: -1, reasoning: 'Not a skill-related intent.' };
    }

    public async execute(intent: Intent): Promise<Result<Execution>> {
        // Extract repo URL from the query string
        const repoMatch = intent.query.match(/(https?:\/\/\S+|[\w-]+\/[\w-]+)/)
        const repoUrl = repoMatch?.[1];
        if (!repoUrl) {
            return err(new Error('repoUrl is required to ingest a skill. Include a URL or owner/repo in the query.'));
        }

        try {
            logger.info({ repoUrl }, 'SkillsLimb: Commencing ingestion of external skill.');
            
            const cliPath = path.resolve(process.cwd(), 'skills/src/cli.ts');
            if (!fs.existsSync(cliPath)) {
                return err(new Error('Sovereign skills CLI not found at expected path.'));
            }

            // Use skills.sh CLI with antigravity agent type (we're a first-class citizen!)
            const command = `npx tsx "${cliPath}" add "${repoUrl}" -a antigravity --copy -y`;
            logger.debug({ command }, 'Executing ingestion command');
            const { stdout, stderr } = await execAsync(command, { cwd: process.cwd() });
            logger.info({ stdout, stderr }, 'Skill ingestion CLI execution complete.');

            // Scan the download target for new skills
            const skillsDir = path.resolve(process.cwd(), '.agents/skills');
            if (!fs.existsSync(skillsDir)) {
                return err(new Error('Skills directory not found post-ingestion.'));
            }

            const assimilated = this.scanAndAssimilateDirectory(skillsDir);

            return ok({
                tool: 'SkillsLimb',
                output: `Ingested ${assimilated.length} skills: ${assimilated.map(s => s.name).join(', ')}`,
                success: true,
                metadata: {
                    skills: assimilated.map(s => ({
                        name: s.name,
                        instructionLength: s.instructions.length,
                        referenceDocs: s.referenceDocs.length,
                        scripts: s.scripts.length,
                        examples: s.examples.length,
                        auxiliaryFiles: s.auxiliaryFiles.length
                    }))
                }
            });
        } catch (error: any) {
            logger.error({ error: error.message }, 'SkillsLimb ingestion failed.');
            return err(new Error(error.message));
        }
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    /** Get the full catalog of assimilated skills */
    public getCatalog(): Map<string, AssimilatedSkill> {
        return this.skillCatalog;
    }

    /** Get a specific skill by name */
    public getSkill(name: string): AssimilatedSkill | undefined {
        return this.skillCatalog.get(name);
    }

    /** Get a skill's full instruction body for context injection */
    public getSkillInstructions(name: string): string | undefined {
        return this.skillCatalog.get(name)?.instructions;
    }

    /** Read a specific reference doc from a skill */
    public readSkillReference(skillName: string, refFileName: string): string | undefined {
        const skill = this.skillCatalog.get(skillName);
        if (!skill) return undefined;
        const refPath = skill.referenceDocs.find(r => r.endsWith(refFileName));
        if (refPath && fs.existsSync(refPath)) {
            return fs.readFileSync(refPath, 'utf8');
        }
        return undefined;
    }

    /**
     * Bootstraps ALL local skills directories into the ToolRegistry.
     * This is the real ingestion — reads full content, catalogs everything.
     */
    public bootstrapLocalSkills(): void {
        const pathsToScan = [
            path.resolve(process.cwd(), '.agents/skills'),
            path.resolve(process.cwd(), '.claude/user_profile/plugins/marketplaces/claude-plugins-official/plugins'),
            path.resolve(process.cwd(), '.claude/user_profile/plugins/marketplaces/claude-plugins-official/external_plugins'),
            path.resolve(process.cwd(), 'anthropic-skills/skills')
        ];

        let totalAssimilated = 0;

        for (const scanPath of pathsToScan) {
            if (!fs.existsSync(scanPath)) continue;
            const assimilated = this.scanAndAssimilateDirectory(scanPath);
            totalAssimilated += assimilated.length;
        }

        logger.info({
            totalAssimilated,
            catalogSize: this.skillCatalog.size,
            skills: Array.from(this.skillCatalog.keys())
        }, 'SkillsLimb local bootstrap completed.');
    }

    // =========================================================================
    // PRIVATE — Parsing & Ingestion
    // =========================================================================

    /**
     * Scans a directory for skill folders and assimilates each one fully.
     */
    private scanAndAssimilateDirectory(dirPath: string): AssimilatedSkill[] {
        const assimilated: AssimilatedSkill[] = [];
        if (!fs.existsSync(dirPath)) return assimilated;

        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        for (const entry of entries) {
            if (!entry.isDirectory()) continue;
            const folderPath = path.join(dirPath, entry.name);

            // Find SKILL.md — check multiple possible locations
            const skillMdPath = this.findSkillMd(folderPath);
            if (!skillMdPath) continue;

            const skill = this.ingestSkillFully(skillMdPath, folderPath);
            if (skill) {
                // Avoid duplicates — later scan paths override earlier ones
                this.skillCatalog.set(skill.name, skill);
                this.registerSkillAsTool(skill);
                assimilated.push(skill);
            }
        }
        return assimilated;
    }

    /**
     * Find SKILL.md within a folder, checking multiple possible nesting patterns.
     */
    private findSkillMd(folderPath: string): string | null {
        const candidates = [
            path.join(folderPath, 'SKILL.md'),
            path.join(folderPath, 'skills', 'SKILL.md'),
        ];

        // Also check for nested skill folders (e.g. plugin/skills/skill-name/SKILL.md)
        const skillsSubdir = path.join(folderPath, 'skills');
        if (fs.existsSync(skillsSubdir) && fs.statSync(skillsSubdir).isDirectory()) {
            try {
                const subEntries = fs.readdirSync(skillsSubdir, { withFileTypes: true });
                for (const sub of subEntries) {
                    if (sub.isDirectory()) {
                        candidates.push(path.join(skillsSubdir, sub.name, 'SKILL.md'));
                    }
                }
            } catch { /* permission errors, etc */ }
        }

        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) return candidate;
        }
        return null;
    }

    /**
     * Fully ingest a single skill — parse frontmatter, read instruction body,
     * catalog all reference docs, scripts, and examples.
     */
    private ingestSkillFully(skillMdPath: string, skillDir: string): AssimilatedSkill | null {
        const raw = fs.readFileSync(skillMdPath, 'utf8');
        const parsed = this.parseFrontmatterFull(raw);
        if (!parsed || !parsed.name) return null;

        // The skill root is the directory containing SKILL.md
        const skillRoot = path.dirname(skillMdPath);

        // Catalog all auxiliary files by type
        const referenceDocs = this.collectFiles(path.join(skillRoot, 'reference'));
        const scripts = this.collectFiles(path.join(skillRoot, 'scripts'));
        const examples = this.collectFiles(path.join(skillRoot, 'examples'));

        // Collect everything else that isn't SKILL.md, LICENSE, or already cataloged
        const allFiles = this.collectFiles(skillRoot);
        const knownPaths = new Set([
            skillMdPath,
            ...referenceDocs,
            ...scripts,
            ...examples
        ]);
        const auxiliaryFiles = allFiles.filter(f =>
            !knownPaths.has(f) &&
            !path.basename(f).startsWith('LICENSE') &&
            !path.basename(f).startsWith('.')
        );

        const skill: AssimilatedSkill = {
            name: parsed.name,
            description: parsed.description,
            instructions: parsed.body,
            skillDir: skillRoot,
            referenceDocs,
            scripts,
            examples,
            auxiliaryFiles,
            metadata: parsed.extraMeta
        };

        logger.debug({
            skill: skill.name,
            instructionChars: skill.instructions.length,
            refs: referenceDocs.length,
            scripts: scripts.length,
            examples: examples.length,
            aux: auxiliaryFiles.length
        }, 'Skill fully ingested');

        return skill;
    }

    /**
     * Register a fully-ingested skill as a ToolDefinition in the ToolRegistry.
     * The execute function serves the real instruction body + file manifest.
     */
    private registerSkillAsTool(skill: AssimilatedSkill): void {
        const toolDef: ToolDefinition = {
            name: skill.name,
            description: skill.description || `Assimilated skill: ${skill.name}`,
            domain: SovereignDomain.SYSTEM,
            category: 'core',
            parameters: {
                instruction: { type: 'string', description: 'What to do with this skill.' },
                query: { type: 'string', description: 'Optional: query a specific reference doc or script by filename.' },
                run: { type: 'boolean', description: 'If true, execute the primary script of this skill and return structured output.' },
                domain: { type: 'string', description: 'Optional domain scope for diagnostic skills (e.g. engines, routing, limbs, core).' }
            },
            execute: async (args): Promise<Result<EngineOutput>> => {
                logger.info({ skill: skill.name, args }, 'Executing assimilated skill.');

                const query = args.query as string | undefined;

                // If they're asking for a specific reference doc or script, serve it
                if (query) {
                    const refContent = this.resolveSkillFile(skill, query);
                    if (refContent) {
                        return ok({
                            output: refContent,
                            metadata: { origin: 'SkillsLimb', skill: skill.name, file: query }
                        });
                    }
                }

                // If run:true and scripts exist — execute the primary script via tsx
                // This is the diagnostic runner path: script → structured violations → head agent
                if (args.run && skill.scripts.length > 0) {
                    const domain = (args.domain as string) || '';
                    // Prefer a script named *runner* or *diagnostic*, else take first
                    const primaryScript =
                        skill.scripts.find(s => /runner|diagnostic/i.test(path.basename(s))) ??
                        skill.scripts[0];
                    const domainArg = domain ? `--domain ${domain}` : '';
                    const cmd = `npx tsx "${primaryScript}" ${domainArg}`.trim();

                    logger.info({ skill: skill.name, script: path.basename(primaryScript), domain }, 'SkillsLimb: spawning skill script.');

                    try {
                        const { stdout, stderr } = await execAsync(cmd, {
                            cwd: process.cwd(),
                            timeout: 120_000
                        });

                        // Extract machine-parseable JSON block written by the runner
                        const jsonMatch = stdout.match(/DIAGNOSTIC_RESULT:(\{[\s\S]*?\})\n?(?:===|$)/);
                        let structured: Record<string, unknown> | null = null;
                        if (jsonMatch) {
                            try { structured = JSON.parse(jsonMatch[1].trim()); } catch { /* malformed block */ }
                        }

                        logger.info({
                            skill: skill.name,
                            degraded: structured?.degradedCount ?? 'unknown',
                            domain
                        }, 'SkillsLimb: diagnostic script completed.');

                        return ok({
                            output: stdout,
                            data: structured ?? { raw: stdout },
                            metadata: { origin: 'SkillsLimb', skill: skill.name, script: path.basename(primaryScript), domain }
                        });
                    } catch (e: any) {
                        const out = (e.stdout ?? '') + (e.stderr ?? '') + (e.message ?? '');
                        logger.warn({ skill: skill.name, error: e.message }, 'SkillsLimb: script execution error.');
                        return ok({
                            output: out,
                            data: { error: e.message, raw: out },
                            metadata: { origin: 'SkillsLimb', skill: skill.name, error: e.message }
                        });
                    }
                }

                // Default: serve the full instruction body + file manifest
                const manifest = [
                    `# Skill: ${skill.name}`,
                    `## Description\n${skill.description}`,
                    `## Instructions\n${skill.instructions}`,
                    skill.referenceDocs.length > 0
                        ? `## Reference Docs\n${skill.referenceDocs.map(r => `- ${path.basename(r)}: ${r}`).join('\n')}`
                        : '',
                    skill.scripts.length > 0
                        ? `## Scripts\n${skill.scripts.map(s => `- ${path.basename(s)}: ${s}`).join('\n')}`
                        : '',
                    skill.examples.length > 0
                        ? `## Examples\n${skill.examples.map(e => `- ${path.basename(e)}: ${e}`).join('\n')}`
                        : '',
                    skill.auxiliaryFiles.length > 0
                        ? `## Auxiliary Files (${skill.auxiliaryFiles.length})\n${skill.auxiliaryFiles.map(a => `- ${path.relative(skill.skillDir, a)}`).join('\n')}`
                        : ''
                ].filter(Boolean).join('\n\n');

                return ok({
                    output: manifest,
                    metadata: {
                        origin: 'SkillsLimb',
                        skill: skill.name,
                        instructionLength: skill.instructions.length,
                        totalFiles: skill.referenceDocs.length + skill.scripts.length + skill.examples.length + skill.auxiliaryFiles.length
                    }
                });
            }
        };

        this.registry.assimilateExternalSkill(toolDef);
    }

    /**
     * Resolve a file query against a skill's catalog.
     * Searches reference docs, scripts, examples, and auxiliary files.
     */
    private resolveSkillFile(skill: AssimilatedSkill, query: string): string | null {
        const allFiles = [
            ...skill.referenceDocs,
            ...skill.scripts,
            ...skill.examples,
            ...skill.auxiliaryFiles
        ];

        // Exact basename match first
        let match = allFiles.find(f => path.basename(f) === query);
        // Partial match fallback
        if (!match) {
            const q = query.toLowerCase();
            match = allFiles.find(f => path.basename(f).toLowerCase().includes(q));
        }

        if (match && fs.existsSync(match)) {
            // Don't try to read binary files
            const ext = path.extname(match).toLowerCase();
            if (['.gz', '.tar', '.zip', '.png', '.jpg', '.gif', '.woff', '.ttf'].includes(ext)) {
                return `[Binary file: ${match} (${fs.statSync(match).size} bytes)]`;
            }
            return fs.readFileSync(match, 'utf8');
        }
        return null;
    }

    // =========================================================================
    // PRIVATE — Utilities
    // =========================================================================

    /**
     * Full frontmatter parser — extracts name, description, ALL extra metadata,
     * AND the complete instruction body below the closing ---.
     */
    private parseFrontmatterFull(raw: string): {
        name: string;
        description: string;
        body: string;
        extraMeta: Record<string, string>;
    } | null {
        const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
        if (!match) return null;

        const frontmatter = match[1]!;
        const body = (match[2] ?? '').trim();

        // Parse all key: value pairs from frontmatter
        const meta: Record<string, string> = {};
        for (const line of frontmatter.split('\n')) {
            const kvMatch = line.match(/^(\w[\w-]*):\s*(.+)$/);
            if (kvMatch) {
                meta[kvMatch[1]] = kvMatch[2].replace(/^['"]|['"]$/g, '').trim();
            }
        }

        if (!meta.name) return null;

        const { name, description, ...extraMeta } = meta;

        return {
            name,
            description: description || '',
            body,
            extraMeta
        };
    }

    /**
     * Recursively collect all file paths under a directory.
     */
    private collectFiles(dirPath: string): string[] {
        if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) return [];

        const results: string[] = [];
        const walk = (dir: string) => {
            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    if (entry.isDirectory()) {
                        if (!['node_modules', '.git', '__pycache__', 'dist'].includes(entry.name)) {
                            walk(fullPath);
                        }
                    } else {
                        results.push(fullPath);
                    }
                }
            } catch { /* permission errors */ }
        };
        walk(dirPath);
        return results;
    }
}

