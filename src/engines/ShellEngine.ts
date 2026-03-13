import { exec } from 'child_process';
import { promisify } from 'util';
import { loadavg, totalmem, freemem } from 'os';
import pino from 'pino';
import { Renderer } from '../ui/Renderer.js';
import type { Result, EngineOutput } from '../core/models.js';

const execAsync = promisify(exec);
const logger = pino({ name: 'ShellEngine', base: { hostname: 'POG2' } });

export interface ShellParams {
    command: string;
    cwd?: string;
    description?: string;
    silent?: boolean;
}

/**
 * ShellEngine â€” Real command execution substrate.
 * Binary absolute: command succeeds or returns a detailed error.
 * Integrates with conversational approval via Renderer.
 */
export class ShellEngine {
    constructor(private readonly renderer: Renderer) { }

    async execute(params: ShellParams): Promise<Result<EngineOutput>> {
        const cwd = params.cwd ?? process.cwd();
        const startMem = freemem();
        const startTime = performance.now();

        logger.info({ command: params.command, cwd }, 'Executing shell command');

        if (!params.silent) {
            this.renderer.info(`Executing: ${params.command}`);
        }

        try {
            const { stdout, stderr } = await execAsync(params.command, {
                cwd,
                env: { ...process.env, POG2_ACTIVE: '1' }
            });

            const endTime = performance.now();
            const endMem = freemem();
            const memDelta = Math.abs(startMem - endMem);
            const duration = endTime - startTime;

            return {
                ok: true,
                value: {
                    output: stdout || '(empty output)',
                    data: {
                        command: params.command,
                        cwd,
                        stderr: stderr || null,
                        telemetry: {
                            durationMs: Math.round(duration),
                            memDeltaBytes: memDelta,
                            cpuLoad: loadavg()
                        }
                    }
                }
            };
        } catch (err: unknown) {
            const error = err as Error;
            const message = error.message || 'Unknown shell error';
            logger.error({ err, command: params.command }, 'Shell execution failed');

            return {
                ok: false,
                error: new Error(`Shell Error: ${message}`)
            };
        }
    }

    async checkHealth(): Promise<Record<string, any>> {
        return {
            totalMem: totalmem(),
            freeMem: freemem(),
            load: loadavg(),
            uptime: process.uptime()
        };
    }

    public healthCheck(): { online: boolean; details: string } {
        const load = loadavg()[0].toFixed(2);
        const free = (freemem() / (1024 * 1024 * 1024)).toFixed(1);
        return {
            online: true,
            details: `Shell Substrate: Load(${load}), FreeMem(${free}GB)`
        };
    }
}
