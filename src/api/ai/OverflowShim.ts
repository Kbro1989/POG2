/**
 * OverflowShim — VRAM-aware inference fallback selector.
 *
 * Bridges the TypeScript TernaryRouter to the Python `pog2.inference.overflow`
 * shim. Shells out to Python to probe free VRAM, estimate model + KV cache
 * footprint, and pick the first model in a fallback chain that physically fits
 * in the available GPU memory.
 *
 * Design rules:
 *   - The TS side does NOT reimplement the VRAM math. It asks Python.
 *   - If Python is missing or the shim hangs > 5s, return a degraded result
 *     so POG2 keeps using its static fallback chain (no hard failure).
 *   - The shim is opt-in. Only the 3 highest-stakes call sites
 *     (Yang / YinYang / Orchestrator) consult it.
 *
 * Upstream:   TernaryRouter.findWorkingModelAsync()
 * Downstream: `python -m pog2.inference.overflow {probe|check|pick}`
 */

import { execFile } from 'child_process';
import { platform } from 'os';
import { createLogger } from '../../utils/logger.js';

const logger = createLogger('OverflowShim');

export type VramTier = 'mini' | 'puppeteer' | 'pro' | 'cpu';

export type FitStatus = 'ok' | 'tight' | 'clamped' | 'impossible';

export interface OverflowResult {
    /** Model name to actually use (may differ from preferred if overflowed). */
    model: string;
    /** Context window in tokens, clamped to fit available VRAM. */
    ctx: number;
    /** Number of GPU layers: 99 = all / 50 = partial / 0 = CPU-only. */
    num_gpu: number;
    /** Detected or configured VRAM tier. */
    tier: VramTier;
    /** Whether the requested model fits at the requested ctx. */
    fit_status: FitStatus;
    /** Human-readable reason if a fallback was chosen or ctx was clamped. */
    reason?: string;
}

export interface ProbeResult {
    /** Free VRAM in MiB, or 0 if no GPU / probe failed. */
    freeVramMb: number;
    /** Active tier after auto-detection / env override. */
    tier: VramTier;
    /** Per-tier ctx default (from VRAM_TIERS). */
    ctxDefault: number;
    /** Per-tier ctx hard ceiling. */
    ctxMax: number;
}

const SHIM_TIMEOUT_MS = 5_000;

/**
 * Detect whether this process is running inside WSL.
 * Used to decide whether to wrap the python invocation in `wsl.exe -e`.
 *
 * Why this matters: `nvidia-smi` is a Linux binary. The WSL ollama server
 * (`/etc/systemd/system/ollama.service`, port 11434) is a Linux process.
 * If POG2 runs from a Windows shell and inherits a Windows `python3`
 * (e.g. C:\Users\krist\AppData\Local\Programs\Python\Python311\python.exe),
 * the shim cannot see the GPU and silently degrades. Routing through
 * `wsl.exe -e python3 -m pog2.inference.overflow` puts us back on the
 * Linux side where `nvidia-smi` works.
 */
function isWSL(): boolean {
    if (platform() !== 'linux') return false;
    try {
        // /proc/version on WSL contains "microsoft" or "WSL".
        const release = require('fs').readFileSync('/proc/version', 'utf8').toLowerCase();
        return release.includes('microsoft') || release.includes('wsl');
    } catch {
        return false;
    }
}

/**
 * Discover the Python interpreter.
 *
 * Resolution order:
 *   1. POG2_PYTHON env var (explicit override)
 *   2. On WSL: `python3` (the Linux interpreter — sees nvidia-smi)
 *   3. On Windows: try `python3`, `python`, and `py` (Windows launcher)
 *   4. From a Windows shell: `wsl.exe -e python3 ...` as a final fallback,
 *      which puts us back on the Linux side.
 */
interface ResolvedPython {
    cmd: string;
    prefixArgs: string[];  // Args to pass BEFORE `-m pog2.inference.overflow`
}

function discoverPython(): ResolvedPython[] {
    const candidates: ResolvedPython[] = [];
    const fromEnv = process.env.POG2_PYTHON;
    if (fromEnv && fromEnv.trim().length > 0) {
        // If env override is a Windows path, route through wsl.exe so we
        // land on the Linux python that can see nvidia-smi.
        if (platform() === 'win32' && /[a-z]:[\\/]/i.test(fromEnv)) {
            candidates.push({ cmd: 'wsl.exe', prefixArgs: ['-e', fromEnv.trim()] });
        } else {
            candidates.push({ cmd: fromEnv.trim(), prefixArgs: [] });
        }
    }

    if (isWSL()) {
        // We're already on Linux — plain python3 is correct.
        candidates.push({ cmd: 'python3', prefixArgs: [] });
    } else if (platform() === 'win32') {
        // Running from a Windows shell. Try native Windows pythons first
        // (they exist for non-GPU ops), then fall back to wsl.exe -e
        // python3 for the GPU-aware probe.
        candidates.push({ cmd: 'python3', prefixArgs: [] });
        candidates.push({ cmd: 'python', prefixArgs: [] });
        candidates.push({ cmd: 'py', prefixArgs: ['-3'] });
        // Final fallback: route through WSL's python3, which can see
        // nvidia-smi and the systemd ollama process.
        candidates.push({ cmd: 'wsl.exe', prefixArgs: ['-e', 'python3'] });
    } else {
        // Plain Linux.
        candidates.push({ cmd: 'python3', prefixArgs: [] });
    }

    return candidates;
}

interface ExecResult {
    stdout: string;
    stderr: string;
}

function execShim(args: string[]): Promise<ExecResult> {
    return new Promise((resolve, reject) => {
        const candidates = discoverPython();

        const tryNext = (idx: number) => {
            if (idx >= candidates.length) {
                reject(new Error(
                    'No working python interpreter found. ' +
                    'Tried: ' + candidates.map(c => `${c.cmd} ${c.prefixArgs.join(' ')}`.trim()).join(', ')
                ));
                return;
            }
            const { cmd, prefixArgs } = candidates[idx];
            execFile(
                cmd,
                [...prefixArgs, '-m', 'pog2.inference.overflow', ...args],
                { timeout: SHIM_TIMEOUT_MS, maxBuffer: 1024 * 1024 },
                (err, stdout, stderr) => {
                    if (err) {
                        // Try next interpreter.
                        logger.debug(
                            { cmd, prefixArgs, err: err.message },
                            'python candidate failed, trying next'
                        );
                        tryNext(idx + 1);
                        return;
                    }
                    resolve({ stdout: stdout.toString(), stderr: stderr.toString() });
                }
            );
        };

        tryNext(0);
    });
}

/**
 * Degraded fallback — used when Python is unreachable or the shim times out.
 * POG2 keeps working with its static fallback lists; we just signal "we don't
 * know, assume tight" so callers can log it.
 */
function degradedResult(model: string, ctx: number, reason: string): OverflowResult {
    return {
        model,
        ctx,
        num_gpu: 50, // middle ground: partial offload
        tier: 'mini',
        fit_status: 'tight',
        reason,
    };
}

function degradedProbe(reason: string): ProbeResult {
    return { freeVramMb: 0, tier: 'cpu', ctxDefault: 4096, ctxMax: 8192 };
}

/**
 * Probe current GPU state and active tier. Cheap call; safe to invoke on
 * each route() decision if the router is so inclined.
 */
export async function probe(): Promise<ProbeResult> {
    try {
        const { stdout } = await execShim(['probe']);
        const data = JSON.parse(stdout.trim());
        return {
            freeVramMb: data.free_vram_mb ?? 0,
            tier: (data.tier ?? 'cpu') as VramTier,
            ctxDefault: data.ctx_default ?? 4096,
            ctxMax: data.ctx_max ?? 8192,
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.warn({ err: msg }, 'OverflowShim.probe degraded to static fallback');
        return degradedProbe(`shim unavailable: ${msg}`);
    }
}

/**
 * Check whether a single model fits at the requested ctx in the current tier.
 */
export async function check(model: string, ctx: number): Promise<OverflowResult> {
    try {
        const { stdout } = await execShim(['check', model, '--ctx', String(ctx)]);
        const data = JSON.parse(stdout.trim());
        return {
            model: data.model ?? model,
            ctx: data.ctx ?? ctx,
            num_gpu: data.num_gpu ?? 50,
            tier: (data.tier ?? 'mini') as VramTier,
            fit_status: (data.fit_status ?? 'tight') as FitStatus,
            reason: data.reason,
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.warn({ model, ctx, err: msg }, 'OverflowShim.check degraded');
        return degradedResult(model, ctx, `shim unavailable: ${msg}`);
    }
}

/**
 * Pick the first model in a fallback chain that physically fits at the
 * requested ctx. If the preferred model fits (even tightly), it wins.
 */
export async function pick(
    preferred: string,
    fallbacks: readonly string[],
    ctx: number
): Promise<OverflowResult> {
    const chain = [preferred, ...fallbacks.filter((f) => f !== preferred)];
    try {
        const { stdout } = await execShim([
            'pick',
            preferred,
            '--fallback', chain.slice(1).join(','),
            '--ctx', String(ctx),
        ]);
        const data = JSON.parse(stdout.trim());
        return {
            model: data.model ?? preferred,
            ctx: data.ctx ?? ctx,
            num_gpu: data.num_gpu ?? 50,
            tier: (data.tier ?? 'mini') as VramTier,
            fit_status: (data.fit_status ?? 'tight') as FitStatus,
            reason: data.reason,
        };
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.warn({ preferred, ctx, err: msg }, 'OverflowShim.pick degraded');
        return degradedResult(preferred, ctx, `shim unavailable: ${msg}`);
    }
}

// `discoverPython()` is called by execShim(); no linter silence needed here.