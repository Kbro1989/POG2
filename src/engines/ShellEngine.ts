import { exec } from 'child_process';
import { promisify } from 'util';
import { loadavg, totalmem, freemem } from 'os';
import { Renderer } from '../ui/Renderer.js';
import { TernaryRouter } from '../routing/TernaryRouter.js';
import { type Result, type EngineOutput, YaoState } from '../core/models.js';
import { createLogger } from "../utils/logger.js";

const execAsync = promisify(exec);
const logger = createLogger('ShellEngine');

export interface ShellParams {
    command: string;
    cwd?: string;
    description?: string;
    silent?: boolean;
}

/**
 * ShellEngine — Real command execution substrate.
 * Binary absolute: command succeeds or returns a detailed error.
 * Integrated with TernaryRouter for metabolic safety gating.
 */
export class ShellEngine {
    constructor(
        private readonly renderer: Renderer,
        private readonly router?: TernaryRouter
    ) { }

    async execute(params: ShellParams): Promise<Result<EngineOutput>> {
        const cwd = params.cwd ?? process.cwd();
        const startMem = freemem();
        const startTime = performance.now();

        // Ternary Safety Gating
        if (this.router) {
            const hex = this.router.getHexagram();
            const yao = hex.getYaoState();
            const directive = hex.getInterpretation().strategy;

            const destructivePatterns = /\b(rm\s+-[rf]|git\s+push\s+-f|del\s+\/q|rd\s+\/s|format\b|shred\b)/i;
            if (destructivePatterns.test(params.command)) {
                // YaoState genre check: YoungYin (0) covers both YoungYin and OldYin (retreat/decay)
                // OldMixed (4) or the genre-normalized YoungMixed (5) in some contexts covers chaos
                if (yao === YaoState.YoungYin || yao === YaoState.OldYin || yao === YaoState.OldMixed) {
                    const msg = `❌ COGNITIVE BLOCK: Destructive command rejected due to unstable/retreating state (${yao}). Strategy: ${directive}`;
                    logger.warn({ command: params.command, yao, directive }, msg);
                    this.renderer.error(msg);
                    return { ok: false, error: new Error(msg) };
                }
            }

            if (yao === YaoState.OldYang) {
                logger.info({ command: params.command, directive }, 'PROJECTIVE EXECUTION: High-metabolism metabolic burst detected.');
            }
        }

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
