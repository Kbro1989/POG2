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

    async wrangler(args: { command: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`wrangler ${args.command}`);
    }

    async npm(args: { command: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`npm ${args.command}`);
    }

    async python(args: { command: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`python ${args.command}`);
    }

    async pip(args: { command: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`pip ${args.command}`);
    }

    async ollama(args: { command: string }): Promise<Result<EngineOutput>> {
        return this.executeWithDiagnostics(`ollama ${args.command}`);
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
            const yao = this.router.getHexagram().getYaoState();
            if (yao === YaoState.OldMixed || yao === YaoState.OldYin) {
                this.renderer.warn(`âš ï¸ METABOLIC WARNING: Performing npm install in unstable state (${yao}). Dependency flux detected.`);
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
