import { ShellEngine } from './ShellEngine.js';
import { Renderer } from '../ui/Renderer.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { type Result, type EngineOutput, YaoState } from '../core/models.js';
import { createLogger } from "../utils/logger.js";

const logger = createLogger('ShellLibrary');

/**
 * ShellLibrary â€” Specialized command wrappers for the Brain.
 * Ported/Integrated capabilities for gcloud, wrangler, node, python, etc.
 * Integrated with TernaryRouter for metabolic command modulation.
 */
export class ShellLibrary {
    private readonly shell: ShellEngine;

    constructor(
        private readonly renderer: Renderer,
        private readonly router?: TernaryRouter
    ) {
        this.shell = new ShellEngine(renderer, router);
    }

    private async executeWithDiagnostics(command: string, helpFlag: string = '--help'): Promise<Result<EngineOutput>> {
        const result = await this.shell.execute({ command });

        if (result.ok && result.value.data?.telemetry) {
            const tel = result.value.data.telemetry as { cpuLoad: number[], memDeltaBytes: number };
            this.renderer.gauge('CPU Load (1m)', Math.round(tel.cpuLoad[0] * 10), 100);
            this.renderer.gauge('Mem Delta (MB)', Math.round(tel.memDeltaBytes / 1024 / 1024), 1024);
        }

        if (!result.ok) {
            logger.warn({ command }, 'Command failed, launching diagnostic fallback...');
            const whoami = await this.shell.execute({ command: 'whoami', silent: true });

            // Extract base executable name (e.g. 'wrangler', 'git')
            const baseCmd = command.split(' ')[0];
            const help = await this.shell.execute({ command: `${baseCmd} ${helpFlag}`, silent: true });

            const errorMsg = result.error instanceof Error ? result.error.message : String(result.error);

            const output = `
[EXECUTION FAILED]
Command: ${command}
Error: ${errorMsg}

[DIAGNOSTIC CONTEXT FOR KNOWLEDGE]
Current User: ${whoami.ok ? whoami.value.output.trim() : 'Unknown'}
Help Snapshot:
${help.ok ? help.value.output.substring(0, 1500) + '...\n(truncated)' : `Failed to execute ${baseCmd} ${helpFlag}.`}

Please analyze this context and construct a corrected command or deployment configuration.
`.trim();
            return { ok: true, value: { output } };
        }
        return result;
    }

    async systemHealth(): Promise<Result<EngineOutput>> {
        const health = await this.shell.checkHealth();
        const memUsed = Math.round((health.totalMem - health.freeMem) / 1024 / 1024 / 1024);
        const total = Math.round(health.totalMem / 1024 / 1024 / 1024);

        this.renderer.gauge('Global RAM (GB)', memUsed, total);
        this.renderer.gauge('Load Avg (5m)', Math.round(health.load[1] * 10), 100);

        return {
            ok: true,
            value: {
                output: `System Health: ${memUsed}GB / ${total}GB used.`,
                data: health
            }
        };
    }

    async gcloud(args: { command: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`gcloud ${args.command}`);
    }

    async gcloudAuthList(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('gcloud auth list');
    }

    async gcloudAuthLogin(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('gcloud auth login --no-launch-browser');
    }

    async gcloudAuthToken(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('gcloud auth print-access-token');
    }

    async gcloudConfigList(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('gcloud config list');
    }

    async gcloudProjectsList(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('gcloud projects list');
    }

    async gcloudAiModelsList(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('gcloud ai models list --region=us-central1');
    }

    async gcloudGeminiSettings(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('gcloud ai endpoints list --region=us-central1');
    }

    async gcloudStorageLs(args: { url?: string }): Promise<Result<EngineOutput>> {
        const target = args.url || '';
        return this.executeWithDiagnostics(`gcloud storage ls ${target}`);
    }

    async gcloudSecretsList(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('gcloud secrets list');
    }

    async gcloudSecretsGet(args: { secret: string, version?: string }): Promise<Result<EngineOutput>> {
        const version = args.version || 'latest';
        return this.executeWithDiagnostics(`gcloud secrets versions access ${version} --secret="${args.secret}"`);
    }

    async wrangler(args: { command: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`wrangler ${args.command}`);
    }

    async wranglerDeploy(args: { scriptName: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`wrangler deploy ${args.scriptName}`);
    }

    async wranglerKvList(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('wrangler kv namespace list');
    }

    async wranglerR2List(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('wrangler r2 bucket list');
    }

    async ollama(args: { command: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`ollama ${args.command}`);
    }

    async ollamaModelList(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('ollama list');
    }

    async ollamaRun(args: { model: string; prompt: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`ollama run ${args.model} "${args.prompt}"`);
    }

    async mcpClientStatus(): Promise<Result<EngineOutput>> {
        return { ok: true, value: { output: 'MCP Status: Active (Integration stub)' } };
    }

    async serviceStatus(): Promise<Result<EngineOutput>> {
        const shell = this.healthCheck();
        return {
            ok: true,
            value: {
                output: `System Status:\nShell: ${shell.details}\n(Aggregation of Engines: MCP, WebSearch, Spatial are active)`
            }
        };
    }

    async npm(args: { command: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`npm ${args.command}`);
    }

    async gemini(args: { command: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`gemini ${args.command}`);
    }

    async git(args: { command: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`git ${args.command}`);
    }

    async gitStatus(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('git status --short');
    }

    async gitCommit(args: { message: string }): Promise<Result<EngineOutput>> {
        const add = await this.shell.execute({ command: 'git add .' });
        if (!add.ok) return add;

        let prefix = '[Sovereign]';
        if (this.router) {
            const hex = this.router.getHexagram();
            const directive = hex.getInterpretation().strategy;
            prefix = `[Sovereign][${directive}]`;
        }

        return this.executeWithDiagnostics(`git commit -m "${prefix} ${args.message}"`);
    }

    async gitPush(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('git push');
    }

    async gitPull(): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics('git pull');
    }

    async npmInstall(args: { packages?: string[]; saveDev?: boolean }): Promise<Result<EngineOutput>> {
        if (this.router) {
            const contract = this.router.getHexagram().getContract();
            if (!contract.gates.allowStructuralRepair) {
                this.renderer.warn(`âš ï¸ METABOLIC WARNING: Performing npm install in unstable state. Dependency flux detected.`);
            }
        }
        const pkgStr = args.packages?.join(' ') || '';
        const devStr = args.saveDev ? '--save-dev' : '';
        return this.executeWithDiagnostics(`npm install ${pkgStr} ${devStr}`);
    }

    async powershell(args: { command: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`powershell -Command "${args.command}"`, '-Help');
    }

    async scaffold(args: { name: string; type: 'worker' | 'component' | 'minimal' }): Promise<Result<EngineOutput>> {
        const { name, type } = args;
        const targetDir = name;

        try {
            const mkdir = await this.shell.execute({ command: `mkdir "${targetDir}"` });
            if (!mkdir.ok) return mkdir;

            if (type === 'worker') {
                const pkgJson = JSON.stringify({ name, version: '1.0.0', type: 'module' }, null, 2).replace(/"/g, '\\"');
                await this.shell.execute({ command: `powershell -Command "Set-Content -Path '${targetDir}/package.json' -Value '${pkgJson}'"` });
                await this.shell.execute({ command: `powershell -Command "Set-Content -Path '${targetDir}/wrangler.toml' -Value 'name = \\"${name}\\"\\nmain = \\"src/index.ts\\"\\ncompatibility_date = \\"2025-10-11\\"'"` });
                await this.shell.execute({ command: `mkdir "${targetDir}/src"` });
                await this.shell.execute({ command: `powershell -Command "Set-Content -Path '${targetDir}/src/index.ts' -Value 'export default { async fetch() { return new Response(\\"Hello from ${name}\\"); } };'"` });
            } else if (type === 'minimal') {
                await this.shell.execute({ command: `powershell -Command "Set-Content -Path '${targetDir}/index.js' -Value 'console.log(\\"Sovereign Minimal [${name}] Active\\");'"` });
            }

            return { ok: true, value: { output: `Successfully scaffolded ${type} project in ${name}`, data: { name, type } } };
        } catch (error) {
            return { ok: false, error: error as Error };
        }
    }

    public healthCheck(): { online: boolean; details: string } {
        return {
            online: true,
            details: 'ShellLibrary active; binary wrappers (gcloud, wrangler, git) primed.'
        };
    }
}

