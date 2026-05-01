import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { loadavg, totalmem, freemem } from 'os';
import { existsSync } from 'fs';
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
 * ShellEngine â€” Real command execution substrate.
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
            const contract = hex.getContract();
            const yao = hex.getYaoState();
            const directive = hex.getInterpretation().strategy;

            const destructivePatterns = /\b(rm\s+-[rf]|git\s+push\s+-f|del\s+\/q|rd\s+\/s|format\b|shred\b)/i;
            if (destructivePatterns.test(params.command)) {
                if (!contract.gates.allowDestructiveCommands) {
                    const msg = `â Œ COGNITIVE BLOCK: Destructive command rejected due to unstable/retreating state (Contract Restraint). Strategy: ${directive}`;
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
            // High-fidelity migration to spawn for reliable shell substrate access on Windows
            const shell = process.env.ComSpec || 'cmd.exe';
            const child = spawn(params.command, {
                cwd,
                env: { 
                    ...process.env, 
                    SystemRoot: process.env.SystemRoot || 'C:\\Windows',
                    SystemDrive: process.env.SystemDrive || 'C:',
                    POG2_ACTIVE: '1' 
                },
                shell: true
            });

            let stdout = '';
            let stderr = '';

            child.stdout?.on('data', (data: Buffer) => { stdout += data.toString(); });
            child.stderr?.on('data', (data: Buffer) => { stderr += data.toString(); });

            const exitCode = await new Promise<number | null>((resolve) => {
                child.on('close', (code) => resolve(code));
            });

            const endTime = performance.now();
            const duration = (endTime - startTime) / 1000;
            const endMem = freemem();
            const memDelta = Math.abs(startMem - endMem);

            if (exitCode !== 0) {
                logger.error({ error: stderr, exitCode, command: params.command }, 'Shell Error');
                return { 
                    ok: false, 
                    error: new Error(stderr || `Process exited with code ${exitCode}`)
                };
            }

            return {
                ok: true,
                value: {
                    output: stdout || '(empty output)',
                    data: {
                        stdout,
                        stderr,
                        exitCode: exitCode ?? 0,
                        memoryDelta: memDelta,
                        telemetry: {
                            durationMs: Math.round(duration * 1000),
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

    public async healthCheck(): Promise<{ online: boolean; details: string }> {
        const load = loadavg()[0].toFixed(2);
        const free = (freemem() / (1024 * 1024 * 1024)).toFixed(2);
        const total = (totalmem() / (1024 * 1024 * 1024)).toFixed(2);
        const uptime = (process.uptime() / 3600).toFixed(1);
        
        return {
            online: true,
            details: `Shell Engine: ONLINE (Load: ${load}, Free: ${free}GB / ${total}GB, Uptime: ${uptime}h)`
        };
    }
}
