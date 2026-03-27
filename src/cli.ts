#!/usr/bin/env node
/**
 * POG2-CLI — Sovereign Command Line Interface
 * 
 * A globally-installed CLI tool with ternary logic, binary absolutes,
 * and full generative/coding/embedding capabilities.
 * 
 * Architecture: Ternary routing (Yang/YinYang/Yin) with binary absolutes (ok/error)
 * Rules: NO MOCKS, NO PLACEHOLDERS, REAL implementations only.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
if (typeof (globalThis as any).__non_webpack_require__ === 'undefined') {
    (globalThis as any).__non_webpack_require__ = require;
}
import { program, Command } from 'commander';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// CLI RESILIENCE PATCH (Upstream Conflict Resolution)
// Handle ternary/hexagram duplicate registrations without crashing
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const originalCommand = Command.prototype.command;
Command.prototype.command = function (this: Command, name: string, ...args: any[]) {
    const cmdName = name.split(' ')[0];
    const existing = (this as any).commands.find((c: any) => c.name() === cmdName);
    if (existing) return existing;
    return (originalCommand as any).apply(this, [name, ...args]);
};

const originalOption = Command.prototype.option;
Command.prototype.option = function (this: Command, flags: string, description?: string, defaultValue?: any) {
    const existing = (this as any).options.find((o: any) => o.flags === flags);
    if (existing) return this;
    return (originalOption as any).apply(this, [flags, description, defaultValue]);
};

const originalDescription = Command.prototype.description;
(Command.prototype as any).description = function (this: Command, str: string, argsDescription?: any) {
    if (typeof str === 'string' && (this as any)._description) return this;
    return (originalDescription as any).apply(this, [str, argsDescription]);
};

import pino from 'pino';
import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'fs';
import * as fs from 'fs';
import { resolve, join, dirname, sep } from 'path';
import * as path from 'path';
import { homedir } from 'os';
import * as readline from 'readline/promises';
import { StateManager } from './state/StateManager.js';
import { TernaryRouter } from './routing/TernaryRouter.js';
import { ModelClient } from './clients/ModelClient.js';
import { ModelRolodex } from './api/ai/ModelRolodex.js';
import { GenerateEngine } from './engines/GenerateEngine.js';
import { CodeEngine } from './engines/CodeEngine.js';
import { EmbedEngine } from './engines/EmbedEngine.js';
import { CompletionEngine } from './engines/CompletionEngine.js';
import { OrchestrateEngine } from './engines/OrchestrateEngine.js';
import { MemoryConsolidationEngine } from './engines/MemoryConsolidationEngine.js';
import { VectorDB } from './utils/VectorDB.js';
import { RSMVExtractor } from './utils/RSMVExtractor.js';
import { SovereignConfig, loadConfig } from './config/SovereignConfig.js';
import { Renderer } from './ui/Renderer.js';
import { PathNormalizer } from './utils/PathNormalizer.js';
import { DBMaintenance } from './utils/DBMaintenance.js';
import { type Result, YaoState } from './core/models.js';
import { HexagramManager } from './routing/HexagramManager.js';
import { EntityLimb } from './limbs/technical/EntityLimb.js';
import { PedagogyLimb } from './limbs/technical/PedagogyLimb.js';
import { HiScoreLimb } from './limbs/technical/HiScoreLimb.js';
import { KinematicsLimb } from './limbs/technical/KinematicsLimb.js';
import { RSMVController } from './vision/RSMVController.js';
import { HUDForensicsLimb } from './limbs/spatial/HUDForensicsLimb.js';
import { CacheLearningLimb } from './limbs/spatial/CacheLearningLimb.js';
import { OfficialApiLimb } from './limbs/spatial/OfficialApiLimb.js';
import { SpatialMetricEngine } from './engines/SpatialMetricEngine.js';
import { WikiEnricher } from './utils/WikiEnricher.js';
import { MinigameForensicsLimb } from './limbs/spatial/MinigameForensicsLimb.js';
import { getSovereignRoot, getRSMVCachePath, getCachePedagogyPath, getPipelineRootPath, getGodHeadRoot, getGutenbergPath, setProjectRoot as setSovereignRoot } from './utils/SovereignPathResolver.js';
import { CacheForensicsLimb } from './limbs/spatial/CacheForensicsLimb.js';
import { SystemTaxonomyLimb } from './limbs/spatial/SystemTaxonomyLimb.js';
import { MaterialLimb } from './limbs/spatial/MaterialLimb.js';

const POG_MD_TEMPLATE = `# ðŸ§¬ Sovereign Workspace: [Project Name]
- Status: Initialized
- Objective: [Describe goals]
- Substrate: POG2 Sovereign
`;

const RULES_MD_TEMPLATE = `# ðŸŽ¯ Sovereign Laws (Workspace Scoped)
1. NO MOCKS
2. NO PLACEHOLDERS
3. TSC TIGHT
4. CLINICAL LOGGING
`;

const MANIFEST_MD_TEMPLATE = `# ðŸ“Š Sovereign Manifest
- Health: Online
- Limbs: Standard Roster
- Heartbeat: 60s
`;

function bootstrapWorkspace(renderer: Renderer): void {
    const files = [
        { name: '.pog2.md', template: POG_MD_TEMPLATE },
        { name: '.rules.md', template: RULES_MD_TEMPLATE },
        { name: '.manifest.md', template: MANIFEST_MD_TEMPLATE }
    ];

    let createdCount = 0;
    for (const { name, template } of files) {
        if (!existsSync(join(process.cwd(), name))) {
            writeFileSync(join(process.cwd(), name), template);
            createdCount++;
        }
    }

    if (createdCount > 0) {
        renderer.info(`ðŸ§¬ Sovereign Substrate: initialized ${createdCount} context files in current workspace.`);
    }
}


const logger = pino({
    name: 'POG2-cli',
    base: { hostname: 'POG2' },
    transport: process.env['POG2_LOG_PRETTY'] === '1'
        ? { target: 'pino-pretty', options: { colorize: true } }
        : undefined
});

process.on('uncaughtException', (err) => {
    const msg = err instanceof Error ? err.stack || err.message : String(err);
    console.error(`\x1b[38;5;196m[FATAL SUBSTRATE ERROR]\x1b[0m ${msg}`);
    try {
        logger.fatal({ err }, 'Uncaught Exception');
    } catch (e) {
        // Fallback if logger itself is broken
    }
    process.exit(1);
});

process.on('unhandledRejection', (reason) => {
    const msg = reason instanceof Error ? reason.stack || reason.message : String(reason);
    console.error(`\x1b[38;5;196m[UNHANDLED REJECTION]\x1b[0m ${msg}`);
    try {
        logger.fatal({ reason }, 'Unhandled Rejection');
    } catch (e) {
        // Fallback
    }
    process.exit(1);
});

const VERSION = '1.1.0';
const CONFIG_DIR = join(homedir(), '.POG2-cli');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');

async function checkSubstrate(renderer: Renderer, config: SovereignConfig, client: ModelClient): Promise<void> {
    renderer.info('ðŸ” Initializing Substrate Diagnostics...');
    const health = await client.checkHealth();

    if (health.online) {
        renderer.success(`Ollama Substrate: Connected (v${health.version})`);
    } else {
        renderer.warn('Ollama Substrate: Offline. Falling back to Cloud/Hybrid logic.');
    }

    const models: string[] = await client.listModels();
    const required = [config.codingHeavyModel, config.codingFastModel, config.visionModel];
    const missing = required.filter(req => {
        // Match exact or match base name if they have the same core name
        return !models.some((m: string) => m === req || m.split(':')[0] === req.split(':')[0]);
    });

    if (missing.length > 0) {
        renderer.warn(`Missing local substrates: ${missing.join(', ')}. Performance may be degraded.`);
    } else {
        renderer.success('Core Specialized Substrates: Verified & Loaded.');
    }
    renderer.log('');
}

export async function main(): Promise<void> {
    const config = loadConfig(CONFIG_FILE);
    const state = StateManager.getInstance();
    const renderer = new Renderer();

    // Phase 0: Initialize the Thought Processor (HexagramManager singleton)
    // Must happen BEFORE TernaryRouter construction — the router calls getInstance()
    const hexagram = new HexagramManager(null, process.cwd());
    await hexagram.initialize();

    const router = new TernaryRouter(config);
    const client = new ModelClient(config, router);
    router.setModelClient(client);

    // Phase 6: Initialize ModelRolodex and inject into router + client
    const rolodex = new ModelRolodex(config);
    router.setRolodex(rolodex);
    client.setRolodex(rolodex);
    // Phase 16: Initialize Path Normalizer & Resolver
    PathNormalizer.setProjectRoot(process.cwd());
    setSovereignRoot(process.cwd());

    // Phase 49: Automate Workspace Bootstrapping
    bootstrapWorkspace(renderer);

    program
        .name('POG2')
        .description('POG2 Sovereign CLI â€” Ternary Intelligence Engine')
        .version(VERSION)
        .exitOverride(); // Prevent process.exit() on --help/--version so async cleanup runs

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // CONVERSATIONAL REPL (Default bare invocation)
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (process.argv.length <= 2) {
        // Non-blocking background refresh of all provider models for REPL
        rolodex.refreshAll().catch(() => { /* non-blocking */ });
        await startRepl(renderer, config, router, client, state);
        return;
    }

    program
        .command('init')
        .description('Initialize or repair Sovereign Context files and environmental substrates')
        .option('--force', 'Force re-initialization of core directories', false)
        .action(async (opts: any) => {
            bootstrapWorkspace(renderer);

            const root = getSovereignRoot();
            renderer.info(`Sovereign Root: ${root}`);

            const coreDirs = [
                'memory',
                'memory/vectors',
                'memory/learning',
                'memory/captures',
                'pipelines',
                'library',
                'backups'
            ];

            let created = 0;
            for (const dir of coreDirs) {
                const target = join(root, dir);
                if (!existsSync(target)) {
                    mkdirSync(target, { recursive: true });
                    created++;
                }
            }

            if (created > 0) {
                renderer.success(`Initialized ${created} substrate directories.`);
            }
            renderer.success('Sovereign Substrate synchronized.');
        });

    program
        .command('process <intent>')
        .description('Execute a single task managed by Kimi')
        .option('-y, --yes', 'Execute without biological confirmation (Auto-proceed)', false)
        .action(async (intent: string, opts: { yes: any; }) => {
            if (opts.yes) process.env['POG2_AUTO_PROCEED'] = '1';
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.run(intent);
            handleResult(result, renderer, state);
        });
    program
        .command('reimagine <cacheSubject> <gutenbergTheme>')
        .description('Synthesize a physical RS Cache asset with a Gutenberg narrative emotion into a .gltf rendering')
        .action(async (cacheSubject: string, gutenbergTheme: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Reimagine: ${cacheSubject} via ${gutenbergTheme}`,
                steps: ["Extracting physical WebGL geometry", "Infusing emotional Gutenberg signature", "Synthesizing YinYang Substrate"],
                tool: 'reimagine_concept',
                parameters: { cacheSubject, gutenbergTheme },
                reasoning: 'Manual Reimagination execution.',
                model: config.orchestratorModel,
                severity: 20,
                interaction: 'text',
                yaoState: YaoState.OldYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    program
        .command('think <intent>')
        .description('Trigger a metabolic reflection cycle to identify bottleneck paths')
        .action(async (intent: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Execute metabolic reflection: ${intent}`,
                steps: ["Identifying bottleneck paths"],
                tool: 'think',
                parameters: { intent },
                reasoning: 'Manual metabolic reflection request.',
                model: config.orchestratorModel,
                severity: 5,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    program
        .command('dispatch <capabilityId> <payload>')
        .description('Directly invoke an AI capability via the Dispatcher substrate')
        .option('-m, --model <id>', 'Override target model')
        .action(async (capabilityId: string, payload: string, opts: { model: any; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Invoke capability: ${capabilityId}`,
                steps: ["Direct substrate dispatch"],
                tool: 'dispatch',
                parameters: { capabilityId, payload, modelOverride: opts.model },
                reasoning: 'Manual direct capability dispatch.',
                model: config.orchestratorModel,
                severity: 30,
                interaction: 'text',
                yaoState: YaoState.YoungYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    program
        .command('consult-shadow [projectId]')
        .description('Consult external architectural maps from the global code_tracker substrate')
        .action(async (projectId?: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Consult shadow maps: ${projectId || 'all'}`,
                steps: ["Fetching external architectural data"],
                tool: 'consult_shadow',
                parameters: { projectId },
                reasoning: 'Manual shadow consultation.',
                model: config.orchestratorModel,
                severity: 10,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    program
        .command('consult-memetics [query]')
        .description('Consult browser history for research kernels from the global memetic substrate')
        .option('-l, --limit <n>', 'Number of entries to return', '10')
        .action(async (query: string | undefined, opts: { limit: string; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Consult memetic substrate: ${query || 'recent'}`,
                steps: ["Researching browser kernels"],
                tool: 'consult_memetics',
                parameters: { query, limit: parseInt(opts.limit) },
                reasoning: 'Manual memetic consultation.',
                model: config.orchestratorModel,
                severity: 10,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    program
        .command('consult-syntropy')
        .description('Harmonize external metadata from .claude and .gemini substrates')
        .option('-t, --type <type>', 'Filter: personas, history, todos, extensions', 'all')
        .action(async (opts: { type: any; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Harmonize syntropy: ${opts.type}`,
                steps: ["Aggregating external metadata"],
                tool: 'consult_syntropy',
                parameters: { type: opts.type },
                reasoning: 'Manual syntropy consultation.',
                model: config.orchestratorModel,
                severity: 10,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // TOP-LEVEL ALIASES (Discovery & UX)
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    program
        .command('health')
        .description('Deep clinical audit of all neurological substrates (Alias for system health)')
        .option('--json', 'Output health report in JSON format', false)
        .action(async (opts: { json: any; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Clinical health audit',
                steps: ["Auditing neurological nodes"],
                tool: 'check_node_health',
                parameters: {},
                reasoning: 'Top-level health alias.',
                model: config.orchestratorModel,
                severity: 5,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            if (opts.json && result.ok) {
                renderer.json(result.value.data);
            } else {
                handleResult(result, renderer, state);
            }
        });

    program
        .command('personality')
        .description('Display AI personality archetypes (Alias for system personality)')
        .action(async () => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Audit personality archetypes',
                steps: ["Fetching cognitive influences"],
                tool: 'personality',
                parameters: {},
                reasoning: 'Top-level personality alias.',
                model: config.orchestratorModel,
                severity: 10,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    program
        .command('consolidate')
        .description('Trigger the Subconscious Memory Processor to compress and synthesize learnings (pog2 only)')
        .action(async () => {
            const vectorDB = new VectorDB({ client });
            const engine = new MemoryConsolidationEngine(client, vectorDB, state);

            renderer.info('🧠 Initiating Subconscious Memory Consolidation...');
            const result = await engine.consolidate();

            if (result.ok) {
                renderer.success('Memory compression complete. Redundant pathways eliminated.');
            } else {
                renderer.error(`Synthesis failed: ${result.error?.message}`);
            }
        });

    // —————————————————————————————————————————————————————————————
    // ATLAS COMMANDS (Phase 15: HUD & Spatial Forensics)
    // —————————————————————————————————————————————————————————————
    const atlas = program.command('atlas').description('Sovereign Atlas Forensic Substrate commands');

    atlas
        .command('hud <id|name>')
        .description('Decompile and audit a Jagex interface from Major 3 cache')
        .action(async (target: string) => {
            const limb = new HUDForensicsLimb();
            renderer.info(`👁️ Investigating HUD Substrate: ${target}...`);

            const id = parseInt(target);
            if (!isNaN(id)) {
                const res = await limb.getInterface(id);
                if (res.ok) {
                    renderer.success(`Interface ${id} decompiled.`);
                    renderer.json(res.value);
                } else {
                    renderer.error(`Forensic decompile failed: ${res.error.message}`);
                }
            } else {
                renderer.info(`Scanning interfaces for text: "${target}"...`);
                const res = await limb.searchInterfaces(target);
                if (res.ok && res.value.length > 0) {
                    renderer.success(`Found ${res.value.length} matching interfaces.`);
                    renderer.json(res.value.map(i => ({ id: i.interfaceId, labels: i.textLabels.slice(0, 5) })));
                } else {
                    renderer.warn('No matching interfaces found in forensic scan.');
                }
            }
        });

    atlas
        .command('dbtables')
        .description('Extract Major 2 Config (dbtables/dbrows) into memory/pedagogy')
        .action(async () => {
            renderer.info('🔍 Initiating System Taxonomy Extraction...');
            const configLimb = new SystemTaxonomyLimb();
            const res = await configLimb.extractSystemTaxonomy();
            if (res.ok) {
                renderer.success('DBTables successfully extracted to cache_pedagogy/dbtables.json');
            } else {
                renderer.error(`Extraction failed: ${res.error.message}`);
            }
            configLimb.close();
            process.exit(res.ok ? 0 : 1);
        });

    atlas
        .command('materials')
        .description('Extract Major 26 Materials into memory/pedagogy')
        .action(async () => {
            renderer.info('🔍 Initiating Material Shader Extraction...');
            const materialLimb = new MaterialLimb();
            const res = await materialLimb.extractMaterials();
            if (res.ok) {
                renderer.success('Materials successfully extracted to cache_pedagogy/materials.json');
            } else {
                renderer.error(`Extraction failed: ${res.error.message}`);
            }
            materialLimb.close();
            process.exit(res.ok ? 0 : 1);
        });

    atlas
        .command('spatial <name>')
        .description('Calculate high-fidelity 3D metrics for a named asset')
        .action(async (name: string) => {
            const forensics = new CacheForensicsLimb();
            const learning = new CacheLearningLimb(getRSMVCachePath(), forensics, join(getSovereignRoot(), 'library', 'spatial'));
            
            renderer.info(`📐 Calculating Spatial Metrics for: ${name}...`);
            
            // Resolve to model ID via forensics
            const resolveRes = await forensics.crossReferenceItem(name);
            if (!resolveRes.ok || resolveRes.value.rawModelIds.length === 0) {
                renderer.error(`Could not resolve semantic name: ${name}`);
                return;
            }

            const modelId = resolveRes.value.rawModelIds[0];
            renderer.info(`Resolved ${name} to Model ID: ${modelId}. Initiating geometric forensics...`);

            const res = await learning.learnSpatialModel('item', modelId);
            if (res.ok) {
                renderer.success(`Spatial metrics calculated for ${name}.`);
                renderer.json(res.value.metrics);
                
                // Also trigger translation to GLTF for visual manifest
                renderer.info('Generating universal GLTF manifest...');
                await learning.translateToObj(name, modelId);
            } else {
                renderer.error(`Spatial forensics failed: ${res.error.message}`);
            }
        });

    program
        .command('learn <type> <idOrName>')
        .description('Unified learning: Extraction + Spatial Metrics + Wiki Enrichment')
        .action(async (type, idOrName) => {
            renderer.info(`\n🧬 Commencing Unified Learning for ${type}: ${idOrName}...`);
            
            const apiLimb = new OfficialApiLimb();
            const metricEngine = new SpatialMetricEngine();
            const forensics = new CacheForensicsLimb();
            const learning = new CacheLearningLimb(getRSMVCachePath(), forensics, join(getSovereignRoot(), 'library', 'spatial'));

            try {
                let learnedObject: any = { type, source: 'Jagex Cache', timestamp: new Date().toISOString() };

                if (type === 'item') {
                    // 1. Resolve & Extract
                    const resolveRes = await forensics.crossReferenceItem(idOrName);
                    if (!resolveRes.ok || resolveRes.value.rawModelIds.length === 0) {
                        throw new Error(`Could not resolve semantic name: ${idOrName}`);
                    }
                    
                    const item = resolveRes.value;
                    const modelId = item.rawModelIds[0];
                    learnedObject.id = item.id;
                    learnedObject.name = idOrName;

                    // 2. Spatial Metrics
                    renderer.info(`📐 Calculating Spatial Metrics for Model ID: ${modelId}...`);
                    const res = await learning.learnSpatialModel('item', modelId);
                    if (res.ok) learnedObject.spatial = res.value.metrics;

                    // 3. Enrichment
                    renderer.info(`🔍 Fetching Wiki & GE Enrichment...`);
                    const wikiRes = await WikiEnricher.enrichItem(idOrName);
                    if (wikiRes.ok) learnedObject.enrichment = wikiRes.value;

                    // Attempt GE lookup if it's an item and we have an ID
                    const geRes = await apiLimb.getItemDetail(item.id);
                    if (geRes.ok) learnedObject.economics = geRes.value;

                } else if (type === 'npc') {
                    const resolveRes = await forensics.crossReferenceNpc(idOrName);
                    if (!resolveRes.ok) throw resolveRes.error;
                    const npc = resolveRes.value;
                    learnedObject.id = npc.id;
                    learnedObject.name = idOrName;

                    const wikiRes = await WikiEnricher.enrichNpc(idOrName);
                    if (wikiRes.ok) learnedObject.enrichment = wikiRes.value;
                } else if (type === 'system') {
                    const minigameLimb = new MinigameForensicsLimb(forensics, learning);
                    const systemRes = await minigameLimb.learnMinigame(idOrName);
                    if (!systemRes.ok) throw systemRes.error;
                    learnedObject = systemRes.value;
                }

                // 4. Persistence
                const atlasPath = path.join('D:\\sovereign\\atlas', type, `${learnedObject.name.replace(/\s+/g, '_').toLowerCase()}.json`);
                await fs.promises.mkdir(path.dirname(atlasPath), { recursive: true });
                await fs.promises.writeFile(atlasPath, JSON.stringify(learnedObject, null, 2));

                renderer.success(`\n✅ Learned Object synchronized: ${atlasPath}`);
                if (learnedObject.spatial) renderer.json(learnedObject.spatial);
            } catch (err: any) {
                renderer.error(`\n✘ Learning failed: ${err.message}`);
                process.exit(1);
            }
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // SYSTEM & DIAGNOSTICS
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const sys = program.command('system').description('Neuro-system diagnostics, health, and clinical audits');

    sys
        .command('status')
        .description('Neuro-system status and hierarchical routing diagnostics')
        .option('-r, --routing', 'Show detailed hierarchical model routing mapping')
        .action(async (opts: { routing: any; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            if (opts.routing) {
                await router.route('Yin');
                await router.route('Yang');
                await router.route('Orchestrator');

                const masterSeq = router.getFailoverSequence('Master');
                const execSeq = router.getFailoverSequence('Executive');
                const reactSeq = router.getFailoverSequence('Reactive');

                renderer.info('SOVEREIGN NEURAL HIERARCHY & FAILOVER CHAINS:');
                renderer.info(`â”Œâ”€â”€ MASTER (Think)    : ${masterSeq.join(' âž” ')}`);
                renderer.info(`â”œâ”€â”€ EXECUTIVE (Motor) : ${execSeq.join(' âž” ')}`);
                renderer.info(`â””â”€â”€ REACTIVE (Fast)   : ${reactSeq.join(' âž” ')}`);

                renderer.info('\nSPECIALIZED SUBSTRATES:');
                renderer.info(`â”œâ”€â”€ VISION EYE (Observation) : ${config.visionModel}`);
                renderer.info(`â”œâ”€â”€ VOICE COMMS (Linguistic) : ${config.voiceModel}`);
                renderer.info(`â””â”€â”€ CHROMANUMBER (Expressive) : ${config.imageGenModel}`);
                return;
            }

            const result = await engine.executePlan({
                goal: 'Status check',
                steps: ["Clinical neurological status"],
                tool: 'check_node_health',
                parameters: {},
                reasoning: 'Manual status check.',
                model: config.orchestratorModel,
                severity: 5,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    sys
        .command('health')
        .description('Deep clinical audit of all neurological substrates and neural nodes')
        .option('--json', 'Output health report in JSON format', false)
        .action(async (opts: { json: any; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Detailed health audit',
                steps: ["Exposing diagnostic details"],
                tool: 'check_node_health',
                parameters: {},
                reasoning: 'Manual clinical neurological audit.',
                model: config.orchestratorModel,
                severity: 5,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            if (opts.json && result.ok) {
                renderer.json(result.value.data);
            } else {
                handleResult(result, renderer, state);
            }
        });

    sys
        .command('nexus')
        .description('Report full neurological status and efficiency metrics')
        .action(async () => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Nexus diagnostic report',
                steps: ["Calculating efficiency metrics"],
                tool: 'diagnostic_nexus',
                parameters: {},
                reasoning: 'Manual nexus diagnostic.',
                model: config.orchestratorModel,
                severity: 5,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    sys
        .command('audit <target>')
        .description('Scan a file or directory for Sovereign Law violations')
        .action(async (target: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Clinical audit of: ${target}`,
                steps: ["Scanning for substrate violations"],
                tool: 'clinical_audit',
                parameters: { target },
                reasoning: 'Manual clinical audit.',
                model: config.orchestratorModel,
                severity: 20,
                interaction: 'text',
                yaoState: YaoState.YoungYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    sys
        .command('registry')
        .description('Show all registered tools and their domains in the sovereign substrate')
        .action(async () => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Substrate tool registry audit',
                steps: ["Enumerating registered clinical tools"],
                tool: 'diagnostic_nexus', // Will include registry status
                parameters: { registryOnly: true },
                reasoning: 'Manual registry audit.',
                model: config.orchestratorModel,
                severity: 5,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    sys
        .command('capabilities')
        .description('Deep scan the substrate for available engines and limbs (Discovery)')
        .action(async () => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Substrate capability discovery',
                steps: ["Probing latent cognitive limbs"],
                tool: 'discover_capabilities',
                parameters: {},
                reasoning: 'Manual substrate discovery.',
                model: config.orchestratorModel,
                severity: 10,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    const personality = sys.command('personality').description('AI personality archetypes and literary influences');

    personality
        .command('status')
        .description('Display the AI\'s active personality archetypes')
        .action(async () => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Personality archetype audit',
                steps: ["Fetching active cognitive profiles"],
                tool: 'personality',
                parameters: {},
                reasoning: 'Manual personality audit.',
                model: config.orchestratorModel,
                severity: 10,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    personality
        .command('set <archetype>')
        .description('Pin a specific archetype to influence the Sovereign mind')
        .action(async (archetype: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Set personality archetype: ${archetype}`,
                steps: ["Binding cognitive influence"],
                tool: 'personality_set',
                parameters: { archetype },
                reasoning: 'Manual personality pining.',
                model: config.orchestratorModel,
                severity: 15,
                interaction: 'text',
                yaoState: YaoState.YoungYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    personality
        .command('book <id>')
        .description('Analyze a Gutenberg book and bind its literary style to the AI personality')
        .action(async (id: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Bind literary style: Book ${id}`,
                steps: ["Analyzing Gutenberg style substrate"],
                tool: 'personality_book',
                parameters: { bookId: parseInt(id) },
                reasoning: 'Manual Gutenberg literary personality binding.',
                model: config.orchestratorModel,
                severity: 20,
                interaction: 'text',
                yaoState: YaoState.OldYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    sys
        .command('absorb <bookId>')
        .description('Force-feed specific book wisdom into the active cognitive context')
        .action(async (bookId: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Absorb wisdom: Book ${bookId}`,
                steps: ["Ingesting literary cognitive context"],
                tool: 'absorb_wisdom',
                parameters: { bookId: parseInt(bookId) },
                reasoning: 'Manual wisdom absorption.',
                model: config.orchestratorModel,
                severity: 20,
                interaction: 'text',
                yaoState: YaoState.YoungYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // VS CODE SYNERGY
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const vs = program.command('vs').description('VS Code Editor Synergy Suite â€” Clinical Editor Bridge');

    vs
        .command('open [path]')
        .description('Open a path or current workspace in VS Code')
        .action(async (path: string = '.') => {
            renderer.info(`Opening Sovereign Workspace: ${path}...`);
            const cp = await import('child_process');
            cp.exec(`code "${resolve(path)}"`, (err) => {
                if (err) renderer.error(`Failed to launch VS Code: ${err.message}`);
            });
        });

    vs
        .command('status')
        .description('Report workspace folders and detected open files')
        .action(async () => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Workspace status audit',
                steps: ["Querying VS Code substrate for open files and folders"],
                tool: 'vscode_status',
                parameters: {},
                reasoning: 'Manual workspace status check.',
                model: config.orchestratorModel,
                severity: 5,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    vs
        .command('read <file>')
        .description('Read file content through the VS Code engine')
        .action(async (file: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Read file: ${file}`,
                steps: ["Accessing VS Code file buffer"],
                tool: 'vscode_read',
                parameters: { filePath: resolve(file) },
                reasoning: 'Manual file read via VS Code substrate.',
                model: config.orchestratorModel,
                severity: 5,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    vs
        .command('edit <file> <text>')
        .description('Perform a quick edit/insert at current file or position')
        .option('-l, --line <number>', 'Line index (0-based)')
        .option('-c, --col <number>', 'Column index (0-based)')
        .action(async (file: string, text: string, opts: { line: string; col: string; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Quick edit: ${file}`,
                steps: ["Injecting content into active editor"],
                tool: 'vscode_edit',
                parameters: {
                    filePath: resolve(file),
                    content: text,
                    line: opts.line ? parseInt(opts.line) : undefined,
                    column: opts.col ? parseInt(opts.col) : undefined
                },
                reasoning: 'Manual quick edit via VS Code substrate.',
                model: config.orchestratorModel,
                severity: 15,
                interaction: 'text',
                yaoState: YaoState.YoungYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    vs
        .command('goto <file>')
        .description('Jump to specific file, line, and column (format: file:line:col)')
        .action(async (target: string) => {
            const parts = target.split(':');
            const filePath = resolve(parts[0] || '.');
            const line = parts[1] ? parseInt(parts[1]) - 1 : 0;
            const column = parts[2] ? parseInt(parts[2]) - 1 : 0;

            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Navigate to: ${target}`,
                steps: ["Directing editor cursor to target substrate"],
                tool: 'vscode_goto',
                parameters: { filePath, line, column },
                reasoning: 'Manual editor navigation.',
                model: config.orchestratorModel,
                severity: 5,
                interaction: 'text',
                yaoState: YaoState.YoungYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // GUVENBERG LITERARY SUBSTRATE
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const gut = program.command('gutenberg').description('Project Gutenberg Literary Substrate â€” Wisdom Management');

    gut
        .command('list')
        .description('List books in the local library')
        .action(async () => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Library audit',
                steps: ["Enumerating local Gutenberg substrate"],
                tool: 'gutenberg_list',
                parameters: {},
                reasoning: 'Manual library audit.',
                model: config.orchestratorModel,
                severity: 5,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    gut
        .command('search <query>')
        .description('Search the global catalog for new books')
        .action(async (query: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Library search: ${query}`,
                steps: ["Querying global Gutenberg catalog"],
                tool: 'gutenberg_search',
                parameters: { query },
                reasoning: 'Manual library search.',
                model: config.orchestratorModel,
                severity: 5,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    gut
        .command('ingest <id> <title> <author>')
        .description('Download and store a book')
        .option('-d, --domain <domain>', 'Target domain (default: general)')
        .action(async (id: string, title: string, author: string, opts: { domain: any; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Ingest book: ${title}`,
                steps: ["Downloading and storing intellectual substrate"],
                tool: 'gutenberg_ingest',
                parameters: { id: parseInt(id), title, author, domain: opts.domain },
                reasoning: 'Manual library ingestion.',
                model: config.orchestratorModel,
                severity: 20,
                interaction: 'text',
                yaoState: YaoState.OldYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    gut
        .command('read <id>')
        .description('Trigger active reading and wisdom extraction')
        .action(async (id: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Wisdom extraction: Book ${id}`,
                steps: ["Analyzing literary style and extracting ontologies"],
                tool: 'gutenberg_read',
                parameters: { bookId: parseInt(id) },
                reasoning: 'Manual wisdom extraction.',
                model: config.orchestratorModel,
                severity: 20,
                interaction: 'text',
                yaoState: YaoState.OldYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    gut
        .command('sync')
        .description('Synchronize the local Gutenberg library metadata with physical files on disk')
        .action(async () => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Library substrate sync',
                steps: ["Reconciling local metadata with physical files"],
                tool: 'gutenberg_sync',
                parameters: {},
                reasoning: 'Manual library synchronization and self-healing.',
                model: config.orchestratorModel,
                severity: 5,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    gut
        .command('organize')
        .description('Use the Sovereign AI to categorize unorganized books into proper genre folders')
        .action(async () => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Library organization',
                steps: ["Categorizing unorganized books into genre substrates"],
                tool: 'gutenberg_organize',
                parameters: {},
                reasoning: 'Manual AI-driven library categorization.',
                model: config.orchestratorModel,
                severity: 25,
                interaction: 'text',
                yaoState: YaoState.OldYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    gut
        .command('storyboard <id>')
        .description('Generate narrative scenes and visual prompts from a book\'s literary style')
        .option('-s, --scenes <count>', 'Number of scenes to generate', '5')
        .action(async (id: string, opts: { scenes: string; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Storyboard generation: Book ${id}`,
                steps: ["Generating narrative scenes and visual prompts"],
                tool: 'generate_storyboard',
                parameters: { bookId: parseInt(id), sceneCount: parseInt(opts.scenes) },
                reasoning: 'Gutenberg storyboard generation request.',
                model: config.orchestratorModel,
                severity: 30,
                interaction: 'text',
                yaoState: YaoState.OldYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // RSMV INTEGRATION Loop
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    program
        .command('rsmv')
        .description('RSMV inspection & one-shot CLI access')
        .option('--view <modelId>', 'View model via RSMV')
        .action(async (options: { view: any; }) => {
            const modelId = options.view;
            if (!modelId) return console.error('No modelId provided');

            // Spawn one-shot RSMV process
            const { spawn } = await import('child_process');
            const cachePath = getRSMVCachePath();
            const subprocess = spawn('npx', ['tsx', 'rsmv/index.ts', '--model', modelId, '--cache', cachePath], {
                stdio: 'inherit',
            });

            // Safety timeout: 5 minutes
            const timeout = setTimeout(() => {
                subprocess.kill('SIGTERM');
                console.warn('[RSMV] One-shot process timed out and was terminated.');
            }, 5 * 60 * 1000);

            subprocess.on('exit', () => clearTimeout(timeout));
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // CREATIVE PIPELINE
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const pipe = program.command('pipeline').description('Autonomous story-to-media pipeline (scene â†’ image â†’ voice)');

    pipe
        .command('run <bookId>')
        .description('Run a full creative pipeline for a book')
        .option('--scenes <number>', 'Number of scenes (or "all" for every chapter)', '5')
        .option('--personality <archetype>', 'Narration personality (e.g., sarcastic, epic, scholar)')
        .option('--no-voice', 'Skip voice generation')
        .option('--no-video', 'Skip final video assembly')
        .action(async (bookId: string, options: { scenes: string; personality: any; voice: any; video: any; feedback: any; }) => {
            const sceneCount = options.scenes === 'all' ? -1 : parseInt(options.scenes);
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Run pipeline: Book ${bookId}`,
                steps: ["Executing story-to-media autonomous pipeline"],
                tool: 'run_pipeline',
                parameters: {
                    bookId: parseInt(bookId),
                    sceneCount,
                    personality: options.personality,
                    skipVoice: !options.voice,
                    skipVideo: !options.video,
                    skipFeedback: !options.feedback
                },
                reasoning: 'Manual creative pipeline execution.',
                model: config.orchestratorModel,
                severity: 50,
                interaction: 'text',
                yaoState: YaoState.OldYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    pipe
        .command('run-batch')
        .description('Iterate through the entire Gutenberg library and generate movies for all books')
        .option('--scenes <number>', 'Number of scenes (or "all" for every chapter)', '5')
        .option('--personality <archetype>', 'Narration personality')
        .option('--no-voice', 'Skip voice generation')
        .option('--no-video', 'Skip final video assembly')
        .action(async (options: { scenes: string; personality: any; voice: any; video: any; }) => {
            const sceneCount = options.scenes === 'all' ? -1 : parseInt(options.scenes);
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Run batch pipeline',
                steps: ["Iterating global library for cinema generation"],
                tool: 'run_batch_pipeline',
                parameters: {
                    sceneCount,
                    personality: options.personality,
                    skipVoice: !options.voice,
                    skipVideo: !options.video
                },
                reasoning: 'Manual global cinema batch execution.',
                model: config.orchestratorModel,
                severity: 100,
                interaction: 'text',
                yaoState: YaoState.OldYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    pipe
        .command('queue')
        .description('List active and completed pipelines in the sovereign substrate')
        .action(async () => {
            const pipePath = join(getSovereignRoot(), 'pipelines');
            if (!existsSync(pipePath)) {
                renderer.info('No pipeline substrate detected.');
                return;
            }

            const { readdirSync, statSync } = await import('fs');
            readdirSync(pipePath);

            renderer.info(`â•â•â• SOVEREIGN PIPELINES (${pipePath}) â•â•â•`);

            const processedBooks = new Set<string>();

            const scanDir = (dirPath: string, depth: number = 0) => {
                if (depth > 2) return; // Only scan categories and book folders
                const entries = readdirSync(dirPath).filter(d => statSync(join(dirPath, d)).isDirectory());

                for (const entry of entries) {
                    const fullPath = join(dirPath, entry);

                    // Check for manifest in current dir or 1-storyboard (tiered structure)
                    const manifestCandidates = [
                        join(fullPath, 'manifest.json'),
                        join(fullPath, '1-storyboard', 'manifest.json')
                    ];

                    let manifestFound = false;
                    for (const mPath of manifestCandidates) {
                        if (existsSync(mPath)) {
                            try {
                                const manifest = JSON.parse(readFileSync(mPath, 'utf-8'));
                                const statusColor = manifest.status === 'complete' ? '\x1b[38;5;154m' : '\x1b[38;5;208m';
                                const relativePath = fullPath.replace(pipePath + sep, '');
                                renderer.log(`${statusColor}[${manifest.status.toUpperCase()}]\x1b[0m ${relativePath} - Book ${manifest.bookId}: ${manifest.bookTitle} (${manifest.successfulImages}/${manifest.totalScenes} scenes)`);
                                processedBooks.add(fullPath);
                                manifestFound = true;
                                break;
                            } catch (e) {
                                // Skip corrupt manifests
                            }
                        }
                    }

                    if (!manifestFound && depth === 0) {
                        // Recurse into categories
                        scanDir(fullPath, depth + 1);
                    } else if (!manifestFound && depth === 1 && !processedBooks.has(fullPath)) {
                        renderer.log(`\x1b[38;5;244m[INCOMPLETE]\x1b[0m ${fullPath.replace(pipePath + sep, '')}`);
                    }
                }
            };

            scanDir(pipePath);
            renderer.log(`â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•`);
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // SMART DISPATCHER
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // PLAYER & NPC BEHAVIORAL ENGINE
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const player = program.command('player').description('Player (POG2) Cognitive Substrate management');
    const npc = program.command('npc').description('NPC Interaction & Target management');

    [player, npc].forEach(cmd => {
        cmd
            .command('interact <id>')
            .description('Inject an experience into the entity\'s memory')
            .requiredOption('-t, --type <type>', 'Memory type (combat | skilling | drop | reward | threat)')
            .option('-c, --content <text>', 'Specific event pattern', 'Manual interaction')
            .option('-w, --weight <float>', 'Experience intensity', '1.0')
            .action(async (id: string, opts: { type: any; content: any; weight: string; }) => {
                const limb = new EntityLimb();
                const memory = {
                    type: opts.type,
                    content: opts.content,
                    weight: parseFloat(opts.weight),
                    timestamp: Date.now()
                };

                renderer.info(`Injecting ${opts.type} stimulus into ${id}...`);
                const res = await limb.addMemory(id, memory);
                if (res.ok) {
                    const vibeRes = await limb.updateVibeFromMemory(id, memory);
                    if (vibeRes.ok) {
                        renderer.success(`Stimulus anchored. Vibe Snapshot: ${JSON.stringify(vibeRes.value)}`);
                    } else {
                        renderer.success(`Memory anchored, but vibe mutation failed: ${vibeRes.error?.message}`);
                    }
                } else {
                    renderer.error(`Injection failed: ${res.error?.message}`);
                }
            });

        cmd
            .command('decide <id>')
            .description('Trigger the Behavioral Decision Engine to produce a player/npc action bias')
            .action(async (id: string) => {
                const limb = new EntityLimb();
                renderer.info(`Querying Behavioral Engine for ${id}...`);

                const decisionRes = await limb.decideAction(id);
                if (decisionRes.ok) {
                    const { action, yao, reasoning } = decisionRes.value;
                    const yaoSymbol = yao === YaoState.OldYang ? 'â•²' : (yao === YaoState.OldYin ? 'â•¹' : (yao === YaoState.YoungYang ? 'â• ' : 'â•‹'));

                    renderer.log(`\n\x1b[38;5;154m[DECISION]\x1b[0m \x1b[1m${action.toUpperCase()}\x1b[0m`);
                    renderer.log(`\x1b[38;5;244mReasoning:\x1b[0m ${reasoning}`);
                    renderer.log(`\x1b[38;5;208mCognitive State:\x1b[0m ${yaoSymbol} [Yao: ${YaoState[yao]}]`);

                    // Close the loop
                    renderer.info(`Executing and reinforcing pattern...`);
                    await limb.executeAction(id, action);
                    renderer.success('Behavioral loop closed.');
                } else {
                    renderer.error(`Decision engine failed: ${decisionRes.error?.message}`);
                }
            });

        cmd
            .command('pull <name>')
            .description('Fetch character model from Jagex avatar service and render via RSMV')
            .action(async (name: string) => {
                const limb = new EntityLimb();
                const rsmv = new RSMVController();
                const id = 'pog2:player';

                renderer.info(`Pulling character model for ${name}...`);
                const modelId = `player:${name}`;
                const res = await rsmv.viewModel(modelId);

                if (res.ok) {
                    renderer.success(`RSMV pull triggered for ${name}. Model will be rendered in the background.`);
                    await limb.updatePlayerIdentity(id, { name, modelPath: 'model.glb' });
                    renderer.success(`Identity bound to ${name} in substrate.`);
                } else {
                    renderer.error(`Pull failed: ${res.error?.message}`);
                }
            });

        cmd
            .command('stats <name>')
            .description('Fetch real-time HiScore data for a player')
            .action(async (name: string) => {
                const hiscore = new HiScoreLimb();
                const limb = new EntityLimb();
                const id = 'pog2:player';

                renderer.info(`Fetching HiScores for ${name}...`);
                const res = await hiscore.fetchStats(name);

                if (res.ok) {
                    renderer.json(res.value);
                    await limb.updatePlayerIdentity(id, { name, stats: res.value });
                    renderer.success(`Stats synced to substrate for ${id}.`);
                } else {
                    renderer.error(`HiScore fetch failed: ${res.error?.message}`);
                }
            });

        cmd
            .command('status [id]')
            .description('Expose current attention, vibe, and identity state')
            .action(async (idArg: string | undefined) => {
                const id = idArg || 'pog2:player';
                const limb = new EntityLimb();
                const res = await limb.getEntityState(id);
                const identityRes = await limb.getPlayerIdentity(id);

                if (res.ok) {
                    const output = {
                        ...res.value,
                        identity: identityRes.ok ? identityRes.value : null
                    };
                    renderer.json(output);
                } else {
                    renderer.error(res.error?.message);
                }
            });
    });

    const ped = program.command('pedagogy').description('Cognitive Curation & Sovereign Principle Archiving');

    ped
        .option('--ground-quest <id>', 'Ground a quest in functional Varbit logic')
        .option('--verify-state-machine', 'Verify the state machine of the grounded quest')
        .action(async (options: { groundQuest: string; verifyStateMachine: any; }) => {
            if (options.groundQuest) {
                const questId = parseInt(options.groundQuest);
                const vectorDB = new VectorDB({ client });
                const limb = new PedagogyLimb(router, vectorDB, client);

                if (options.verifyStateMachine) {
                    renderer.info(`Verifying State Machine for Quest ${questId}...`);
                    const res = await limb.verifyStateMachine(questId);
                    if (res.ok) {
                        renderer.success(`Quest ${questId} State Machine Verified: ${res.value.status}`);
                        console.log(JSON.stringify(res.value, null, 2));
                    } else {
                        renderer.error(`Verification failed: ${res.error?.message}`);
                    }
                } else {
                    renderer.info(`Grounding Quest ${questId} in Varbit logic...`);
                    const res = await limb.groundQuest(questId);
                    if (res.ok) {
                        renderer.success(`Quest ${questId} Grounded: ${res.value.quest}`);
                        console.log(JSON.stringify(res.value.grounding, null, 2));
                    } else {
                        renderer.error(`Grounding failed: ${res.error?.message}`);
                    }
                }
                return;
            }
            // If subcommands are present but no subcommand was called, commander shows help
        });

    const kin = program
        .command('kinematics')
        .description('Sovereign Kinetic Layer: Animation deconstruction and binding');

    kin
        .command('extract <id>')
        .description('Forensic deconstruction of a Jagex animation sequence (Major 20/56)')
        .action(async (id: string) => {
            const vectorDB = new VectorDB({ client });
            const limb = new KinematicsLimb(router, vectorDB, client);

            renderer.info(`Initiating Forensic Kinematic Extractions ID: ${id}...`);
            const res = await limb.extractKinematics(parseInt(id));

            if (res.ok) {
                renderer.success(`Kinematic Profile Extracted for Sequence ${id}`);
                console.log(JSON.stringify(res.value, null, 2));
            } else {
                renderer.error(`Extraction failed: ${res.error?.message}`);
            }
        });

    kin
        .command('bind <id>')
        .description('Bind a kinematic sequence to a semantic state (e.g., IDLE, WALK)')
        .requiredOption('-s, --state <name>', 'Semantic state name')
        .option('-a, --actor <id>', 'Specific actor/NPC ID to bind to')
        .action(async (id: string, opts: { state: string; actor: string | undefined; }) => {
            const vectorDB = new VectorDB({ client });
            const limb = new KinematicsLimb(router, vectorDB, client);

            renderer.info(`Binding Sequence ${id} to state ${opts.state}...`);
            const res = await limb.bindSequenceToState(parseInt(id), opts.state, opts.actor);

            if (res.ok) {
                renderer.success(`Kinematic Binding Consolidated in Pedagogy Substrate.`);
                console.log(JSON.stringify(res.value, null, 2));
            } else {
                renderer.error(`Binding failed: ${res.error?.message}`);
            }
        });

    ped
        .command('store')
        .description('Archive an abstract design principle into the pedagogy substrate')
        .requiredOption('-p, --principle <name>', 'Name of the principle to archive')
        .requiredOption('-s, --source <substrate>', 'Source of the wisdom (e.g., phase_6_complete)')
        .option('-c, --confidence <float>', 'Clinical confidence level (0.0-1.0)', '0.99')
        .action(async (opts: { principle: string; source: string; confidence: string; }) => {
            const vectorDB = new VectorDB({ client });
            const limb = new PedagogyLimb(router, vectorDB, client);

            renderer.info(`Archiving Principle: ${opts.principle}...`);
            const res = await limb.storePrinciple(opts.principle, opts.source, parseFloat(opts.confidence));

            if (res.ok) {
                renderer.success(`Principle anchored to neurological memory: ${res.value.id}`);
            } else {
                renderer.error(`Failed to anchor principle: ${res.error?.message}`);
            }
        });

    program
        .command('read <target>')
        .description('Intelligent read dispatcher (ID = Gutenberg, Path = VS Code)')
        .action(async (target: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const isId = /^\d+$/.test(target);

            if (isId) {
                const result = await engine.executePlan({
                    goal: `Dispatched read: Gutenberg ID ${target}`,
                    steps: ["Accessing Project Gutenberg substrate"],
                    tool: 'gutenberg_read',
                    parameters: { bookId: parseInt(target) },
                    reasoning: 'Dispatched read: Gutenberg ID detected.',
                    model: config.orchestratorModel,
                    severity: 20,
                    interaction: 'text',
                    yaoState: YaoState.OldYang,
                    todos: []
                });
                handleResult(result, renderer, state);
            } else {
                const result = await engine.executePlan({
                    goal: `Dispatched read: File ${target}`,
                    steps: ["Accessing VS Code file buffer"],
                    tool: 'vscode_read',
                    parameters: { filePath: resolve(target) },
                    reasoning: 'Dispatched read: File path detected.',
                    model: config.orchestratorModel,
                    severity: 5,
                    interaction: 'text',
                    yaoState: YaoState.YoungYin,
                    todos: []
                });
                handleResult(result, renderer, state);
            }
        });

    // Alias 'vs [path]' to 'vs open [path]' to preserve legacy UX
    vs.action(async (path: any) => {
        // If path is a string, it's likely the legacy 'pog2 vs path' call
        if (typeof path === 'string') {
            renderer.info(`Opening Sovereign Workspace: ${path}...`);
            const cp = await import('child_process');
            cp.exec(`code "${resolve(path)}"`, (err) => {
                if (err) renderer.error(`Failed to launch VS Code: ${err.message}`);
            });
        } else {
            // Otherwise show help
            vs.help();
        }
    });


    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // GENERATE COMMANDS
    //
    // Phase 7: Sovereign Self-Modification Commands
    program
        .command('spawn <name>')
        .description('Create a new limb via sovereign self-modification (divination-gated, git-atomic)')
        .requiredOption('-c, --category <cat>', 'creative | technical | spatial | metaphysical')
        .requiredOption('-i, --intent <text>', 'What this component does')
        .option('-m, --model <model>', 'Model override for code generation')
        .action(async (name: string, opts: { category: string; intent: string; model?: string }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const targetPath = resolve(`src/limbs/${opts.category}/${name}.ts`);
            const result = await engine.selfModify({
                targetPath,
                operation: 'create',
                intent: opts.intent,
                modelOverride: opts.model
            });
            if (result.ok) {
                renderer.success(`✨ ${name} [${result.value.hexagram}] @ ${result.value.commit.slice(0, 7)} (${result.value.linesGenerated} lines)`);
            } else {
                renderer.error(`🌑 ${result.error instanceof Error ? result.error.message : String(result.error)}`);
            }
        });

    program
        .command('extend <path>')
        .description('Extend an existing file via sovereign self-modification')
        .option('-i, --intent <text>', 'What to add', 'Continue implementation')
        .option('-m, --model <model>', 'Model override')
        .action(async (targetPath: string, opts: { intent: string; model?: string }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.selfModify({
                targetPath: resolve(targetPath),
                operation: 'extend',
                intent: opts.intent,
                modelOverride: opts.model
            });
            if (result.ok) {
                renderer.success(`✨ Extended [${result.value.hexagram}] @ ${result.value.commit.slice(0, 7)}`);
            } else {
                renderer.error(`🌑 ${result.error instanceof Error ? result.error.message : String(result.error)}`);
            }
        });

    program
        .command('heal <path>')
        .description('Heal a file — fill missing implementations via sovereign self-modification')
        .option('-m, --model <model>', 'Model override')
        .action(async (targetPath: string, opts: { model?: string }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.selfModify({
                targetPath: resolve(targetPath),
                operation: 'heal',
                intent: 'Fill all missing implementations and stubs',
                modelOverride: opts.model
            });
            if (result.ok) {
                renderer.success(`✨ Healed [${result.value.hexagram}] @ ${result.value.commit.slice(0, 7)}`);
            } else {
                renderer.error(`🌑 ${result.error instanceof Error ? result.error.message : String(result.error)}`);
            }
        });

    program
        .command('knock-test <target>')
        .description('Test SovereignKnock authentication')
        .option('-s, --sequence <hexagrams>', '6 hexagrams comma-separated', config.knock?.defaultSequence?.join(', ') || '䷀, ䷁, ䷂, ䷃, ䷄, ䷅')
        .action(async (target: string, opts: { sequence: string }) => {
            const sequence = opts.sequence.split(',').map((h: string) => h.trim());
            const chromaLimb = new (await import('./limbs/spatial/ChromaLimb.js')).ChromaLimb(config);

            const knock = {
                iChingSequence: sequence,
                chromaticSoul: await chromaLimb.generateFromSequence(sequence),
                temporalFingerprint: `test-nonce-${Date.now()}`,
                anatomicalProof: { limbCount: 33, structuralIntegrity: 9 }
            };

            const result = await router.sovereignKnock(knock);
            if (result.ok) {
                renderer.success(`✨ Knock accepted: ${target} exposed [State: ${result.value}]`);
            } else {
                renderer.error(`🌑 Rejected: ${result.error instanceof Error ? result.error.message : String(result.error)}`);
            }
        });

    // GENERATE COMMANDS
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const gen = program.command('gen')
        .description('Generation and Mapping commands');

    gen.command('clinical-audit')
        .description('Perform a Clinical Audit of the Sovereign Organism and its substrates')
        .action(async () => {
            console.log('--- Sovereign Clinical Audit ---');
            console.log('Status: Implementation Pending');
            console.log('Action: Audit would verify NeurologicalMap against active substrate files.');
        });

    gen.command('jsdoc <file>')
        .description('Generate JSDoc for a file')
        .option('-m, --model <model>', 'Override model selection')
        .action(async (file: string, opts: { model: any; }) => {
            if (!existsSync(file)) {
                renderer.error(`File not found: ${file}`);
                return;
            }

            const engine = new GenerateEngine(config, router);
            const result = await engine.generateDocs({
                filePath: resolve(file),
                modelOverride: opts.model
            });

            handleResult(result, renderer, state);
        });

    gen
        .command('code <task>')
        .description('Generate code from a natural language task description')
        .option('-f, --file <path>', 'Target file to write output to')
        .option('-l, --lang <language>', 'Target language (ts, js, py, go, rs)', 'ts')
        .option('-m, --model <model>', 'Override model selection')
        .option('--improve', 'Improve existing code at --file instead of generating from scratch')
        .option('--adversarial', 'Enable 3-agent adversarial validation loop', false)
        .action(async (task: string, opts: { lang: any; file: any; model: any; improve: any; adversarial: any; }) => {
            const complexity = await router.classify(task);
            logger.info({ task: task.substring(0, 60), complexity }, 'Generating code');

            const engine = new GenerateEngine(config, router);
            const result = await engine.generateCode({
                task,
                language: opts.lang,
                targetFile: opts.file,
                modelOverride: opts.model,
                improve: opts.improve,
                adversarial: opts.adversarial,
                complexity
            });

            handleResult(result, renderer, state);
        });

    gen
        .command('jsdoc <file>')
        .description('Generate JSDoc/inline documentation for a source file')
        .option('-m, --model <model>', 'Override model selection')
        .action(async (file: string, opts: { model: any; }) => {
            if (!existsSync(file)) {
                renderer.error(`File not found: ${file}`);
                return;
            }

            const engine = new GenerateEngine(config, router);
            const result = await engine.generateDocs({
                filePath: resolve(file),
                modelOverride: opts.model
            });

            handleResult(result, renderer, state);
        });

    gen
        .command('test <file>')
        .description('Generate integration tests for a source file (NO MOCKS)')
        .option('-m, --model <model>', 'Override model selection')
        .option('-o, --output <path>', 'Output test file path')
        .action(async (file: string, opts: { output: any; model: any; }) => {
            if (!existsSync(file)) {
                renderer.error(`File not found: ${file}`);
                return;
            }

            const engine = new GenerateEngine(config, router);
            const result = await engine.generateTests({
                filePath: resolve(file),
                outputPath: opts.output,
                modelOverride: opts.model
            });

            handleResult(result, renderer, state);
        });

    gen
        .command('refactor <file>')
        .description('Refactor a source file according to sovereign laws')
        .option('-m, --model <model>', 'Override model selection')
        .option('--rules <rules>', 'Additional rules to enforce (comma-separated)')
        .action(async (file: string, opts: { model: any; rules: string; }) => {
            if (!existsSync(file)) {
                renderer.error(`File not found: ${file}`);
                return;
            }

            const engine = new CodeEngine(config, router);
            const result = await engine.refactor({
                filePath: resolve(file),
                modelOverride: opts.model,
                additionalRules: opts.rules?.split(',').map((r: string) => r.trim()) ?? []
            });

            handleResult(result, renderer, state);
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // CODE COMMANDS
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const code = program.command('code').description('Code analysis and transformation tasks');

    code
        .command('review <file>')
        .description('Adversarial code review with ternary severity scoring')
        .option('-m, --model <model>', 'Override model selection')
        .option('--strict', 'Enforce all sovereign laws strictly', false)
        .action(async (file: string, opts: { model: any; strict: any; }) => {
            if (!existsSync(file)) {
                renderer.error(`File not found: ${file}`);
                return;
            }

            const engine = new CodeEngine(config, router);
            const result = await engine.review({
                filePath: resolve(file),
                modelOverride: opts.model,
                strict: opts.strict
            });

            handleResult(result, renderer, state);
        });

    code
        .command('explain <file>')
        .description('Generate a deep explanation of what a file does and why')
        .option('-m, --model <model>', 'Override model selection')
        .option('--section <lines>', 'Only explain a section (format: start:end)')
        .action(async (file: string, opts: { section: string; model: any; }) => {
            if (!existsSync(file)) {
                renderer.error(`File not found: ${file}`);
                return;
            }

            let lineRange: [number, number] | undefined;
            if (opts.section) {
                const parts = opts.section.split(':').map(Number);
                if (parts.length === 2 && parts[0] && parts[1]) {
                    lineRange = [parts[0], parts[1]];
                }
            }

            const engine = new CodeEngine(config, router);
            const result = await engine.explain({
                filePath: resolve(file),
                lineRange,
                modelOverride: opts.model
            });

            handleResult(result, renderer, state);
        });

    code
        .command('fix <file>')
        .description('Autonomously fix TypeScript/lint errors in a file')
        .option('-m, --model <model>', 'Override model selection')
        .option('--dry-run', 'Preview changes without writing to disk', false)
        .action(async (file: string, opts: { model: any; dryRun: any; }) => {
            if (!existsSync(file)) {
                renderer.error(`File not found: ${file}`);
                return;
            }

            const engine = new CodeEngine(config, router);
            const result = await engine.fix({
                filePath: resolve(file),
                modelOverride: opts.model,
                dryRun: opts.dryRun
            });

            handleResult(result, renderer, state);
        });

    code
        .command('diff <fileA> <fileB>')
        .description('Semantic diff between two files â€” explains changes in natural language')
        .option('-m, --model <model>', 'Override model selection')
        .action(async (fileA: string, fileB: string, opts: { model: any; }) => {
            if (!existsSync(fileA)) { renderer.error(`File not found: ${fileA}`); process.exit(1); }
            if (!existsSync(fileB)) { renderer.error(`File not found: ${fileB}`); process.exit(1); }

            const engine = new CodeEngine(config, router);
            const result = await engine.semanticDiff({
                fileA: resolve(fileA),
                fileB: resolve(fileB),
                modelOverride: opts.model
            });

            handleResult(result, renderer, state);
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // EMBED COMMANDS
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const embed = program.command('embed').description('Embedding and semantic search operations');

    embed
        .command('index <path>')
        .description('Index a directory or file into the local VectorDB')
        .option('--project <id>', 'Project ID to associate embeddings with')
        .option('--force', 'Re-index even if already indexed', false)
        .option('--exclude <patterns>', 'Comma-separated glob patterns to exclude')
        .action(async (path: string, opts: { project: any; force: any; }) => {
            if (!existsSync(path)) {
                renderer.error(`Path not found: ${path}`);
                return;
            }

            const engine = new EmbedEngine(config, renderer, router);
            const result = await engine.index({
                path: resolve(path),
                projectId: opts.project || config.projectId,
                force: opts.force
            });

            handleResult(result, renderer, state);
        });

    embed
        .command('search <query>')
        .description('Semantic search across all indexed project substrates')
        .option('-n, --limit <number>', 'Number of results to return', '5')
        .option('-t, --threshold <score>', 'Minimum similarity score (0.0-1.0)', '0.0')
        .option('--project <id>', 'Filter by project ID')
        .action(async (query: string, opts: { limit: string; threshold: string; project: any; }) => {
            const engine = new EmbedEngine(config, renderer, router);
            const result = await engine.search({
                query,
                topK: parseInt(opts.limit),
                threshold: parseFloat(opts.threshold),
                projectId: opts.project || config.projectId
            });

            handleResult(result, renderer, state);
        });

    embed
        .command('similarity <fileA> <fileB>')
        .description('Compute semantic similarity score between two files')
        .option('--metadata', 'Include detailed metadata in output', false)
        .action(async (fileA: string, fileB: string, opts: { metadata: any; }) => {
            if (!existsSync(fileA)) { renderer.error(`File not found: ${fileA}`); process.exit(1); }
            if (!existsSync(fileB)) { renderer.error(`File not found: ${fileB}`); process.exit(1); }

            const engine = new EmbedEngine(config, renderer, router);
            const result = await engine.similarity({
                fileA: resolve(fileA),
                fileB: resolve(fileB),
                metadata: opts.metadata
            });

            handleResult(result, renderer, state);
        });

    embed
        .command('list')
        .description('List all indexed projects and file counts')
        .action(async () => {
            const engine = new EmbedEngine(config, renderer, router);
            const result = await engine.listProjects();
            handleResult(result, renderer, state);
        });

    embed
        .command('delete <project>')
        .description('Delete all embeddings for a specific project')
        .action(async (project: string) => {
            const engine = new EmbedEngine(config, renderer, router);
            const result = await engine.deleteProject(project);
            handleResult(result, renderer, state);
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // MEMORY MAINTENANCE COMMANDS
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const memory = program.command('memory').description('System vector memory maintenance tools');

    memory
        .command('inspect')
        .description('Inspect the VectorDB learning memory for health and row counts')
        .action(async () => {
            const maintenance = new DBMaintenance();
            const res = await maintenance.inspect();
            if (res.ok) renderer.json(res.value);
            else renderer.error(res.error instanceof Error ? res.error.message : String(res.error));
        });

    memory
        .command('backup')
        .description('Backup the learning VectorDB to a safe secondary location')
        .action(async () => {
            const maintenance = new DBMaintenance();
            const res = await maintenance.backup();
            if (res.ok) renderer.success(`Backup created at: ${res.value}`);
            else renderer.error(res.error instanceof Error ? res.error.message : String(res.error));
        });

    memory
        .command('compress')
        .description('Compress the learning VectorDB by vacuuming and removing old entries')
        .option('--days <n>', 'Number of days of memory to keep', '30')
        .action(async (opts: { days: string; }) => {
            const maintenance = new DBMaintenance();
            const res = await maintenance.compress(parseInt(opts.days));
            if (res.ok) renderer.success(`Memory compressed. Removed ${res.value} old entries.`);
            else renderer.error(res.error instanceof Error ? res.error.message : String(res.error));
        });

    memory
        .command('repair')
        .description('Attempt to repair corruption in the learning VectorDB')
        .action(async () => {
            const maintenance = new DBMaintenance();
            const res = await maintenance.repair();
            if (res.ok) renderer.success('Memory vacuum and repair operation completed.');
            else renderer.error(res.error instanceof Error ? res.error.message : String(res.error));
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // COMPLETE COMMANDS
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const complete = program.command('complete').description('Code completion and continuation tasks');

    complete
        .command('cursor <file> <line> <col>')
        .description('Get code completion at a specific cursor position')
        .option('-m, --model <model>', 'Override model selection')
        .option('-n, --count <n>', 'Number of completion candidates', '3')
        .action(async (file: string, line: string, col: string, opts: { count: string; model: any; }) => {
            if (!existsSync(file)) {
                renderer.error(`File not found: ${file}`);
                return;
            }

            const engine = new CompletionEngine(config, router);
            const result = await engine.atCursor({
                filePath: resolve(file),
                line: parseInt(line),
                column: parseInt(col),
                count: parseInt(opts.count),
                modelOverride: opts.model
            });

            handleResult(result, renderer, state);
        });

    complete
        .command('fill <file>')
        .description('Fill in missing implementations (TODO markers, empty stubs)')
        .option('-m, --model <model>', 'Override model selection')
        .option('--dry-run', 'Preview completions without writing', false)
        .action(async (file: string, opts: { dryRun: any; model: any; }) => {
            if (!existsSync(file)) {
                renderer.error(`File not found: ${file}`);
                return;
            }

            const engine = new CompletionEngine(config, router);
            const result = await engine.fillMissing({
                filePath: resolve(file),
                dryRun: opts.dryRun,
                modelOverride: opts.model
            });

            handleResult(result, renderer, state);
        });

    complete
        .command('continue <file>')
        .description('Continue an incomplete file from where it left off')
        .option('-m, --model <model>', 'Override model selection')
        .option('--lines <n>', 'Target continuation length in lines', '50')
        .action(async (file: string, opts: { lines: string; model: any; }) => {
            if (!existsSync(file)) {
                renderer.error(`File not found: ${file}`);
                return;
            }

            const engine = new CompletionEngine(config, router);
            const result = await engine.continueFile({
                filePath: resolve(file),
                targetLines: parseInt(opts.lines),
                modelOverride: opts.model
            });

            handleResult(result, renderer, state);
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // FORGE COMMANDS
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const scaffold = program.command('scaffold').description('Creative and technical scaffolding tools');

    scaffold
        .command('web <prompt>')
        .description('Plan and scaffold a new web application')
        .option('-t, --template <name>', 'Cloudflare template to use as base')
        .option('-s, --synthetic', 'Forge a novel application by synthesizing patterns')
        .option('-p, --path <path>', 'Destination directory', '.')
        .action(async (prompt: string, opts: { path: string; template: any; synthetic: any; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Scaffold webapp: ${prompt}`,
                steps: ["Planning application architecture", "Synthesizing patterns / Templates", "Generating cognitive assets"],
                tool: 'scaffold_webapp',
                parameters: {
                    prompt,
                    targetPath: resolve(opts.path),
                    template: opts.template,
                    synthetic: opts.synthetic
                },
                reasoning: 'Manual webapp scaffolding.',
                model: config.orchestratorModel,
                severity: 50,
                interaction: 'silent',
                yaoState: YaoState.YoungYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // CONFIG COMMANDS
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const cfg = program.command('config').description('Manage POG2-CLI configuration');

    cfg
        .command('set <key> <value>')
        .description('Set a configuration key')
        .action((key: string, value: string) => {
            const result = setConfigKey(CONFIG_FILE, key, value);
            if (result.ok) {
                renderer.success(`Config updated: ${key} = ${value}`);
            } else {
                renderer.error(result.error instanceof Error ? result.error.message : String(result.error));
                return;
            }
        });

    cfg
        .command('get [key]')
        .description('Get configuration value(s)')
        .action((key?: string) => {
            if (key) {
                const val = (config as unknown as Record<string, unknown>)[key];
                renderer.info(`${key}: ${JSON.stringify(val ?? 'not set')}`);
            } else {
                renderer.json(config);
            }
        });

    cfg
        .command('reset')
        .description('Reset config to defaults')
        .action(() => {
            const result = resetConfig(CONFIG_FILE);
            if (result.ok) {
                renderer.success('Config reset to sovereign defaults');
            } else {
                renderer.error(result.error instanceof Error ? result.error.message : String(result.error));
                return;
            }
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // COOLDOWN COMMAND (Hugging Face Fallback Management)
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    program
        .command('cooldown [action]')
        .description('Manage Ollama cooldown and Hugging Face fallback (action: status, activate, clear)')
        .action((action: string = 'status') => {
            const cooldownStatus = router.getCooldownStatus();

            switch (action) {
                case 'activate':
                    router.activateOllamaCooldown();
                    renderer.success('Ollama cooldown activated â€” using Hugging Face fallback for 61 minutes');
                    break;
                case 'clear':
                    router.clearOllamaCooldown();
                    renderer.success('Ollama cooldown cleared â€” routing restored to local models');
                    break;
                case 'status':
                default:
                    if (cooldownStatus.ollamaOnCooldown) {
                        renderer.info(`Ollama cooldown active â€” ${cooldownStatus.ollamaRemainingMinutes} minutes remaining`);
                        renderer.info(`Fallback: ${config.huggingfaceFallbackModel}`);
                    } else {
                        renderer.success('Ollama is active â€” no cooldown in effect');
                    }
                    if (cooldownStatus.hfOnCooldown) {
                        renderer.warn(`HF Kimi cooldown active â€” ${cooldownStatus.hfRemainingMinutes} minutes remaining`);
                    }
                    break;
            }
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // STATUS COMMAND
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    program
        .command('status')
        .description('Show sovereign substrate status and metrics')
        .action(() => {
            const s = state.getState();
            const cooldownStatus = router.getCooldownStatus();
            renderer.status({
                mode: s.mode,
                workspace: s.selectedWorkspace ?? 'none',
                metrics: s.metrics,
                cooldown: {
                    onCooldown: cooldownStatus.ollamaOnCooldown,
                    remainingMinutes: cooldownStatus.ollamaRemainingMinutes,
                    hfOnCooldown: cooldownStatus.hfOnCooldown,
                    hfRemainingMinutes: cooldownStatus.hfRemainingMinutes
                },
                config: {
                    orchestratorModel: config.orchestratorModel,
                    huggingfaceFallbackModel: config.huggingfaceFallbackModel,
                    codingHeavyModel: config.codingHeavyModel,
                    codingFastModel: config.codingFastModel,
                    visionModel: config.visionModel,
                    voiceModel: config.voiceModel,
                    embeddingModel: config.embeddingModel,
                    contextWindow: config.contextWindow,
                    temperature: config.temperature
                },
                // Phase 78: Resource Budget Tiers
                budget: {
                    fast: { model: config.fastPathModel, latency: '<3s', usage: 'Reflexes, classification, syntax checks' },
                    mid: { model: config.midPathModel, latency: '3-10s', usage: 'File modifications, structured reasoning' },
                    deep: { model: config.deepPathModel, latency: '10-60s', usage: 'Architecture audits, meta-cognition' }
                }
            });
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // SPECIALIZED SOVEREIGN COMMANDS
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    program
        .command('forge <prompt>')
        .description('Professional image/visual generation via Flux')
        .option('-m, --model <model>', 'Override model selection')
        .action(async (prompt: string, opts: { model: any; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.run(`forge a visual substrate for: ${prompt}${opts.model ? ` using ${opts.model}` : ''}`);
            handleResult(result, renderer, state);
        });

    program
        .command('score <prompt>')
        .description('Procedural background audio scoring via ffmpeg')
        .option('-d, --duration <n>', 'Duration in seconds', '10')
        .action(async (prompt: string, opts: { duration: any; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.run(`score a background soundtrack for: ${prompt} with duration ${opts.duration}s`);
            handleResult(result, renderer, state);
        });

    program
        .command('wisdom <query>')
        .description('Ontological thinking and metabolic expansion')
        .action(async (query: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.run(`think deeply about: ${query}`);
            handleResult(result, renderer, state);
        });

    program
        .command('absorb <prompt> <response>')
        .description('Absorb a CLI interaction into the training substrate')
        .option('-c, --category <cat>', 'Training category', 'general')
        .action(async (prompt: string, response: string, opts: { category: any; }) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: `Absorb training interaction: ${opts.category}`,
                steps: ["Injecting clinical samples into substrate"],
                tool: 'model_train',
                parameters: { prompt, response, category: opts.category },
                reasoning: 'Manual training absorption.',
                model: config.masterLocalModel,
                severity: 10,
                interaction: 'silent',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    program
        .command('serve')
        .description('Start the external Switchboard Bridge for remote orchestration and visual feedback')
        .option('-p, --port <number>', 'Port to listen on', config.wsPort.toString())
        .action(async (opts: { port: string; }) => {
            const port = parseInt(opts.port);
            renderer.info(`⚡ Awakening the Sovereign Bridge on port ${port}...`);
            const engine = new OrchestrateEngine(config, router, renderer);
            await engine.initialize();
            await engine.getSwitchboard().startServer(port, engine);
            renderer.success(`Bridge ONLINE. External CLI and Sovereign Eye mirror active.`);

            // Keep process alive
            process.stdin.resume();
        });

    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    // RSMV SUBSTRATE COMMANDS
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const rsmv = program.command('rsmv').description('Biological constraint and kinetic profile extraction from RSMV data');

    rsmv
        .command('extract <file>')
        .description('Parse a RuneScape model file and ingest its anatomical wisdom')
        .action(async (file: string) => {
            if (!existsSync(file)) {
                renderer.error(`File not found: ${file}`);
                return;
            }

            try {
                const modelData = JSON.parse(readFileSync(file, 'utf8'));
                const engine = new OrchestrateEngine(config, router, renderer);
                const result = await engine.executePlan({
                    goal: `CLI RSMV Extraction: ${file}`,
                    steps: ["Parsing model data", "Extracting biological constraints", "Memory ingestion"],
                    tool: 'rsmv_extract',
                    parameters: { modelData },
                    reasoning: 'Manual CLI-initiated extraction.',
                    model: config.orchestratorModel,
                    severity: 20,
                    interaction: 'text',
                    yaoState: YaoState.YoungYang,
                    todos: []
                });
                handleResult(result, renderer, state);
            } catch (err) {
                renderer.error(`Failed to parse model data: ${(err as Error).message}`);
            }
        });

    rsmv
        .command('status')
        .description('Probe the health and readiness of the RSMV sensory node')
        .action(async () => {
            const extractor = new RSMVExtractor();
            const probe = extractor.healthCheck();
            if (probe.online) renderer.success(`RSMV Substrate: ${probe.details}`);
            else renderer.error(`RSMV Substrate OFFLINE: ${probe.details}`);
        });

    program
        .command('execute <toolName> [parameters]')
        .description('Manually execute any registered tool in the substrate')
        .action(async (toolName: string, parameters: string) => {
            const engine = new OrchestrateEngine(config, router, renderer);
            let parsedParams = {};
            try {
                if (parameters) parsedParams = JSON.parse(parameters);
            } catch (e) {
                renderer.error('Failed to parse parameters. Ensure they are valid JSON.');
                return;
            }

            const result = await engine.executePlan({
                goal: `Manual tool execution: ${toolName}`,
                steps: ["Direct substrate intervention"],
                tool: toolName,
                parameters: parsedParams,
                reasoning: `Manual direct tool execution: ${toolName}`,
                model: config.orchestratorModel,
                severity: 15,
                interaction: 'text',
                yaoState: YaoState.YoungYang,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    program
        .command('capabilities')
        .description('Alias for system capabilities')
        .action(async () => {
            const engine = new OrchestrateEngine(config, router, renderer);
            const result = await engine.executePlan({
                goal: 'Substrate discovery',
                steps: ["Enumerating latent capabilities"],
                tool: 'discover_capabilities',
                parameters: {},
                reasoning: 'Manual substrate discovery (alias).',
                model: config.orchestratorModel,
                severity: 10,
                interaction: 'text',
                yaoState: YaoState.YoungYin,
                todos: []
            });
            handleResult(result, renderer, state);
        });

    await program.parseAsync(process.argv);

    // For single-shot commands, automatically exit unless we are supposed to enter REPL
    const commandName = program.args[0];
    if (commandName && ['player', 'npc', 'status', 'health', 'personality', 'read', 'gutenberg', 'cooldown', 'config', 'memory', 'consult-shadow', 'consult-memetics', 'consult-syntropy', 'init', 'system', 'vs', 'rsmv', 'atlas', 'learn'].includes(commandName)) {
        // Clinical exit: allow more time for pino to flush and background MCP links to settle
        setTimeout(() => process.exit(0), 500);
    } else if (commandName) {
        renderer.info('\nTask sequence complete. Transitioning to Sovereign REPL...');
        await startRepl(renderer, config, router, client, state);
    }
}

async function startRepl(renderer: Renderer, config: SovereignConfig, router: TernaryRouter, client: ModelClient, state: StateManager, initialPrompt?: string): Promise<void> {
    renderer.showBanner();
    renderer.greet();
    await checkSubstrate(renderer, config, client);

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    renderer.setReadline(rl);

    const engine = new OrchestrateEngine(config, router, renderer);
    await engine.initialize();
    const { VectorDB } = await import('./utils/VectorDB.js');
    const { MemoryConsolidationEngine } = await import('./engines/MemoryConsolidationEngine.js');
    const vectorDB = new VectorDB({ client });
    const consolidationEngine = new MemoryConsolidationEngine(client, vectorDB, state);

    vectorDB.initialize();

    const promptString = `\x1b[38;5;51mKimi\x1b[0m > `;

    const gracefulShutdown = async () => {
        renderer.info('\nI will consolidate our memories before leaving...');
        try {
            await consolidationEngine.consolidate();
        } catch (err) {
            renderer.warn('Memory Consolidation hit a snag: ' + (err as Error).message);
        }

        renderer.info('Compressing database substrate...');
        try {
            const maintenance = new DBMaintenance();
            await maintenance.compress(); // Triggers DELETE old + VACUUM
        } catch (err) {
            renderer.warn('DB Maintenance failed: ' + (err as Error).message);
        }

        renderer.info('Powering down now. I hope to see you again soon!');
        rl.close();
        process.exit(0);
    };

    // Handle Ctrl+C (SIGINT) gracefully to ensure memory consolidation runs 
    rl.on('SIGINT', () => {
        gracefulShutdown();
    });

    while (true) {
        let intent: string;
        try {
            intent = await rl.question(promptString);
        } catch (err) {
            if ((err as { code?: string })?.code === 'ABORT_ERR') {
                await gracefulShutdown();
                return;
            }
            throw err;
        }

        const cmd = intent.trim();
        if (!cmd) continue;

        const lowerCmd = cmd.toLowerCase();
        if (lowerCmd === 'exit' || lowerCmd === 'quit') {
            await gracefulShutdown();
            return;
        }

        // Slash Commands
        if (cmd.startsWith('/')) {
            const [slash, ...args] = cmd.split(' ');
            const targetPath = args[0] || '.';

            switch (slash?.toLowerCase()) {
                case '/help':
                    renderer.info('Here are the shortcuts I know: /help, /status, /capabilities, /registry, /vision, /shadow, /memetics, /syntropy, /health, /clear, /pull, /vs, /exit');
                    break;
                case '/capabilities':
                    await engine.run('discover all substrate capabilities and latent engines');
                    break;
                case '/registry':
                    await engine.run('list all registered tools in the sovereign substrate');
                    break;
                case '/shadow':
                    await engine.run('consult shadow substrate');
                    break;
                case '/memetics':
                    await engine.run('consult latest memetic research');
                    break;
                case '/syntropy':
                    await engine.run('harmonize external metadata paradigms');
                    break;
                case '/vs':
                    renderer.info(`Opening our workspace in VS Code...`);
                    import('child_process').then(cp => {
                        cp.exec(`code "${resolve(targetPath)}"`, (err) => {
                            if (err) renderer.error(`Failed to launch VS Code: ${err.message}`);
                        });
                    });
                    break;
                case '/pull': {
                    const modelToPull = args[0];
                    if (!modelToPull) {
                        renderer.error('Usage: /pull [model_name]');
                    } else {
                        renderer.info(`I'll start downloading that for you: ${modelToPull}...`);
                        await engine.run(`download and pull the ollama model: ${modelToPull}`);
                    }
                    break;
                }
                case '/status': {
                    const s = state.getState();
                    const cd = router.getCooldownStatus();
                    renderer.status({
                        mode: s.mode,
                        workspace: s.selectedWorkspace ?? 'none',
                        metrics: s.metrics,
                        config,
                        cooldown: {
                            onCooldown: cd.ollamaOnCooldown,
                            remainingMinutes: cd.ollamaRemainingMinutes,
                            hfOnCooldown: cd.hfOnCooldown,
                            hfRemainingMinutes: cd.hfRemainingMinutes
                        }
                    });
                    break;
                }
                case '/vision':
                    await engine.run('spatial observation / eye');
                    break;
                case '/health':
                    await engine.run('system health check');
                    break;
                case '/rolodex': {
                    const rolodexRef = router.getRolodex();
                    if (rolodexRef) {
                        if (intent.includes('refresh')) {
                            renderer.info('🔄 Refreshing all provider models...');
                            await rolodexRef.refreshAll();
                        }
                        renderer.output(rolodexRef.getFormattedSummary());
                    } else {
                        renderer.error('ModelRolodex not initialized.');
                    }
                    break;
                }
                case '/providers': {
                    const rolodexRef2 = router.getRolodex();
                    if (rolodexRef2) {
                        renderer.info('Checking my connections to model providers...');
                        await rolodexRef2.refreshAll();
                        const statuses = rolodexRef2.getAllProviderStatuses();
                        const lines: string[] = ['═══ PROVIDER IDENTITY VERIFICATION ═══', ''];
                        for (const s of statuses) {
                            const icon = s.authenticated ? '\x1b[38;5;154m✓\x1b[0m' : '\x1b[38;5;196m✗\x1b[0m';
                            lines.push(`${icon} ${s.provider.toUpperCase()}`);
                            if (s.account) lines.push(`  Account: ${s.account}`);
                            if (s.email) lines.push(`  Email: ${s.email}`);
                            lines.push(`  Models: ${s.models.length} | Latency: ${s.latencyMs}ms`);
                            if (s.error) lines.push(`  Error: ${s.error}`);
                            lines.push('');
                        }
                        renderer.output(lines.join('\n'));
                    } else {
                        renderer.error('ModelRolodex not initialized.');
                    }
                    break;
                }
                case '/clear':
                    console.clear();
                    renderer.showBanner();
                    break;
                default:
                    renderer.error(`Unknown slash command: ${slash}`);
            }
            continue;
        }

        try {
            const thinkingMessages = [
                'Give me a moment to think...',
                'Analyzing that...',
                'Let me see what I can find...',
                'Processing your request...',
                'Thinking it through...'
            ];
            const msg = thinkingMessages[Math.floor(Math.random() * thinkingMessages.length)];
            renderer.info(msg);
            const result = await engine.run(intent);
            if (result.ok) {
                state.updateMetrics({ turnCount: 1 });
                // Professional Completion: Natural language response always.
                renderer.output(result.value.output, result.value.data);
            } else {
                renderer.error(result.error instanceof Error ? result.error.message : String(result.error));
            }
        } catch (err) {
            logger.error({ err }, 'Unhandled exception in conversational loop');
            renderer.error('An internal logic error occurred, but the shell survives.');
        }
    }
}

function handleResult(result: Result<{ output: string; data?: unknown }>, renderer: Renderer, state: StateManager): void {
    if (!result.ok) {
        const msg = result.error instanceof Error ? result.error.message : String(result.error);
        renderer.error(msg);
        logger.error({ error: msg }, 'Command failed');
        return;
    }

    state.updateMetrics({ turnCount: 1 });
    renderer.output(result.value.output, result.value.data);
}

function setConfigKey(configPath: string, key: string, value: string): Result<void> {
    try {
        const dir = dirname(configPath);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

        const existing = existsSync(configPath)
            ? JSON.parse(readFileSync(configPath, 'utf8'))
            : {};
        existing[key] = value;
        writeFileSync(configPath, JSON.stringify(existing, null, 2));
        return { ok: true, value: undefined };
    } catch (err) {
        return { ok: false, error: err as Error };
    }
}

function resetConfig(configPath: string): Result<void> {
    try {
        const dir = dirname(configPath);
        if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
        writeFileSync(configPath, JSON.stringify({
            mode: 'hybrid',
            planningModel: 'kimi-k2.5:cloud',
            codingModel: 'deepseek-r1:8b',
            embeddingModel: 'nomic-embed-text',
            criticModel: 'kimi-k2.5:cloud',
            projectId: 'global',
            embeddingDimensions: 768,
            wsPort: -1
        }, null, 2));
        return { ok: true, value: undefined };
    } catch (err) {
        return { ok: false, error: err as Error };
    }
}

main().catch(err => {
    // Commander's exitOverride throws CommanderError for --help/--version with exitCode 0
    if (err && typeof err === 'object' && 'exitCode' in err && (err as any).exitCode === 0) {
        process.exit(0);
    }
    const msg = err instanceof Error ? err.stack || err.message : String(err);
    console.error(`\x1b[38;5;196m[FATAL CLI ERROR]\x1b[0m ${msg}`);
    try {
        logger.fatal({ err }, 'Fatal CLI error');
    } catch (e) {
        // Fallback
    }
    process.exit(1);
});
